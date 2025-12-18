# Homepage CMS Schema Documentation

## Overview

The Homepage CMS system provides a flexible, version-controlled content management solution for the VNTG e-commerce homepage. It supports multiple section types, scheduling, rollback capabilities, and is designed for future multi-locale expansion.

**Migration Files:**
- `/Users/michael/Projects/vntg/supabase/migrations/20241217000001_homepage_cms_system.sql`
- `/Users/michael/Projects/vntg/supabase/migrations/20241217000002_homepage_cms_seed_data.sql`

**Last Updated:** December 17, 2025

---

## Table of Contents

1. [Architecture Overview](#architecture-overview)
2. [Database Schema](#database-schema)
3. [Section Types & Content Schemas](#section-types--content-schemas)
4. [API Functions](#api-functions)
5. [Usage Examples](#usage-examples)
6. [Best Practices](#best-practices)
7. [Monitoring & Maintenance](#monitoring--maintenance)

---

## Architecture Overview

### Core Concepts

**Version Control**
- Every content change creates a new version
- Versions are immutable once created
- Easy rollback to any previous version
- Draft and published versions are separate

**Scheduling**
- Sections can be scheduled to publish automatically
- Optional expiration dates for time-limited content
- Background job processes scheduled publishes

**Flexibility**
- JSONB content structure adapts to each section type
- Dynamic product/category associations
- Metadata for customization without schema changes

**Performance**
- Optimized indexes for homepage rendering
- Single query retrieves complete homepage
- RLS policies ensure security without performance penalty

---

## Database Schema

### Core Tables

#### `media_assets`
Stores metadata for uploaded media files (images, videos).

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `file_path` | TEXT | Path in storage bucket |
| `file_name` | TEXT | Original filename |
| `file_size` | INTEGER | File size in bytes |
| `mime_type` | TEXT | MIME type (image/jpeg, video/mp4, etc.) |
| `width` | INTEGER | Image/video width in pixels |
| `height` | INTEGER | Image/video height in pixels |
| `alt_text` | TEXT | Accessibility text |
| `caption` | TEXT | Optional caption |
| `uploaded_by` | UUID | User who uploaded (FK to users) |
| `storage_bucket` | TEXT | Supabase storage bucket name |
| `metadata` | JSONB | Additional metadata |

**Indexes:**
- `idx_media_assets_uploaded_by`
- `idx_media_assets_mime_type`
- `idx_media_assets_created_at`

---

#### `homepage_sections`
Core section metadata, ordering, and status.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_type` | TEXT | Type of section (see Section Types) |
| `section_key` | TEXT | Unique stable identifier (e.g., 'hero-main') |
| `display_order` | INTEGER | Order on homepage (lower = higher) |
| `status` | TEXT | draft / published / archived / scheduled |
| `locale` | TEXT | Language code (ISO 639-1, e.g., 'en', 'he') |
| `is_active` | BOOLEAN | Active flag for quick disable |
| `published_version_id` | UUID | Currently live version (FK to section_versions) |
| `draft_version_id` | UUID | Work-in-progress version (FK to section_versions) |
| `metadata` | JSONB | Section-level settings (CSS, analytics, etc.) |

**Constraints:**
- `section_key` must be unique
- `section_type` must be one of the supported types

**Indexes:**
- `idx_homepage_sections_type`
- `idx_homepage_sections_key`
- `idx_homepage_sections_status`
- `idx_homepage_sections_locale`
- `idx_homepage_sections_render` (composite for homepage queries)

---

#### `section_versions`
Version history with complete content snapshots.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_id` | UUID | Parent section (FK to homepage_sections) |
| `version_number` | INTEGER | Auto-incrementing version number |
| `content` | JSONB | Section content (schema varies by type) |
| `change_summary` | TEXT | Description of changes |
| `created_by` | UUID | User who created version |
| `is_published` | BOOLEAN | Whether this version is currently published |
| `published_at` | TIMESTAMPTZ | When this version was published |

**Constraints:**
- Unique combination of `(section_id, version_number)`
- Auto-increments `version_number` per section

**Indexes:**
- `idx_section_versions_section`
- `idx_section_versions_published`
- `idx_section_versions_history` (composite)

---

#### `section_schedules`
Scheduling rules for automated publishing/expiration.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_id` | UUID | Section to publish (FK to homepage_sections) |
| `version_id` | UUID | Version to publish (FK to section_versions) |
| `publish_at` | TIMESTAMPTZ | When to publish |
| `expire_at` | TIMESTAMPTZ | Optional expiration timestamp |
| `status` | TEXT | pending / active / expired / cancelled |
| `executed_at` | TIMESTAMPTZ | When schedule was executed |
| `created_by` | UUID | User who created schedule |
| `notes` | TEXT | Admin notes |

**Constraints:**
- `expire_at` must be after `publish_at`
- `status` must be one of the valid states

**Indexes:**
- `idx_section_schedules_pending` (for cron job)
- `idx_section_schedules_publish_at`
- `idx_section_schedules_expire_at`

---

#### `section_products`
Many-to-many association for product carousels.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_id` | UUID | Section (FK to homepage_sections) |
| `product_id` | UUID | Product (FK to products) |
| `display_order` | INTEGER | Order within carousel |
| `metadata` | JSONB | Product-specific overrides (badge, etc.) |

**Indexes:**
- `idx_section_products_section`
- `idx_section_products_order`

---

#### `section_categories`
Many-to-many association for category grids.

| Column | Type | Description |
|--------|------|-------------|
| `id` | UUID | Primary key |
| `section_id` | UUID | Section (FK to homepage_sections) |
| `category_id` | UUID | Category (FK to categories) |
| `display_order` | INTEGER | Order within grid |
| `metadata` | JSONB | Category-specific overrides |

**Indexes:**
- `idx_section_categories_section`
- `idx_section_categories_order`

---

## Section Types & Content Schemas

### 1. Hero Banner (`hero_banner`)

**Purpose:** Large header banner with image/video background, text overlay, and CTAs. Supports carousel with multiple slides.

**Content Schema (JSONB):**

```typescript
{
  slides: Array<{
    id: string;                    // Unique slide identifier
    title: string;                 // Main headline
    subtitle?: string;             // Subheading
    image_url?: string;            // Background image
    video_url?: string;            // Background video (if no image)
    overlay_opacity: number;       // 0-1 for dark overlay
    text_color: string;            // Hex color for text
    text_position: 'left' | 'center' | 'right';
    cta?: {
      text: string;                // Button text
      url: string;                 // Button link
      style: 'primary' | 'secondary' | 'outline';
    };
  }>;
  animation?: 'fade' | 'slide' | 'zoom';
  duration?: number;               // Milliseconds per slide
}
```

**Example:**
```json
{
  "slides": [
    {
      "id": "slide-1",
      "title": "Discover Timeless Vintage",
      "subtitle": "Curated treasures from decades past",
      "image_url": "/images/hero-vintage-1.jpg",
      "overlay_opacity": 0.3,
      "text_color": "#FFFFFF",
      "text_position": "center",
      "cta": {
        "text": "Shop Collection",
        "url": "/shop",
        "style": "primary"
      }
    }
  ],
  "animation": "fade",
  "duration": 5000
}
```

---

### 2. Product Carousel (`product_carousel`)

**Purpose:** Horizontal scrolling carousel of featured products. Product associations are stored in `section_products` table.

**Content Schema (JSONB):**

```typescript
{
  title: string;                   // Section heading
  subtitle?: string;               // Section description
  viewAllLink?: string;            // "View All" link URL
  displayMode: 'carousel' | 'grid';
  showPrice: boolean;              // Show product prices
  showAddToCart: boolean;          // Show add to cart buttons
  badgeText?: string;              // Badge on products (e.g., "Featured")
}
```

**Example:**
```json
{
  "title": "Featured Vintage Finds",
  "subtitle": "Hand-picked treasures just for you",
  "viewAllLink": "/shop?featured=true",
  "displayMode": "carousel",
  "showPrice": true,
  "showAddToCart": true,
  "badgeText": "Featured"
}
```

**Product Association:**
Products are linked via `section_products` table with `display_order` and optional metadata overrides.

---

### 3. Text Block (`text_block`)

**Purpose:** Rich text content block for storytelling, about sections, or informational content.

**Content Schema (JSONB):**

```typescript
{
  title?: string;                  // Optional heading
  content: string;                 // HTML content (sanitized)
  alignment: 'left' | 'center' | 'right';
  maxWidth?: string;               // CSS max-width (e.g., "800px")
  backgroundColor?: string;        // Background color
}
```

**Example:**
```json
{
  "title": "Our Story",
  "content": "<p>Welcome to VNTG, where every item tells a story...</p>",
  "alignment": "center",
  "maxWidth": "800px",
  "backgroundColor": "#F9F9F9"
}
```

---

### 4. Category Grid (`category_grid`)

**Purpose:** Grid layout showcasing product categories. Category associations stored in `section_categories` table.

**Content Schema (JSONB):**

```typescript
{
  title: string;                   // Section heading
  subtitle?: string;               // Section description
  layout: 'grid' | 'masonry';
  columns: number;                 // Grid columns (2, 3, 4, etc.)
  showProductCount: boolean;       // Show number of products per category
  imageStyle: 'cover' | 'contain';
}
```

**Example:**
```json
{
  "title": "Shop by Category",
  "subtitle": "Find exactly what you're looking for",
  "layout": "grid",
  "columns": 3,
  "showProductCount": true,
  "imageStyle": "cover"
}
```

---

### 5. Promo Banner (`promo_banner`)

**Purpose:** Promotional call-to-action banner for sales, events, or announcements.

**Content Schema (JSONB):**

```typescript
{
  title: string;                   // Main promotional text
  subtitle?: string;               // Supporting text
  image_url?: string;              // Background image
  backgroundColor?: string;        // Fallback background color
  textColor?: string;              // Text color
  cta: {
    text: string;                  // Button text
    url: string;                   // Button link
    style: 'primary' | 'secondary' | 'light';
  };
  badge?: {
    text: string;                  // Badge text (e.g., "Limited Time")
    color: string;                 // Badge color
  };
}
```

**Example:**
```json
{
  "title": "Summer Sale 2025",
  "subtitle": "Up to 40% off vintage clothing",
  "backgroundColor": "#FF6B6B",
  "textColor": "#FFFFFF",
  "cta": {
    "text": "Shop Sale",
    "url": "/shop?sale=true",
    "style": "light"
  },
  "badge": {
    "text": "Limited Time",
    "color": "#FFD93D"
  }
}
```

---

### 6. Newsletter (`newsletter`)

**Purpose:** Email newsletter signup form with configurable layout and messaging.

**Content Schema (JSONB):**

```typescript
{
  title: string;                   // Form heading
  subtitle?: string;               // Supporting text
  placeholder: string;             // Input placeholder text
  buttonText: string;              // Submit button text
  image_url?: string;              // Background or side image
  privacyText?: string;            // Privacy policy text
  successMessage: string;          // Post-submission message
  layout: 'inline' | 'split' | 'centered';
}
```

**Example:**
```json
{
  "title": "Stay in the Loop",
  "subtitle": "Get exclusive deals and new arrivals",
  "placeholder": "Enter your email address",
  "buttonText": "Subscribe",
  "privacyText": "We respect your privacy. Unsubscribe anytime.",
  "successMessage": "Thanks for subscribing!",
  "layout": "split"
}
```

---

### 7. Custom HTML (`custom_html`)

**Purpose:** Arbitrary HTML content for maximum flexibility. **Use with caution** - requires HTML sanitization.

**Content Schema (JSONB):**

```typescript
{
  html: string;                    // Raw HTML (must be sanitized)
  containerClass?: string;         // Wrapper CSS class
  sanitize: boolean;               // Whether to sanitize (default: true)
}
```

**Example:**
```json
{
  "html": "<div class='custom-banner'>...</div>",
  "containerClass": "custom-section",
  "sanitize": true
}
```

**Security Note:** Always sanitize custom HTML before rendering to prevent XSS attacks.

---

## API Functions

### `get_homepage_content(locale)`

Optimized function to retrieve complete homepage content in a single query.

**Parameters:**
- `locale` (TEXT, default: 'en'): Language code

**Returns:**
```typescript
Array<{
  section_id: UUID;
  section_type: string;
  section_key: string;
  display_order: number;
  content: JSONB;              // Published version content
  metadata: JSONB;             // Section metadata
  products: JSONB;             // Array of associated products
  categories: JSONB;           // Array of associated categories
}>
```

**Usage:**
```sql
SELECT * FROM get_homepage_content('en');
```

**TypeScript Example:**
```typescript
const { data: sections } = await supabase
  .rpc('get_homepage_content', { p_locale: 'en' });

// sections is an array of complete section data
sections.forEach(section => {
  console.log(section.section_type, section.content);
});
```

---

### `publish_section_version(section_id, version_id, published_by?)`

Atomically publish a version and update section status.

**Parameters:**
- `section_id` (UUID): Section to publish
- `version_id` (UUID): Version to publish
- `published_by` (UUID, optional): User publishing (defaults to auth.uid())

**Returns:**
```typescript
{
  section_id: UUID;
  version_id: UUID;
  version_number: number;
  published_at: timestamp;
}
```

**Usage:**
```typescript
const { data } = await supabase.rpc('publish_section_version', {
  p_section_id: 'section-uuid',
  p_version_id: 'version-uuid'
});
```

**Business Logic:**
1. Validates version belongs to section
2. Unpublishes all previous versions
3. Marks new version as published
4. Updates section's `published_version_id`
5. Sets section status to 'published'

---

### `revert_section_to_version(section_id, version_id, reverted_by?)`

Rollback to a previous version by creating a new version with old content.

**Parameters:**
- `section_id` (UUID): Section to revert
- `version_id` (UUID): Version to revert to
- `reverted_by` (UUID, optional): User reverting

**Returns:**
```typescript
{
  section_id: UUID;
  new_version_id: UUID;
  version_number: number;
  based_on_version: number;
}
```

**Usage:**
```typescript
const { data } = await supabase.rpc('revert_section_to_version', {
  p_section_id: 'section-uuid',
  p_version_id: 'old-version-uuid'
});

// New version created, now publish it
await supabase.rpc('publish_section_version', {
  p_section_id: data.section_id,
  p_version_id: data.new_version_id
});
```

---

### `reorder_homepage_sections(section_orders)`

Bulk update display order of multiple sections.

**Parameters:**
- `section_orders` (JSONB): Array of `{id: UUID, display_order: number}`

**Returns:**
- `INTEGER`: Number of sections reordered

**Usage:**
```typescript
const newOrder = [
  { id: 'section-1-uuid', display_order: 1 },
  { id: 'section-2-uuid', display_order: 2 },
  { id: 'section-3-uuid', display_order: 3 }
];

const { data: count } = await supabase.rpc('reorder_homepage_sections', {
  p_section_orders: newOrder
});
```

---

### `process_scheduled_publishes()`

Background job function to process scheduled publishes and expirations.

**Returns:**
```typescript
Array<{
  section_id: UUID;
  version_id: UUID;
  action: 'published' | 'expired';
}>
```

**Cron Setup:**
```sql
-- Call every 5 minutes via pg_cron or external scheduler
SELECT * FROM process_scheduled_publishes();
```

**Business Logic:**
1. Finds schedules with `status='pending'` and `publish_at <= NOW()`
2. Publishes each version
3. Updates schedule status to 'active'
4. Finds active schedules with `expire_at <= NOW()`
5. Archives expired sections
6. Updates schedule status to 'expired'

---

### `validate_section_content(section_type, content)`

Validates content JSONB against section type requirements.

**Parameters:**
- `section_type` (TEXT): Section type
- `content` (JSONB): Content to validate

**Returns:**
- `BOOLEAN`: true if valid, raises exception if invalid

**Usage:**
Automatically called via trigger on `section_versions` insert/update.

---

## Usage Examples

### Creating a New Hero Banner

```typescript
// 1. Create the section
const { data: section } = await supabase
  .from('homepage_sections')
  .insert({
    section_type: 'hero_banner',
    section_key: 'hero-holiday-2025',
    display_order: 1,
    locale: 'en',
    status: 'draft',
    metadata: {
      cssClasses: 'holiday-hero',
      analyticsTag: 'holiday_2025'
    }
  })
  .select()
  .single();

// 2. Create the first version
const { data: version } = await supabase
  .from('section_versions')
  .insert({
    section_id: section.id,
    content: {
      slides: [
        {
          id: 'slide-1',
          title: 'Holiday Sale 2025',
          subtitle: 'Amazing deals on vintage treasures',
          image_url: '/images/holiday-hero.jpg',
          overlay_opacity: 0.4,
          text_color: '#FFFFFF',
          text_position: 'center',
          cta: {
            text: 'Shop Now',
            url: '/shop?sale=holiday',
            style: 'primary'
          }
        }
      ],
      animation: 'fade',
      duration: 5000
    },
    change_summary: 'Initial holiday hero banner'
  })
  .select()
  .single();

// 3. Publish the version
await supabase.rpc('publish_section_version', {
  p_section_id: section.id,
  p_version_id: version.id
});
```

---

### Creating a Product Carousel

```typescript
// 1. Create section
const { data: section } = await supabase
  .from('homepage_sections')
  .insert({
    section_type: 'product_carousel',
    section_key: 'new-arrivals',
    display_order: 2,
    locale: 'en',
    status: 'draft'
  })
  .select()
  .single();

// 2. Create version with configuration
const { data: version } = await supabase
  .from('section_versions')
  .insert({
    section_id: section.id,
    content: {
      title: 'New Arrivals',
      subtitle: 'Fresh vintage finds this week',
      displayMode: 'carousel',
      showPrice: true,
      showAddToCart: true,
      badgeText: 'New'
    },
    change_summary: 'New arrivals carousel'
  })
  .select()
  .single();

// 3. Associate products
const productIds = ['prod-1-uuid', 'prod-2-uuid', 'prod-3-uuid'];
await supabase
  .from('section_products')
  .insert(
    productIds.map((id, index) => ({
      section_id: section.id,
      product_id: id,
      display_order: index + 1
    }))
  );

// 4. Publish
await supabase.rpc('publish_section_version', {
  p_section_id: section.id,
  p_version_id: version.id
});
```

---

### Scheduling a Promotional Banner

```typescript
// 1. Create promo section
const { data: section } = await supabase
  .from('homepage_sections')
  .insert({
    section_type: 'promo_banner',
    section_key: 'black-friday-2025',
    display_order: 3,
    locale: 'en',
    status: 'draft'
  })
  .select()
  .single();

// 2. Create version
const { data: version } = await supabase
  .from('section_versions')
  .insert({
    section_id: section.id,
    content: {
      title: 'Black Friday Sale',
      subtitle: 'Up to 50% off everything',
      backgroundColor: '#000000',
      textColor: '#FFFFFF',
      cta: {
        text: 'Shop Deals',
        url: '/shop?sale=black-friday',
        style: 'primary'
      }
    },
    change_summary: 'Black Friday 2025 banner'
  })
  .select()
  .single();

// 3. Schedule for Black Friday
const blackFriday = new Date('2025-11-28T00:00:00Z');
const cyberMonday = new Date('2025-12-01T23:59:59Z');

await supabase
  .from('section_schedules')
  .insert({
    section_id: section.id,
    version_id: version.id,
    publish_at: blackFriday.toISOString(),
    expire_at: cyberMonday.toISOString(),
    status: 'pending',
    notes: 'Auto-publish for Black Friday weekend'
  });

// Section will auto-publish on Black Friday and expire after Cyber Monday
```

---

### Updating Existing Content

```typescript
// 1. Fetch current section
const { data: section } = await supabase
  .from('homepage_sections')
  .select('*, draft_version:section_versions!draft_version_id(*)')
  .eq('section_key', 'hero-main')
  .single();

// 2. Create new version with updated content
const updatedContent = {
  ...section.draft_version.content,
  slides: [
    ...section.draft_version.content.slides,
    {
      id: 'slide-3',
      title: 'New Slide',
      subtitle: 'Added content',
      image_url: '/images/new-slide.jpg',
      // ... rest of slide config
    }
  ]
};

const { data: newVersion } = await supabase
  .from('section_versions')
  .insert({
    section_id: section.id,
    content: updatedContent,
    change_summary: 'Added third slide to hero carousel'
  })
  .select()
  .single();

// 3. Update draft reference
await supabase
  .from('homepage_sections')
  .update({ draft_version_id: newVersion.id })
  .eq('id', section.id);

// 4. Publish when ready
await supabase.rpc('publish_section_version', {
  p_section_id: section.id,
  p_version_id: newVersion.id
});
```

---

### Reverting to Previous Version

```typescript
// 1. Get version history
const { data: versions } = await supabase
  .from('section_versions')
  .select('*')
  .eq('section_id', 'section-uuid')
  .order('version_number', { ascending: false });

// 2. Select version to revert to (e.g., version 3)
const targetVersion = versions.find(v => v.version_number === 3);

// 3. Revert (creates new version based on old content)
const { data: revertData } = await supabase.rpc('revert_section_to_version', {
  p_section_id: 'section-uuid',
  p_version_id: targetVersion.id
});

// 4. Publish the reverted version
await supabase.rpc('publish_section_version', {
  p_section_id: revertData.section_id,
  p_version_id: revertData.new_version_id
});
```

---

### Fetching Homepage for Rendering

```typescript
// Single optimized query for entire homepage
const { data: sections, error } = await supabase
  .rpc('get_homepage_content', { p_locale: 'en' });

// sections contains everything needed to render
sections.forEach(section => {
  switch (section.section_type) {
    case 'hero_banner':
      renderHeroSection(section.content);
      break;

    case 'product_carousel':
      renderProductCarousel(section.content, section.products);
      break;

    case 'category_grid':
      renderCategoryGrid(section.content, section.categories);
      break;

    // ... other section types
  }
});
```

---

## Best Practices

### Version Control

**Always Create New Versions**
- Never update existing versions directly
- Each content change = new version
- Maintain complete audit trail

**Meaningful Change Summaries**
```typescript
// Good
change_summary: 'Updated hero CTA from "Learn More" to "Shop Now"'

// Bad
change_summary: 'Updated section'
```

**Test Draft Before Publishing**
```typescript
// Create draft version
const version = await createDraftVersion(content);

// Preview draft in staging
previewDraft(version.id);

// Publish only after review
await publishVersion(version.id);
```

---

### Performance Optimization

**Use `get_homepage_content()` for Rendering**
```typescript
// Good - Single query with joins
const sections = await supabase.rpc('get_homepage_content', { p_locale: 'en' });

// Bad - Multiple queries
const sections = await supabase.from('homepage_sections').select('*');
for (const section of sections) {
  const version = await supabase.from('section_versions')...
  const products = await supabase.from('section_products')...
}
```

**Cache Homepage Data**
```typescript
// Next.js with ISR (Incremental Static Regeneration)
export async function generateStaticParams() {
  return [{ locale: 'en' }, { locale: 'he' }];
}

export const revalidate = 300; // Revalidate every 5 minutes

export default async function HomePage({ params }) {
  const sections = await getHomepageContent(params.locale);
  return <Homepage sections={sections} />;
}
```

**Index Optimization**
- Homepage rendering uses `idx_homepage_sections_render` composite index
- Products/categories use their respective order indexes
- Queries are designed to use covering indexes

---

### Security

**RLS Policy Verification**
```sql
-- Test public access (should only see published)
SET ROLE anon;
SELECT * FROM homepage_sections; -- Only published, active sections

-- Test admin access (should see all)
SET ROLE authenticated;
SET request.jwt.claims.user_id = 'admin-user-uuid';
SELECT * FROM homepage_sections; -- All sections
```

**Content Sanitization**
```typescript
import DOMPurify from 'isomorphic-dompurify';

function renderCustomHTML(section) {
  const { html, sanitize = true } = section.content;

  if (sanitize) {
    return DOMPurify.sanitize(html, {
      ALLOWED_TAGS: ['p', 'div', 'span', 'a', 'img', 'strong', 'em'],
      ALLOWED_ATTR: ['href', 'src', 'alt', 'class']
    });
  }

  // Only render unsanitized HTML for admin previews
  return html;
}
```

**Media Upload Validation**
```typescript
async function uploadMedia(file: File) {
  // Validate file type
  const allowedTypes = ['image/jpeg', 'image/png', 'image/webp', 'video/mp4'];
  if (!allowedTypes.includes(file.type)) {
    throw new Error('Invalid file type');
  }

  // Validate file size (max 10MB)
  if (file.size > 10 * 1024 * 1024) {
    throw new Error('File too large');
  }

  // Upload to Supabase Storage
  const { data, error } = await supabase.storage
    .from('homepage-media')
    .upload(`${Date.now()}-${file.name}`, file);

  if (error) throw error;

  // Store metadata
  await supabase.from('media_assets').insert({
    file_path: data.path,
    file_name: file.name,
    file_size: file.size,
    mime_type: file.type
  });

  return data;
}
```

---

### Multi-Locale Support

**Locale-Specific Sections**
```typescript
// Create English version
await supabase.from('homepage_sections').insert({
  section_key: 'hero-main',
  locale: 'en',
  // ... content
});

// Create Hebrew version (same key, different locale)
await supabase.from('homepage_sections').insert({
  section_key: 'hero-main',
  locale: 'he',
  // ... content in Hebrew
});

// Fetch by locale
const sections = await supabase.rpc('get_homepage_content', { p_locale: 'he' });
```

**Translation Workflow**
1. Create and publish English version
2. Clone section with new locale
3. Translate content in draft version
4. Review and publish translated version

---

## Monitoring & Maintenance

### Scheduled Publish Monitoring

**Setup Cron Job**
```sql
-- Using pg_cron extension
SELECT cron.schedule(
  'process-scheduled-publishes',
  '*/5 * * * *', -- Every 5 minutes
  $$SELECT process_scheduled_publishes()$$
);
```

**External Scheduler (GitHub Actions, Cloud Functions)**
```typescript
// Serverless function triggered by cron
export async function processSchedules() {
  const { data, error } = await supabase.rpc('process_scheduled_publishes');

  if (error) {
    console.error('Schedule processing failed:', error);
    // Alert ops team
    return;
  }

  console.log(`Processed ${data.length} schedules:`, data);

  // Optional: Trigger cache invalidation
  await invalidateHomepageCache();
}
```

---

### Version Cleanup

**Archive Old Versions**
```sql
-- Keep only last 50 versions per section
WITH ranked_versions AS (
  SELECT
    id,
    section_id,
    ROW_NUMBER() OVER (
      PARTITION BY section_id
      ORDER BY version_number DESC
    ) as rn
  FROM section_versions
  WHERE is_published = false
)
DELETE FROM section_versions
WHERE id IN (
  SELECT id FROM ranked_versions WHERE rn > 50
);
```

---

### Analytics Integration

**Track Section Performance**
```typescript
// Log section impressions
function trackSectionView(sectionKey: string) {
  analytics.track('Homepage Section Viewed', {
    section_key: sectionKey,
    timestamp: new Date().toISOString()
  });
}

// Track CTA clicks
function trackCTAClick(sectionKey: string, ctaText: string, ctaUrl: string) {
  analytics.track('Homepage CTA Clicked', {
    section_key: sectionKey,
    cta_text: ctaText,
    cta_url: ctaUrl
  });
}
```

---

### Database Maintenance

**Regular Index Maintenance**
```sql
-- Reindex for performance (run monthly)
REINDEX TABLE homepage_sections;
REINDEX TABLE section_versions;
REINDEX TABLE section_schedules;
```

**Vacuum Analysis**
```sql
-- Update statistics for query planner
ANALYZE homepage_sections;
ANALYZE section_versions;
ANALYZE section_products;
ANALYZE section_categories;
```

---

## Troubleshooting

### Common Issues

**Issue: Section not appearing on homepage**

Checklist:
1. Verify section status is 'published'
2. Verify `is_active = true`
3. Verify `published_version_id` is set
4. Check RLS policies with current user role
5. Verify locale matches

```sql
SELECT
  id,
  section_key,
  status,
  is_active,
  published_version_id,
  locale
FROM homepage_sections
WHERE section_key = 'hero-main';
```

**Issue: Scheduled publish not executing**

Check schedule status:
```sql
SELECT * FROM section_schedules
WHERE status = 'pending'
  AND publish_at <= NOW()
ORDER BY publish_at;
```

Manually trigger:
```sql
SELECT * FROM process_scheduled_publishes();
```

**Issue: Version validation failing**

Check content against schema:
```sql
SELECT validate_section_content('hero_banner', '{
  "slides": [
    {
      "title": "Test",
      "image_url": "/test.jpg"
    }
  ]
}'::JSONB);
```

---

## Migration Checklist

When deploying to production:

- [ ] Run migration `20241217000001_homepage_cms_system.sql`
- [ ] Run seed data `20241217000002_homepage_cms_seed_data.sql` (optional)
- [ ] Verify RLS policies with test users
- [ ] Set up scheduled publish cron job
- [ ] Configure media storage bucket permissions
- [ ] Update TypeScript types (see types section below)
- [ ] Implement frontend components for each section type
- [ ] Set up cache invalidation on publish
- [ ] Configure monitoring/alerts
- [ ] Document content editor workflow

---

## TypeScript Types

```typescript
// types/homepage-cms.ts

export type SectionType =
  | 'hero_banner'
  | 'product_carousel'
  | 'text_block'
  | 'category_grid'
  | 'promo_banner'
  | 'newsletter'
  | 'custom_html';

export type SectionStatus = 'draft' | 'published' | 'archived' | 'scheduled';

export interface HomepageSection {
  id: string;
  section_type: SectionType;
  section_key: string;
  display_order: number;
  status: SectionStatus;
  locale: string;
  is_active: boolean;
  published_version_id?: string;
  draft_version_id?: string;
  metadata: Record<string, any>;
  created_at: string;
  updated_at: string;
}

export interface SectionVersion {
  id: string;
  section_id: string;
  version_number: number;
  content: SectionContent;
  change_summary?: string;
  created_by?: string;
  is_published: boolean;
  published_at?: string;
  created_at: string;
}

export type SectionContent =
  | HeroBannerContent
  | ProductCarouselContent
  | TextBlockContent
  | CategoryGridContent
  | PromoBannerContent
  | NewsletterContent
  | CustomHTMLContent;

export interface HeroBannerContent {
  slides: Array<{
    id: string;
    title: string;
    subtitle?: string;
    image_url?: string;
    video_url?: string;
    overlay_opacity: number;
    text_color: string;
    text_position: 'left' | 'center' | 'right';
    cta?: {
      text: string;
      url: string;
      style: 'primary' | 'secondary' | 'outline';
    };
  }>;
  animation?: 'fade' | 'slide' | 'zoom';
  duration?: number;
}

// ... other content type interfaces
```

---

## Support & Resources

**Documentation:**
- Schema: `/supabase/migrations/20241217000001_homepage_cms_system.sql`
- Seed Data: `/supabase/migrations/20241217000002_homepage_cms_seed_data.sql`
- This Guide: `/docs/HOMEPAGE_CMS_SCHEMA.md`

**Related Systems:**
- Collections: `/supabase/migrations/20241217000000_collections_system.sql`
- Products: `/supabase/migrations/20240101000000_initial_schema.sql`

**For Questions:**
- Review existing migrations for patterns
- Check RLS policies for permission issues
- Verify indexes for performance problems
- Test functions with sample data

---

**Last Updated:** December 17, 2025
**Version:** 1.0.0
**Maintainer:** VNTG Development Team

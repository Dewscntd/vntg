# Homepage CMS Frontend Architecture

## Overview

A scalable, type-safe CMS system for managing homepage content in a Next.js 15 e-commerce application. Built with SOLID principles, separation of concerns, and composable architecture.

## Architecture Principles

### 1. Domain-Driven Design (DDD)
- Clear bounded context: CMS domain is completely isolated
- Type system models business logic (Section, Homepage, etc.)
- Domain models are framework-agnostic

### 2. Separation of Concerns
- **Types Layer**: Pure TypeScript types and interfaces (`/types/cms.ts`)
- **Validation Layer**: Zod schemas for runtime validation (`/lib/validations/cms.ts`)
- **State Management**: React Context with reducer pattern (`/lib/context/cms-context.tsx`)
- **Presentation Layer**: Separate admin and storefront components
- **Data Layer**: API routes handle all data persistence

### 3. Composition Over Inheritance
- Section components compose smaller, reusable parts
- Product carousel is reusable across multiple section types
- Editors compose form fields and controls

### 4. Single Responsibility Principle
- Each component has ONE clear purpose:
  - `HomepageRenderer`: Renders sections for storefront
  - `SectionListEditor`: Manages section list and ordering
  - `SectionEditor`: Routes to type-specific editors
  - `PreviewPanel`: Handles preview rendering
  - `PublishControls`: Manages publish state

## Directory Structure

```
/types/
  cms.ts                          # Core type definitions

/lib/
  validations/
    cms.ts                        # Zod validation schemas
  context/
    cms-context.tsx               # State management

/components/cms/
  # Storefront Components (Server + Client)
  homepage-renderer.tsx           # Main renderer
  sections/
    hero-section.tsx              # Hero implementation
    product-carousel.tsx          # Reusable carousel
    product-carousel-section.tsx  # Carousel as standalone section
    text-block-section.tsx
    image-banner-section.tsx
    category-grid-section.tsx

  # Admin Components (Client-only)
  admin/
    section-list-editor.tsx       # Drag-drop section list
    section-editor.tsx            # Section editor router
    preview-panel.tsx             # Live preview
    publish-controls.tsx          # Save/publish UI
    editors/
      hero-section-editor.tsx     # Hero-specific editor
      product-carousel-section-editor.tsx
      text-block-section-editor.tsx
      image-banner-section-editor.tsx
      category-grid-section-editor.tsx

/app/[locale]/
  admin/cms/
    page.tsx                      # Main admin CMS page
  page.tsx                        # Homepage (uses HomepageRenderer)
```

## Type System

### Core Types

```typescript
// Base section interface
interface BaseSection {
  id: string;
  type: SectionType;
  status: SectionStatus;
  order: number;
  visible: boolean;
  created_at: string;
  updated_at: string;
}

// Section types (discriminated union)
type Section =
  | HeroSection
  | ProductCarouselSection
  | TextBlockSection
  | ImageBannerSection
  | CategoryGridSection;

// Homepage configuration
interface Homepage {
  id: string;
  sections: Section[];
  status: 'draft' | 'published';
  published_at?: string;
}
```

### Type Safety Benefits

1. **Exhaustive Pattern Matching**: TypeScript ensures all section types are handled
2. **Runtime Validation**: Zod schemas validate data at runtime
3. **Type Inference**: Forms automatically get correct types from schemas
4. **Refactoring Safety**: Changing types updates all usage sites

## State Management

### CMS Context Pattern

Follows the same proven pattern as `cart-context.tsx`:

```typescript
// State
interface CMSState {
  homepage: Homepage | null;
  isLoading: boolean;
  isSaving: boolean;
  isDirty: boolean;
  activeSection: string | null;
  previewMode: boolean;
}

// Actions
interface CMSContextType {
  // CRUD operations
  loadHomepage: () => Promise<void>;
  saveHomepage: () => Promise<void>;
  publishHomepage: () => Promise<void>;

  // Section operations
  addSection: (section) => void;
  updateSection: (id, updates) => void;
  deleteSection: (id) => void;
  reorderSections: (sections) => void;
}
```

### Optimistic Updates

- Section reordering happens immediately
- Auto-save debounced to 3 seconds after last change
- Optimistic UI updates while API calls in flight
- Rollback on error (future enhancement)

### Auto-Save Strategy

```typescript
useEffect(() => {
  if (isDirty && homepage && !isSaving) {
    const timeout = setTimeout(() => {
      saveHomepage();
    }, 3000);

    return () => clearTimeout(timeout);
  }
}, [isDirty, homepage, isSaving]);
```

## Component Architecture

### Storefront Components

#### HomepageRenderer (Server Component)
```typescript
// Renders sections in order, filtering by visibility
function HomepageRenderer({ sections, isPreview }) {
  const visibleSections = isPreview
    ? sections
    : sections.filter(s => s.visible && s.status === 'published');

  return sections.map(section => (
    <SectionRenderer section={section} />
  ));
}
```

**Characteristics:**
- Can be server-rendered for SEO
- No client state
- Pure rendering logic

#### Section Components (Client Components)
```typescript
// Example: HeroSection
'use client';

function HeroSection({ section, isPreview }) {
  const { config } = section;

  // GSAP animations
  useEffect(() => {
    if (config.animation?.enabled) {
      gsap.from(contentRef.current, { ...animationConfig });
    }
  }, [config.animation]);

  return (
    <div className={heightClasses[config.height]}>
      {/* Content */}
    </div>
  );
}
```

**Characteristics:**
- Client-side for animations and interactivity
- Receives configuration via props
- Self-contained animation logic

#### ProductCarousel (Reusable Component)

The product carousel is a standalone component used by:
1. Hero sections (embedded carousel)
2. Product carousel sections (standalone)

**Key Features:**
- GSAP-powered animations (slide, fade, scale)
- Draggable support via GSAP Draggable
- Responsive items per view
- Autoplay with pause on interaction
- Customizable card styles and hover effects

### Admin Components

#### SectionListEditor (Drag-Drop List)

Uses `@hello-pangea/dnd` for smooth drag-drop:

```typescript
function SectionListEditor() {
  const { reorderSections } = useCMS();

  const handleDragEnd = (result) => {
    const sections = Array.from(homepage.sections);
    const [removed] = sections.splice(result.source.index, 1);
    sections.splice(result.destination.index, 0, removed);
    reorderSections(sections);
  };

  return (
    <DragDropContext onDragEnd={handleDragEnd}>
      <Droppable droppableId="sections">
        {/* Section cards */}
      </Droppable>
    </DragDropContext>
  );
}
```

#### Section Editors (Type-Specific Forms)

Each section type has a dedicated editor:

```typescript
function HeroSectionEditor({ section }) {
  const { updateSection } = useCMS();

  const form = useForm({
    resolver: zodResolver(heroConfigSchema),
    defaultValues: section.config,
  });

  // Auto-save on form changes
  useEffect(() => {
    const subscription = form.watch(() => {
      if (form.formState.isValid) {
        updateSection(section.id, {
          config: form.getValues()
        });
      }
    });
    return () => subscription.unsubscribe();
  }, [form]);

  return <Form>...</Form>;
}
```

**Features:**
- Tabbed interface for complex forms
- Real-time validation with Zod
- Auto-save on valid changes
- Type-safe form data

#### PreviewPanel (Live Preview)

```typescript
function PreviewPanel() {
  const [viewport, setViewport] = useState<'mobile' | 'tablet' | 'desktop'>('desktop');

  return (
    <div style={{ width: viewportWidths[viewport] }}>
      <HomepageRenderer sections={homepage.sections} isPreview />
    </div>
  );
}
```

## Data Flow

### Loading Homepage

```
1. User navigates to /admin/cms
2. CMSProvider mounts → loadHomepage()
3. Fetch /api/cms/homepage
4. Dispatch SET_HOMEPAGE action
5. Components re-render with data
```

### Editing Section

```
1. User clicks "Edit" on section
2. setActiveSection(sectionId)
3. SectionEditor renders with section data
4. User modifies form field
5. Form validation (Zod)
6. Auto-save debounced (3s)
7. updateSection() → optimistic update
8. API call to /api/cms/homepage
9. Response updates state
```

### Publishing

```
1. User clicks "Publish"
2. publishHomepage()
3. POST /api/cms/homepage/publish
4. Update status to 'published'
5. Set published_at timestamp
6. Revalidate homepage path
7. Update UI state
```

## Performance Optimizations

### 1. Code Splitting
- Admin components not loaded on storefront
- Section editors lazy-loaded as needed
- Dynamic imports for heavy dependencies

### 2. GSAP Animations
- Hardware-accelerated transforms
- RequestAnimationFrame for smooth 60fps
- Cleanup on unmount prevents memory leaks

### 3. Debounced Auto-Save
- Prevents excessive API calls
- Batches rapid changes
- User-friendly "saving..." indicator

### 4. Optimistic Updates
- Immediate UI feedback
- No loading states for reordering
- Better perceived performance

### 5. Server Components
- Homepage rendering can be server-side
- Better SEO and initial load
- Reduced client-side JavaScript

## Validation Strategy

### Two-Layer Validation

**1. TypeScript (Compile-time)**
```typescript
// Type errors caught at build time
const section: HeroSection = {
  type: 'hero',
  config: {
    headline: 'Hello', // ✓ Type-safe
    // textAlignment: missing // ✗ TypeScript error
  }
};
```

**2. Zod (Runtime)**
```typescript
// Runtime validation before API calls
const result = heroConfigSchema.safeParse(formData);
if (!result.success) {
  // Show validation errors
  return result.error.flatten();
}
```

### Form Validation

```typescript
const form = useForm({
  resolver: zodResolver(heroConfigSchema), // Zod integration
  defaultValues: section.config,
});

// Automatic validation on field changes
// Error messages from Zod schema
```

## Animation System

### GSAP Integration

**Hero Section Animations:**
```typescript
const animationTypes = {
  fade: { opacity: 0 },
  slide: { y: 50, opacity: 0 },
  zoom: { scale: 0.9, opacity: 0 },
};

gsap.from(contentRef.current, {
  ...animationTypes[config.animation.type],
  duration: config.animation.duration,
  ease: 'power3.out',
});
```

**Product Carousel:**
```typescript
// Slide animation
gsap.to(trackRef.current, {
  x: offset,
  duration: 0.5,
  ease: 'power2.out',
});

// Draggable support
Draggable.create(trackRef.current, {
  type: 'x',
  inertia: true,
  onDragEnd: () => snapToNearestSlide(),
});
```

**Card Hover Effects:**
```typescript
// Lift effect
gsap.to(card, {
  y: -8,
  boxShadow: '0 12px 24px rgba(0,0,0,0.15)',
  duration: 0.3,
});

// Zoom effect
gsap.to(card.querySelector('img'), {
  scale: 1.05,
  duration: 0.3,
});
```

## API Contract

### GET /api/cms/homepage
```json
{
  "homepage": {
    "id": "uuid",
    "sections": [...],
    "status": "published",
    "published_at": "ISO8601"
  },
  "products": { /* populated products */ },
  "categories": { /* populated categories */ }
}
```

### PUT /api/cms/homepage (Save Draft)
```json
{
  "sections": [...],
  "status": "draft",
  "metadata": { ... }
}
```

### POST /api/cms/homepage/publish
```json
{
  "sections": [...],
  "metadata": { ... }
}
```

## Database Schema

```sql
CREATE TABLE homepages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sections JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB
);

-- Draft and published versions
CREATE TABLE homepage_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homepage_id UUID REFERENCES homepages(id),
  version_number INTEGER NOT NULL,
  sections JSONB NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES users(id)
);
```

## Testing Strategy

### Unit Tests
- Type validation (Zod schemas)
- State reducer logic
- Utility functions

### Component Tests
- Section rendering
- Form validation
- Editor interactions

### Integration Tests
- Full edit flow
- Publish workflow
- Preview mode

### E2E Tests
- Create homepage from scratch
- Add/reorder/delete sections
- Publish and verify on storefront

## Future Enhancements

### 1. Version History
- Store each published version
- Compare versions
- Rollback to previous version

### 2. Scheduling
- Schedule publish/unpublish
- Date range for seasonal sections

### 3. A/B Testing
- Multiple homepage variants
- Traffic splitting
- Analytics integration

### 4. Collaboration
- Real-time editing
- Lock sections being edited
- Change tracking and comments

### 5. Advanced Sections
- Video sections
- Testimonials carousel
- Newsletter signup
- Instagram feed
- Custom HTML blocks

### 6. Template System
- Save section configurations as templates
- Template library
- One-click template application

### 7. Internationalization
- Multi-language content
- Region-specific sections
- Localized products/categories

## Migration Guide

### From Static Homepage

1. **Create Initial Homepage Record**
   ```typescript
   const initialHomepage = {
     sections: [
       // Convert existing components to section configs
     ],
     status: 'published',
   };
   ```

2. **Update Homepage Route**
   ```typescript
   // Before
   export default function HomePage() {
     return <HeroEditorial />; // Static
   }

   // After
   export default async function HomePage() {
     const homepage = await fetchHomepage();
     return <HomepageRenderer sections={homepage.sections} />;
   }
   ```

3. **Add Admin Route**
   - Protect with admin middleware
   - Add to admin navigation

## Best Practices

### 1. Type Safety
- Always use discriminated unions for section types
- Validate at boundaries (API, forms)
- Use `satisfies` for compile-time checks

### 2. Performance
- Lazy load admin components
- Debounce auto-save
- Optimize images with Next.js Image
- Use GSAP for 60fps animations

### 3. Accessibility
- Semantic HTML in sections
- ARIA labels on controls
- Keyboard navigation in editors
- Focus management in dialogs

### 4. Error Handling
- Graceful degradation
- User-friendly error messages
- Retry logic for failed saves
- Validation error display

### 5. State Management
- Keep state minimal and normalized
- Derive computed values
- Use refs for animation targets
- Clean up effects on unmount

## Conclusion

This CMS architecture provides a scalable, maintainable foundation for homepage content management. It follows SOLID principles, emphasizes composition and type safety, and provides excellent developer and user experiences.

The clear separation between admin and storefront components, combined with a robust type system and validation layer, ensures reliability and makes future enhancements straightforward.

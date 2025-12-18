# CMS Implementation Guide

## Quick Start

### 1. Install Dependencies

```bash
npm install @hello-pangea/dnd gsap @hookform/resolvers react-hook-form zod
```

### 2. Database Setup

Create the necessary tables:

```sql
-- Homepage table
CREATE TABLE homepages (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  sections JSONB NOT NULL DEFAULT '[]',
  status VARCHAR(20) NOT NULL DEFAULT 'draft',
  published_at TIMESTAMP,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMP NOT NULL DEFAULT NOW(),
  metadata JSONB,
  CONSTRAINT valid_status CHECK (status IN ('draft', 'published', 'scheduled', 'archived'))
);

-- Create initial homepage
INSERT INTO homepages (sections, status) VALUES ('[]', 'published');

-- Optional: Version history
CREATE TABLE homepage_versions (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  homepage_id UUID REFERENCES homepages(id) ON DELETE CASCADE,
  version_number INTEGER NOT NULL,
  sections JSONB NOT NULL,
  status VARCHAR(20) NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),
  created_by UUID REFERENCES auth.users(id),
  UNIQUE(homepage_id, version_number)
);
```

### 3. API Routes

Create the following API routes:

#### `/app/api/cms/homepage/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { homepageSchema } from '@/lib/validations/cms';

// GET - Fetch homepage
export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const version = searchParams.get('version'); // 'draft' or 'published'

  try {
    const { data, error } = await supabase
      .from('homepages')
      .select('*')
      .single();

    if (error) throw error;

    return NextResponse.json({
      homepage: data,
    });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch homepage' },
      { status: 500 }
    );
  }
}

// PUT - Save homepage (draft)
export async function PUT(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check admin authorization
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    // Validate with Zod
    const validated = homepageSchema.parse(body);

    const { data, error } = await supabase
      .from('homepages')
      .update({
        sections: validated.sections,
        status: 'draft',
        metadata: validated.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', validated.id || (await getHomepageId(supabase)))
      .select()
      .single();

    if (error) throw error;

    return NextResponse.json({ homepage: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to save homepage' },
      { status: 500 }
    );
  }
}

async function getHomepageId(supabase: any) {
  const { data } = await supabase.from('homepages').select('id').single();
  return data?.id;
}
```

#### `/app/api/cms/homepage/publish/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });

  // Check admin authorization
  const {
    data: { session },
  } = await supabase.auth.getSession();

  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const body = await request.json();

    const { data, error } = await supabase
      .from('homepages')
      .update({
        sections: body.sections,
        status: 'published',
        published_at: new Date().toISOString(),
        metadata: body.metadata,
        updated_at: new Date().toISOString(),
      })
      .eq('id', body.id || (await getHomepageId(supabase)))
      .select()
      .single();

    if (error) throw error;

    // Revalidate homepage for ISR
    revalidatePath('/');

    return NextResponse.json({ homepage: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to publish homepage' },
      { status: 500 }
    );
  }
}

async function getHomepageId(supabase: any) {
  const { data } = await supabase.from('homepages').select('id').single();
  return data?.id;
}
```

#### `/app/api/products/batch/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  try {
    const { data, error } = await supabase
      .from('products')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json({ products: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch products' },
      { status: 500 }
    );
  }
}
```

#### `/app/api/categories/batch/route.ts`

```typescript
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function GET(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  const { searchParams } = new URL(request.url);
  const ids = searchParams.get('ids')?.split(',') || [];

  try {
    const { data, error } = await supabase
      .from('categories')
      .select('*')
      .in('id', ids);

    if (error) throw error;

    return NextResponse.json({ categories: data });
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to fetch categories' },
      { status: 500 }
    );
  }
}
```

### 4. Update Homepage Route

Replace `/app/[locale]/page.tsx`:

```typescript
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { HomepageRenderer } from '@/components/cms/homepage-renderer';

export const revalidate = 60; // ISR: revalidate every 60 seconds

export default async function HomePage() {
  const supabase = createServerComponentClient({ cookies });

  const { data: homepage } = await supabase
    .from('homepages')
    .select('*')
    .eq('status', 'published')
    .single();

  if (!homepage || !homepage.sections) {
    // Fallback to static content
    return <div>Homepage not configured</div>;
  }

  return <HomepageRenderer sections={homepage.sections} />;
}
```

### 5. Add Admin Navigation

Update `/components/admin/admin-layout.tsx` to include CMS link:

```typescript
const navItems = [
  // ... existing items
  {
    label: 'Homepage',
    href: '/admin/cms',
    icon: <Layout className="h-5 w-5" />,
  },
];
```

### 6. Protect Admin Route

Update `/middleware.ts` to protect `/admin/cms`:

```typescript
export async function middleware(request: NextRequest) {
  // ... existing code

  // Protect admin routes
  if (request.nextUrl.pathname.startsWith('/admin')) {
    const supabase = createMiddlewareClient({ req: request, res });
    const {
      data: { session },
    } = await supabase.auth.getSession();

    if (!session) {
      return NextResponse.redirect(new URL('/auth/login', request.url));
    }

    // Check admin role
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', session.user.id)
      .single();

    if (user?.role !== 'admin') {
      return NextResponse.redirect(new URL('/', request.url));
    }
  }

  return response;
}
```

## Testing the Implementation

### 1. Access Admin CMS

Navigate to `/admin/cms` (must be logged in as admin).

### 2. Add a Hero Section

1. Click "Add Section"
2. Select "Hero Section"
3. Fill in headline, subheadline
4. Add background image URL
5. Configure CTAs
6. Save and preview

### 3. Add Product Carousel

1. Click "Add Section"
2. Select "Product Carousel"
3. Configure products (manual or dynamic)
4. Set carousel behavior
5. Preview

### 4. Reorder Sections

Drag and drop sections in the list to reorder them.

### 5. Publish

Click "Publish" to make changes live on the homepage.

## Customization Guide

### Adding a New Section Type

#### 1. Define Type in `/types/cms.ts`

```typescript
export interface CustomSection extends BaseSection {
  type: 'custom';
  config: {
    // Your config here
    title: string;
    items: Array<{ id: string; value: string }>;
  };
}

// Add to Section union
export type Section =
  | HeroSection
  | ProductCarouselSection
  | CustomSection; // Add here
```

#### 2. Add Validation in `/lib/validations/cms.ts`

```typescript
export const customSectionSchema = z.object({
  type: z.literal('custom'),
  config: z.object({
    title: z.string().min(1),
    items: z.array(
      z.object({
        id: z.string(),
        value: z.string(),
      })
    ),
  }),
  // ... base fields
});

// Add to union
export const sectionSchema = z.discriminatedUnion('type', [
  heroSectionSchema,
  productCarouselSectionSchema,
  customSectionSchema, // Add here
]);
```

#### 3. Create Section Component

`/components/cms/sections/custom-section.tsx`:

```typescript
export function CustomSection({ section, isPreview }) {
  const { config } = section;

  return (
    <div className="container py-12">
      <h2>{config.title}</h2>
      {config.items.map((item) => (
        <div key={item.id}>{item.value}</div>
      ))}
    </div>
  );
}
```

#### 4. Add to Renderer

In `/components/cms/homepage-renderer.tsx`:

```typescript
function SectionRenderer({ section, isPreview }) {
  switch (section.type) {
    // ... existing cases
    case 'custom':
      return <CustomSection section={section} isPreview={isPreview} />;
  }
}
```

#### 5. Create Editor

`/components/cms/admin/editors/custom-section-editor.tsx`:

```typescript
export function CustomSectionEditor({ section }) {
  const { updateSection } = useCMS();
  const form = useForm({
    resolver: zodResolver(customSectionSchema),
    defaultValues: section.config,
  });

  return <Form>...</Form>;
}
```

#### 6. Add to Editor Router

In `/components/cms/admin/section-editor.tsx`:

```typescript
function SectionEditorRouter({ section }) {
  switch (section.type) {
    // ... existing cases
    case 'custom':
      return <CustomSectionEditor section={section} />;
  }
}
```

#### 7. Add to Admin Page

In `/app/[locale]/admin/cms/page.tsx`:

```typescript
const sectionTypes = [
  // ... existing types
  {
    type: 'custom',
    label: 'Custom Section',
    description: 'Your custom section type',
    icon: <Star className="h-6 w-6" />,
  },
];
```

## Troubleshooting

### Sections Not Rendering

- Check browser console for errors
- Verify section data structure matches types
- Check `visible` and `status` fields

### Drag-Drop Not Working

- Ensure `@hello-pangea/dnd` is installed
- Check that section IDs are unique
- Verify `DragDropContext` wraps `Droppable`

### Auto-Save Not Triggering

- Check form validation (must be valid)
- Verify `isDirty` state is updating
- Check network tab for API calls

### Animations Not Smooth

- Ensure GSAP is loaded
- Check animation duration/easing
- Use hardware-accelerated properties (transform, opacity)

### Preview Not Updating

- Verify state is updating in context
- Check that preview mode is enabled
- Ensure components re-render on state change

## Performance Optimization

### 1. Image Optimization

Use Next.js Image component:

```typescript
<OptimizedImage
  src={config.backgroundImage}
  alt={config.headline}
  fill
  priority
  sizes="100vw"
/>
```

### 2. Code Splitting

Dynamic import heavy components:

```typescript
const RichTextEditor = dynamic(
  () => import('@/components/cms/rich-text-editor'),
  { ssr: false }
);
```

### 3. Memoization

Memoize expensive computations:

```typescript
const sortedSections = useMemo(
  () => [...sections].sort((a, b) => a.order - b.order),
  [sections]
);
```

### 4. Virtual Scrolling

For long section lists, use virtual scrolling:

```typescript
import { FixedSizeList } from 'react-window';

<FixedSizeList
  height={600}
  itemCount={sections.length}
  itemSize={100}
>
  {SectionRow}
</FixedSizeList>
```

## Security Considerations

1. **Authorization**: Always check admin role on API routes
2. **Input Validation**: Use Zod schemas on both client and server
3. **XSS Prevention**: Sanitize rich text content
4. **CSRF Protection**: Use Next.js built-in CSRF protection
5. **Rate Limiting**: Add rate limiting to publish endpoint

## Next Steps

1. Implement remaining section editors
2. Add rich text editor (TipTap or Quill)
3. Add image upload functionality
4. Implement version history
5. Add scheduling functionality
6. Create section templates
7. Add analytics tracking
8. Implement A/B testing

## Support

For questions or issues, refer to:
- `/docs/CMS_ARCHITECTURE.md` for architecture details
- Type definitions in `/types/cms.ts`
- Example implementations in `/components/cms/`

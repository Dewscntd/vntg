-- Collections System Migration
-- Creates tables for product collections/sections (editorial, summer-sale, etc.)

-- Create collections table
CREATE TABLE IF NOT EXISTS public.collections (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  image_url TEXT,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN ('draft', 'active', 'archived')),
  display_order INTEGER NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create collection_products junction table for many-to-many relationship
CREATE TABLE IF NOT EXISTS public.collection_products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  collection_id UUID NOT NULL REFERENCES public.collections(id) ON DELETE CASCADE,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  display_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  UNIQUE(collection_id, product_id)
);

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_collections_slug ON public.collections(slug);
CREATE INDEX IF NOT EXISTS idx_collections_status ON public.collections(status);
CREATE INDEX IF NOT EXISTS idx_collections_display_order ON public.collections(display_order);
CREATE INDEX IF NOT EXISTS idx_collection_products_collection ON public.collection_products(collection_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_product ON public.collection_products(product_id);
CREATE INDEX IF NOT EXISTS idx_collection_products_order ON public.collection_products(collection_id, display_order);

-- Enable Row Level Security
ALTER TABLE public.collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.collection_products ENABLE ROW LEVEL SECURITY;

-- RLS Policies for collections (public read for active, admin write)
CREATE POLICY "Active collections are viewable by everyone" ON public.collections
  FOR SELECT USING (status = 'active');

CREATE POLICY "Admins can view all collections" ON public.collections
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Collections are editable by admins" ON public.collections
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- RLS Policies for collection_products (follows collection visibility)
CREATE POLICY "Collection products viewable when collection is active" ON public.collection_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.collections
      WHERE collections.id = collection_id AND collections.status = 'active'
    )
  );

CREATE POLICY "Admins can view all collection products" ON public.collection_products
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Collection products are editable by admins" ON public.collection_products
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Apply updated_at trigger to collections tables
CREATE TRIGGER handle_collections_updated_at
  BEFORE UPDATE ON public.collections
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

CREATE TRIGGER handle_collection_products_updated_at
  BEFORE UPDATE ON public.collection_products
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Create function to generate slug from name
CREATE OR REPLACE FUNCTION public.generate_collection_slug(collection_name TEXT)
RETURNS TEXT AS $$
BEGIN
  RETURN lower(regexp_replace(regexp_replace(collection_name, '[^a-zA-Z0-9\s]', '', 'g'), '\s+', '-', 'g'));
END;
$$ LANGUAGE plpgsql;

-- Create function to get collection with product count
CREATE OR REPLACE FUNCTION public.get_collection_with_product_count(collection_uuid UUID)
RETURNS TABLE (
  id UUID,
  name TEXT,
  slug TEXT,
  description TEXT,
  image_url TEXT,
  status TEXT,
  display_order INTEGER,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE,
  product_count BIGINT
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    c.id,
    c.name,
    c.slug,
    c.description,
    c.image_url,
    c.status,
    c.display_order,
    c.metadata,
    c.created_at,
    c.updated_at,
    COUNT(cp.product_id) as product_count
  FROM public.collections c
  LEFT JOIN public.collection_products cp ON c.id = cp.collection_id
  WHERE c.id = collection_uuid
  GROUP BY c.id;
END;
$$ LANGUAGE plpgsql;

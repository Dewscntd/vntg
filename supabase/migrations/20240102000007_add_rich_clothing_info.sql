-- Add rich clothing information fields to products table
-- This migration adds material, country_of_origin, care_instructions, season, and collection_year

-- Add new columns for clothing information
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS material TEXT,
ADD COLUMN IF NOT EXISTS country_of_origin TEXT,
ADD COLUMN IF NOT EXISTS care_instructions TEXT,
ADD COLUMN IF NOT EXISTS season TEXT CHECK (season IN ('spring-summer', 'fall-winter', 'all-season')),
ADD COLUMN IF NOT EXISTS collection_year INTEGER CHECK (collection_year >= 1900 AND collection_year <= 2100);

-- Create a settings table for site-wide configuration
CREATE TABLE IF NOT EXISTS public.site_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  key TEXT UNIQUE NOT NULL,
  value JSONB NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Insert default seasonal setting
INSERT INTO public.site_settings (key, value)
VALUES ('active_season', '{"season": "fall-winter", "year": 2024}'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Enable RLS on site_settings
ALTER TABLE public.site_settings ENABLE ROW LEVEL SECURITY;

-- Policy: Anyone can read site settings
CREATE POLICY "Site settings are viewable by everyone"
  ON public.site_settings FOR SELECT
  USING (true);

-- Policy: Only admins can update site settings
CREATE POLICY "Only admins can update site settings"
  ON public.site_settings FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid()
      AND users.role = 'admin'
    )
  );

-- Add comments for documentation
COMMENT ON COLUMN public.products.material IS 'Material composition (e.g., "100% Cotton", "80% Wool, 20% Cashmere")';
COMMENT ON COLUMN public.products.country_of_origin IS 'Country of manufacture (e.g., "Made in Italy")';
COMMENT ON COLUMN public.products.care_instructions IS 'Care instructions (e.g., "Dry clean only", "Machine wash cold")';
COMMENT ON COLUMN public.products.season IS 'Season/collection (spring-summer, fall-winter, all-season)';
COMMENT ON COLUMN public.products.collection_year IS 'Collection year (e.g., 2024, 2025)';
COMMENT ON TABLE public.site_settings IS 'Site-wide configuration settings including active season';

-- Function to restore product inventory
CREATE OR REPLACE FUNCTION restore_product_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
BEGIN
  -- Update product inventory
  UPDATE public.products 
  SET inventory_count = inventory_count + p_quantity
  WHERE id = p_product_id;
  
  -- Check if update was successful
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found', p_product_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION restore_product_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION restore_product_inventory TO service_role;

-- Function to reduce product inventory (for order creation)
CREATE OR REPLACE FUNCTION reduce_product_inventory(
  p_product_id UUID,
  p_quantity INTEGER
)
RETURNS VOID AS $$
DECLARE
  v_current_inventory INTEGER;
BEGIN
  -- Get current inventory
  SELECT inventory_count INTO v_current_inventory
  FROM public.products
  WHERE id = p_product_id;
  
  -- Check if product exists
  IF NOT FOUND THEN
    RAISE EXCEPTION 'Product with ID % not found', p_product_id;
  END IF;
  
  -- Check if sufficient inventory
  IF v_current_inventory < p_quantity THEN
    RAISE EXCEPTION 'Insufficient inventory. Available: %, Requested: %', v_current_inventory, p_quantity;
  END IF;
  
  -- Update product inventory
  UPDATE public.products 
  SET inventory_count = inventory_count - p_quantity
  WHERE id = p_product_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION reduce_product_inventory TO authenticated;
GRANT EXECUTE ON FUNCTION reduce_product_inventory TO service_role;

-- Add missing order status values
DO $$ 
BEGIN
  -- Drop the existing constraint
  ALTER TABLE public.orders DROP CONSTRAINT IF EXISTS orders_status_check;
  
  -- Add the new constraint with additional status values
  ALTER TABLE public.orders ADD CONSTRAINT orders_status_check 
    CHECK (status IN ('pending', 'processing', 'shipped', 'delivered', 'completed', 'cancelled', 'refunded'));
END $$;

-- Create disputes table for handling Stripe disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id TEXT UNIQUE NOT NULL,
  charge_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  reason TEXT,
  status TEXT NOT NULL,
  evidence_due_by TIMESTAMP WITH TIME ZONE,
  order_id UUID REFERENCES public.orders(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for disputes table
CREATE INDEX IF NOT EXISTS idx_disputes_stripe_id ON public.disputes(stripe_dispute_id);
CREATE INDEX IF NOT EXISTS idx_disputes_charge_id ON public.disputes(charge_id);
CREATE INDEX IF NOT EXISTS idx_disputes_order_id ON public.disputes(order_id);
CREATE INDEX IF NOT EXISTS idx_disputes_status ON public.disputes(status);

-- Enable RLS for disputes
ALTER TABLE public.disputes ENABLE ROW LEVEL SECURITY;

-- RLS Policies for disputes (admin only)
CREATE POLICY "Admins can view all disputes" ON public.disputes
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can manage disputes" ON public.disputes
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Apply updated_at trigger to disputes table
CREATE TRIGGER handle_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add order_number and estimated_delivery columns to orders table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'order_number'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN order_number TEXT UNIQUE;
    CREATE INDEX IF NOT EXISTS idx_orders_order_number ON public.orders(order_number);
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'estimated_delivery'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN estimated_delivery DATE;
  END IF;
  
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN notes TEXT;
  END IF;
END $$;

-- Function to generate order number
CREATE OR REPLACE FUNCTION generate_order_number()
RETURNS TEXT AS $$
DECLARE
  order_num TEXT;
  counter INTEGER;
BEGIN
  -- Generate order number with format: Peakees-YYYYMMDD-XXXX
  SELECT COALESCE(MAX(CAST(SUBSTRING(order_number FROM 'Peakees-[0-9]{8}-([0-9]{4})') AS INTEGER)), 0) + 1
  INTO counter
  FROM public.orders
  WHERE order_number LIKE 'Peakees-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-%';
  
  order_num := 'Peakees-' || TO_CHAR(NOW(), 'YYYYMMDD') || '-' || LPAD(counter::TEXT, 4, '0');
  
  RETURN order_num;
END;
$$ LANGUAGE plpgsql;

-- Function to create order with items atomically
CREATE OR REPLACE FUNCTION create_order_with_items(
  p_user_id UUID,
  p_shipping_address JSONB,
  p_billing_address JSONB,
  p_payment_method_id TEXT,
  p_shipping_method TEXT,
  p_notes TEXT DEFAULT NULL
)
RETURNS TABLE(
  id UUID,
  order_number TEXT,
  status TEXT,
  total DECIMAL,
  estimated_delivery DATE
) AS $$
DECLARE
  v_order_id UUID;
  v_order_number TEXT;
  v_total DECIMAL := 0;
  v_shipping_cost DECIMAL := 0;
  v_tax DECIMAL := 0;
  v_estimated_delivery DATE;
  cart_item RECORD;
BEGIN
  -- Generate order number
  v_order_number := generate_order_number();
  
  -- Calculate estimated delivery based on shipping method
  CASE p_shipping_method
    WHEN 'standard' THEN v_estimated_delivery := CURRENT_DATE + INTERVAL '5-7 days';
    WHEN 'express' THEN v_estimated_delivery := CURRENT_DATE + INTERVAL '2-3 days';
    WHEN 'overnight' THEN v_estimated_delivery := CURRENT_DATE + INTERVAL '1 day';
    ELSE v_estimated_delivery := CURRENT_DATE + INTERVAL '5-7 days';
  END CASE;
  
  -- Calculate shipping cost
  CASE p_shipping_method
    WHEN 'standard' THEN v_shipping_cost := 0.00;
    WHEN 'express' THEN v_shipping_cost := 9.99;
    WHEN 'overnight' THEN v_shipping_cost := 19.99;
    ELSE v_shipping_cost := 0.00;
  END CASE;
  
  -- Calculate total from cart items
  FOR cart_item IN 
    SELECT ci.product_id, ci.quantity, p.price, p.inventory_count, p.name
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id
  LOOP
    -- Check inventory
    IF cart_item.inventory_count < cart_item.quantity THEN
      RAISE EXCEPTION 'Insufficient inventory for product: %', cart_item.name;
    END IF;
    
    v_total := v_total + (cart_item.price * cart_item.quantity);
  END LOOP;
  
  -- Calculate tax (8% for now)
  v_tax := v_total * 0.08;
  v_total := v_total + v_shipping_cost + v_tax;
  
  -- Create the order
  INSERT INTO public.orders (
    user_id,
    order_number,
    status,
    total,
    shipping_address,
    payment_intent_id,
    estimated_delivery,
    notes
  ) VALUES (
    p_user_id,
    v_order_number,
    'pending',
    v_total,
    p_shipping_address,
    p_payment_method_id,
    v_estimated_delivery,
    p_notes
  ) RETURNING orders.id INTO v_order_id;
  
  -- Create order items and update inventory
  FOR cart_item IN 
    SELECT ci.product_id, ci.quantity, p.price
    FROM cart_items ci
    JOIN products p ON ci.product_id = p.id
    WHERE ci.user_id = p_user_id
  LOOP
    -- Insert order item
    INSERT INTO public.order_items (
      order_id,
      product_id,
      quantity,
      price
    ) VALUES (
      v_order_id,
      cart_item.product_id,
      cart_item.quantity,
      cart_item.price
    );
    
    -- Update product inventory
    UPDATE public.products 
    SET inventory_count = inventory_count - cart_item.quantity
    WHERE id = cart_item.product_id;
  END LOOP;
  
  -- Clear the user's cart
  DELETE FROM public.cart_items WHERE user_id = p_user_id;
  
  -- Return order details
  RETURN QUERY
  SELECT 
    v_order_id,
    v_order_number,
    'pending'::TEXT,
    v_total,
    v_estimated_delivery;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION create_order_with_items TO authenticated;

-- Create disputes table for tracking Stripe disputes
CREATE TABLE IF NOT EXISTS public.disputes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  stripe_dispute_id TEXT UNIQUE NOT NULL,
  charge_id TEXT NOT NULL,
  amount INTEGER NOT NULL,
  currency TEXT NOT NULL DEFAULT 'usd',
  reason TEXT,
  status TEXT NOT NULL,
  evidence_due_by TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for disputes
CREATE INDEX IF NOT EXISTS idx_disputes_stripe_dispute_id ON public.disputes(stripe_dispute_id);
CREATE INDEX IF NOT EXISTS idx_disputes_charge_id ON public.disputes(charge_id);
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

-- Apply updated_at trigger to disputes
CREATE TRIGGER handle_disputes_updated_at
  BEFORE UPDATE ON public.disputes
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

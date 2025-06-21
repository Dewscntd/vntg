-- Create return_requests table for tracking return requests
CREATE TABLE IF NOT EXISTS public.return_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  reason TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'completed')),
  admin_notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for return_requests
CREATE INDEX IF NOT EXISTS idx_return_requests_order_id ON public.return_requests(order_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_user_id ON public.return_requests(user_id);
CREATE INDEX IF NOT EXISTS idx_return_requests_status ON public.return_requests(status);

-- Enable RLS for return_requests
ALTER TABLE public.return_requests ENABLE ROW LEVEL SECURITY;

-- RLS Policies for return_requests
CREATE POLICY "Users can view their own return requests" ON public.return_requests
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create return requests for their orders" ON public.return_requests
  FOR INSERT WITH CHECK (
    auth.uid() = user_id AND
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- Admins can view and manage all return requests
CREATE POLICY "Admins can view all return requests" ON public.return_requests
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "Admins can update return requests" ON public.return_requests
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

-- Apply updated_at trigger
CREATE TRIGGER handle_return_requests_updated_at
  BEFORE UPDATE ON public.return_requests
  FOR EACH ROW EXECUTE FUNCTION public.handle_updated_at();

-- Add cancellation_reason column to orders table
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'orders' AND column_name = 'cancellation_reason'
  ) THEN
    ALTER TABLE public.orders ADD COLUMN cancellation_reason TEXT;
  END IF;
END $$;

-- Function to cancel order and restore inventory
CREATE OR REPLACE FUNCTION cancel_order_with_inventory_restore(
  p_order_id UUID,
  p_user_id UUID,
  p_reason TEXT DEFAULT NULL
)
RETURNS VOID AS $$
DECLARE
  order_item RECORD;
BEGIN
  -- Verify order belongs to user and can be cancelled
  IF NOT EXISTS (
    SELECT 1 FROM public.orders 
    WHERE id = p_order_id 
      AND user_id = p_user_id 
      AND status IN ('pending', 'processing')
  ) THEN
    RAISE EXCEPTION 'Order not found or cannot be cancelled';
  END IF;

  -- Update order status to cancelled
  UPDATE public.orders 
  SET 
    status = 'cancelled',
    cancellation_reason = p_reason,
    updated_at = NOW()
  WHERE id = p_order_id AND user_id = p_user_id;

  -- Restore inventory for each order item
  FOR order_item IN 
    SELECT oi.product_id, oi.quantity
    FROM public.order_items oi
    WHERE oi.order_id = p_order_id
  LOOP
    UPDATE public.products 
    SET inventory_count = inventory_count + order_item.quantity
    WHERE id = order_item.product_id;
  END LOOP;

  -- Log the cancellation (optional - could create an audit table)
  INSERT INTO public.order_status_history (order_id, status, notes, created_at)
  VALUES (p_order_id, 'cancelled', p_reason, NOW())
  ON CONFLICT DO NOTHING; -- In case the table doesn't exist yet
  
EXCEPTION
  WHEN OTHERS THEN
    RAISE EXCEPTION 'Failed to cancel order: %', SQLERRM;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION cancel_order_with_inventory_restore TO authenticated;

-- Create order_status_history table for tracking status changes (optional)
CREATE TABLE IF NOT EXISTS public.order_status_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  order_id UUID NOT NULL REFERENCES public.orders(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  notes TEXT,
  created_by UUID REFERENCES public.users(id),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW() NOT NULL
);

-- Create indexes for order_status_history
CREATE INDEX IF NOT EXISTS idx_order_status_history_order_id ON public.order_status_history(order_id);
CREATE INDEX IF NOT EXISTS idx_order_status_history_status ON public.order_status_history(status);

-- Enable RLS for order_status_history
ALTER TABLE public.order_status_history ENABLE ROW LEVEL SECURITY;

-- RLS Policies for order_status_history
CREATE POLICY "Users can view status history for their orders" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.orders 
      WHERE orders.id = order_id AND orders.user_id = auth.uid()
    )
  );

-- Admins can view all order status history
CREATE POLICY "Admins can view all order status history" ON public.order_status_history
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM public.users
      WHERE users.id = auth.uid() AND users.role = 'admin'
    )
  );

CREATE POLICY "System can insert order status history" ON public.order_status_history
  FOR INSERT WITH CHECK (true);

-- Function to automatically log status changes
CREATE OR REPLACE FUNCTION log_order_status_change()
RETURNS TRIGGER AS $$
BEGIN
  -- Only log if status actually changed
  IF OLD.status IS DISTINCT FROM NEW.status THEN
    INSERT INTO public.order_status_history (order_id, status, notes, created_by)
    VALUES (NEW.id, NEW.status, NEW.cancellation_reason, auth.uid());
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically log status changes
CREATE TRIGGER log_order_status_change_trigger
  AFTER UPDATE ON public.orders
  FOR EACH ROW EXECUTE FUNCTION log_order_status_change();

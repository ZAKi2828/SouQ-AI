-- ============================================
-- SQL Migration: Automate Inventory Restocking for Cancelled/Returned Orders
-- ============================================

-- 1. Redefine order insert trigger function to also decrement product master stock
CREATE OR REPLACE FUNCTION decrement_stock_on_order()
RETURNS TRIGGER AS $$
BEGIN
  -- Decrement landing page stock
  UPDATE public.landing_pages
  SET stock = GREATEST(stock - COALESCE(NEW.quantity, 1), 0)
  WHERE id = NEW.landing_page_id AND stock_enabled = true;

  -- Decrement product stock
  IF NEW.product_id IS NOT NULL THEN
      UPDATE public.products
      SET stock_quantity = GREATEST(stock_quantity - COALESCE(NEW.quantity, 1), 0)
      WHERE id = NEW.product_id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 2. Define order update status trigger function to handle restocking/deductions
CREATE OR REPLACE FUNCTION handle_order_status_inventory_change()
RETURNS TRIGGER AS $$
BEGIN
    -- If status is updated to 'cancelled' or 'returned' from an active status, RESTOCK
    IF (NEW.status = 'cancelled' OR NEW.status = 'returned') AND (OLD.status != 'cancelled' AND OLD.status != 'returned') THEN
        -- Restore landing page stock
        IF NEW.landing_page_id IS NOT NULL THEN
            UPDATE public.landing_pages
            SET stock = stock + COALESCE(NEW.quantity, 1)
            WHERE id = NEW.landing_page_id AND stock_enabled = true;
        END IF;

        -- Restore product stock
        IF NEW.product_id IS NOT NULL THEN
            UPDATE public.products
            SET stock_quantity = stock_quantity + COALESCE(NEW.quantity, 1)
            WHERE id = NEW.product_id;
        END IF;

    -- If status is updated FROM 'cancelled' or 'returned' back to an active status, DEDUCT
    ELSIF (NEW.status != 'cancelled' AND NEW.status != 'returned') AND (OLD.status = 'cancelled' OR OLD.status = 'returned') THEN
        -- Deduct landing page stock
        IF NEW.landing_page_id IS NOT NULL THEN
            UPDATE public.landing_pages
            SET stock = GREATEST(stock - COALESCE(NEW.quantity, 1), 0)
            WHERE id = NEW.landing_page_id AND stock_enabled = true;
        END IF;

        -- Deduct product stock
        IF NEW.product_id IS NOT NULL THEN
            UPDATE public.products
            SET stock_quantity = GREATEST(stock_quantity - COALESCE(NEW.quantity, 1), 0)
            WHERE id = NEW.product_id;
        END IF;
    END IF;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 3. Register the UPDATE trigger
DROP TRIGGER IF EXISTS trg_order_status_inventory_change ON orders;
CREATE TRIGGER trg_order_status_inventory_change
AFTER UPDATE OF status ON orders
FOR EACH ROW
EXECUTE FUNCTION handle_order_status_inventory_change();

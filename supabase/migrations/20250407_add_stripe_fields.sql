
-- Add the stripe_payment_intent_id column to the orders table if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 
    FROM information_schema.columns 
    WHERE table_name = 'orders' 
    AND column_name = 'stripe_payment_intent_id'
  ) THEN
    ALTER TABLE orders ADD COLUMN stripe_payment_intent_id TEXT;
  END IF;
END $$;

-- Add slot_interval_min to doctors table
ALTER TABLE public.doctors 
ADD COLUMN IF NOT EXISTS slot_interval_min INTEGER NOT NULL DEFAULT 30;

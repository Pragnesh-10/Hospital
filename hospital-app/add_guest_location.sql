-- Run this script in the Supabase SQL Editor

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS guest_city text,
ADD COLUMN IF NOT EXISTS guest_state text,
ADD COLUMN IF NOT EXISTS guest_country text;

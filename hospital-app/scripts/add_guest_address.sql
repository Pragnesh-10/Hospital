-- Run this SQL in your Supabase SQL Editor (https://supabase.com/dashboard/project/tvkiapnpeqlsvxmsttpy/sql)

ALTER TABLE appointments 
ADD COLUMN IF NOT EXISTS guest_address TEXT;

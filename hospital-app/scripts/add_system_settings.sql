-- Create system_settings table
CREATE TABLE IF NOT EXISTS public.system_settings (
  key TEXT PRIMARY KEY,
  value JSONB NOT NULL
);

-- Insert default values
INSERT INTO public.system_settings (key, value) VALUES 
('allow_guest_bookings', 'true'::jsonb),
('maintenance_mode', 'false'::jsonb),
('certifications', '[
  {"name": "ISO 9001:2015", "description": "Quality Management System"},
  {"name": "NABH Accredited", "description": "National Accreditation Board for Hospitals"},
  {"name": "JCI Accreditation", "description": "Joint Commission International"}
]'::jsonb)
ON CONFLICT (key) DO NOTHING;

-- Create auth_provider enum type
CREATE TYPE auth_provider AS ENUM ('local', 'google');

-- Add new columns to users table
ALTER TABLE users
ADD COLUMN auth_provider auth_provider NOT NULL DEFAULT 'local',
ADD COLUMN provider_user_id VARCHAR(255),
ADD COLUMN profile_picture VARCHAR(255);

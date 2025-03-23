-- Drop new columns from users table
ALTER TABLE users
DROP COLUMN auth_provider,
DROP COLUMN provider_user_id,
DROP COLUMN profile_picture;

-- Drop auth_provider enum type
DROP TYPE auth_provider;

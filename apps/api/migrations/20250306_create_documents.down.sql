-- Add down migration script for documents
DROP TABLE IF EXISTS document_permissions;
DROP TABLE IF EXISTS documents;
DROP TYPE IF EXISTS permission_level;

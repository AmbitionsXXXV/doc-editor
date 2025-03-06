-- Add up migration script for documents
CREATE TYPE permission_level AS ENUM ('read', 'readwrite', 'owner');

-- Create documents table
CREATE TABLE "documents" (
    id UUID NOT NULL PRIMARY KEY DEFAULT (uuid_generate_v4()),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    owner_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    is_public BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create document_permissions table for access control
CREATE TABLE "document_permissions" (
    id UUID NOT NULL PRIMARY KEY DEFAULT (uuid_generate_v4()),
    document_id UUID NOT NULL REFERENCES documents(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    permission_level permission_level NOT NULL DEFAULT 'read',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(document_id, user_id)
);

-- Create indexes to improve query performance
CREATE INDEX documents_owner_id_idx ON documents (owner_id);
CREATE INDEX document_permissions_document_id_idx ON document_permissions (document_id);
CREATE INDEX document_permissions_user_id_idx ON document_permissions (user_id);

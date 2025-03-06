use async_trait::async_trait;
use chrono::{DateTime, Utc};
use sqlx::Error;
use uuid::Uuid;

use super::DBClient;
use super::DbError;
use super::DbResult;

use crate::models::{Document, DocumentPermission, PermissionLevel};

/// Document database operations extension trait
///
/// Defines all operations related to document management in the database
#[async_trait]
pub trait DocumentExt {
    /// Get a document by its ID
    ///
    /// # Arguments
    /// * `document_id` - The unique identifier of the document
    /// * `user_id` - Optional user ID to check permissions
    ///
    /// # Returns
    /// * `Ok(Some(Document))` - Document found
    /// * `Ok(None)` - Document not found
    /// * `Err(DbError)` - Database error
    async fn get_document(
        &self,
        document_id: Uuid,
        user_id: Option<Uuid>,
    ) -> DbResult<Option<Document>>;

    /// Get all documents accessible by a user
    ///
    /// # Arguments
    /// * `user_id` - The user ID to filter by
    /// * `page` - Page number (1-based)
    /// * `limit` - Number of items per page
    ///
    /// # Returns
    /// * `Ok(Vec<Document>)` - List of documents
    /// * `Err(DbError)` - Database error
    async fn get_user_documents(
        &self,
        user_id: Uuid,
        page: u32,
        limit: usize,
    ) -> DbResult<Vec<Document>>;

    /// Create a new document
    ///
    /// # Arguments
    /// * `title` - Document title
    /// * `content` - Document content
    /// * `owner_id` - Owner's user ID
    /// * `is_public` - Whether the document is publicly accessible
    ///
    /// # Returns
    /// * `Ok(Document)` - Created document
    /// * `Err(DbError)` - Database error
    async fn create_document<T: Into<String> + Send>(
        &self,
        title: T,
        content: T,
        owner_id: Uuid,
        is_public: bool,
    ) -> DbResult<Document>;

    /// Update a document
    ///
    /// # Arguments
    /// * `document_id` - Document ID to update
    /// * `title` - New document title (if Some)
    /// * `content` - New document content (if Some)
    /// * `is_public` - New public status (if Some)
    /// * `user_id` - User requesting the update (for permission check)
    ///
    /// # Returns
    /// * `Ok(Document)` - Updated document
    /// * `Err(DbError)` - Database error
    async fn update_document(
        &self,
        document_id: Uuid,
        title: Option<String>,
        content: Option<String>,
        is_public: Option<bool>,
        user_id: Uuid,
    ) -> DbResult<Document>;

    /// Delete a document
    ///
    /// # Arguments
    /// * `document_id` - Document ID to delete
    /// * `user_id` - User requesting the deletion (for permission check)
    ///
    /// # Returns
    /// * `Ok(())` - Document deleted successfully
    /// * `Err(DbError)` - Database error
    async fn delete_document(&self, document_id: Uuid, user_id: Uuid) -> DbResult<()>;

    /// Get total count of documents owned by or shared with a user
    ///
    /// # Arguments
    /// * `user_id` - User ID
    ///
    /// # Returns
    /// * `Ok(i64)` - Count of documents
    /// * `Err(DbError)` - Database error
    async fn get_user_document_count(&self, user_id: Uuid) -> DbResult<i64>;

    /// Share a document with another user
    ///
    /// # Arguments
    /// * `document_id` - Document ID to share
    /// * `user_id` - User to share with
    /// * `permission_level` - Level of access to grant
    /// * `owner_id` - User granting the permission (for permission check)
    ///
    /// # Returns
    /// * `Ok(DocumentPermission)` - Created permission
    /// * `Err(DbError)` - Database error
    async fn share_document(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission>;

    /// Update sharing permissions for a document
    ///
    /// # Arguments
    /// * `permission_id` - Permission ID to update
    /// * `permission_level` - New permission level
    /// * `owner_id` - User updating the permission (for permission check)
    ///
    /// # Returns
    /// * `Ok(DocumentPermission)` - Updated permission
    /// * `Err(DbError)` - Database error
    async fn update_document_permission(
        &self,
        permission_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission>;

    /// Remove sharing permission for a document
    ///
    /// # Arguments
    /// * `permission_id` - Permission ID to remove
    /// * `owner_id` - User removing the permission (for permission check)
    ///
    /// # Returns
    /// * `Ok(())` - Permission removed successfully
    /// * `Err(DbError)` - Database error
    async fn remove_document_permission(&self, permission_id: Uuid, owner_id: Uuid)
    -> DbResult<()>;

    /// Check if a user has permission for a specific action on a document
    ///
    /// # Arguments
    /// * `document_id` - Document ID
    /// * `user_id` - User ID
    /// * `required_permission` - Minimum permission level required
    ///
    /// # Returns
    /// * `Ok(bool)` - Whether the user has permission
    /// * `Err(DbError)` - Database error
    async fn check_document_permission(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        required_permission: PermissionLevel,
    ) -> DbResult<bool>;

    /// Get all permissions for a document
    ///
    /// # Arguments
    /// * `document_id` - Document ID
    /// * `owner_id` - Owner requesting the permissions (for permission check)
    ///
    /// # Returns
    /// * `Ok(Vec<DocumentPermission>)` - List of permissions
    /// * `Err(DbError)` - Database error
    async fn get_document_permissions(
        &self,
        document_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<Vec<DocumentPermission>>;
}

#[async_trait]
impl DocumentExt for DBClient {
    async fn get_document(
        &self,
        document_id: Uuid,
        user_id: Option<Uuid>,
    ) -> DbResult<Option<Document>> {
        let document = sqlx::query_as!(
            Document,
            r#"
            SELECT id, title, content, owner_id, is_public, created_at, updated_at
            FROM documents 
            WHERE id = $1
            "#,
            document_id
        )
        .fetch_optional(self.pool())
        .await
        .map_err(DbError::from)?;

        if let Some(doc) = &document {
            // If document is private and user_id is provided, check permissions
            if !doc.is_public {
                if let Some(user_id) = user_id {
                    if doc.owner_id != user_id {
                        // Check if the user has permission to access this document
                        let has_permission = self
                            .check_document_permission(document_id, user_id, PermissionLevel::Read)
                            .await?;

                        if !has_permission {
                            return Err(DbError::PermissionDenied);
                        }
                    }
                } else {
                    // No user provided for a private document
                    return Err(DbError::PermissionDenied);
                }
            }
        }

        Ok(document)
    }

    async fn get_user_documents(
        &self,
        user_id: Uuid,
        page: u32,
        limit: usize,
    ) -> DbResult<Vec<Document>> {
        let offset = (page - 1) * limit as u32;

        let documents = sqlx::query!(
            r#"
            SELECT d.id as "id!", d.title as "title!", d.content as "content!", 
                   d.owner_id as "owner_id!", d.is_public as "is_public!", 
                   d.created_at, d.updated_at
            FROM documents d
            WHERE d.owner_id = $1
            UNION
            SELECT d.id as "id!", d.title as "title!", d.content as "content!", 
                   d.owner_id as "owner_id!", d.is_public as "is_public!", 
                   d.created_at, d.updated_at
            FROM documents d
            JOIN document_permissions dp ON d.id = dp.document_id
            WHERE dp.user_id = $1
            ORDER BY updated_at DESC
            LIMIT $2 OFFSET $3
            "#,
            user_id,
            limit as i64,
            offset as i64
        )
        .fetch_all(self.pool())
        .await
        .map_err(DbError::from)?;

        let result = documents
            .into_iter()
            .map(|row| Document {
                id: row.id,
                title: row.title,
                content: row.content,
                owner_id: row.owner_id,
                is_public: row.is_public,
                created_at: row.created_at,
                updated_at: row.updated_at,
            })
            .collect();

        Ok(result)
    }

    async fn create_document<T: Into<String> + Send>(
        &self,
        title: T,
        content: T,
        owner_id: Uuid,
        is_public: bool,
    ) -> DbResult<Document> {
        let document = sqlx::query_as!(
            Document,
            r#"
            INSERT INTO documents (title, content, owner_id, is_public)
            VALUES ($1, $2, $3, $4)
            RETURNING id, title, content, owner_id, is_public, created_at, updated_at
            "#,
            title.into(),
            content.into(),
            owner_id,
            is_public
        )
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(document)
    }

    async fn update_document(
        &self,
        document_id: Uuid,
        title: Option<String>,
        content: Option<String>,
        is_public: Option<bool>,
        user_id: Uuid,
    ) -> DbResult<Document> {
        // First check if user has permission to update
        let permission_check = self
            .check_document_permission(document_id, user_id, PermissionLevel::ReadWrite)
            .await?;

        if !permission_check {
            return Err(DbError::PermissionDenied);
        }

        // Get current document to apply partial updates
        let current_doc = self
            .get_document(document_id, Some(user_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        let new_title = title.unwrap_or(current_doc.title);
        let new_content = content.unwrap_or(current_doc.content);
        let new_is_public = is_public.unwrap_or(current_doc.is_public);

        let updated_doc = sqlx::query_as!(
            Document,
            r#"
            UPDATE documents
            SET title = $1, content = $2, is_public = $3, updated_at = NOW()
            WHERE id = $4
            RETURNING id, title, content, owner_id, is_public, created_at, updated_at
            "#,
            new_title,
            new_content,
            new_is_public,
            document_id
        )
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(updated_doc)
    }

    async fn delete_document(&self, document_id: Uuid, user_id: Uuid) -> DbResult<()> {
        // First check if user is the owner
        let document = self
            .get_document(document_id, Some(user_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        if document.owner_id != user_id {
            return Err(DbError::PermissionDenied);
        }

        // Start a transaction to delete permissions first, then the document
        let mut tx = self.begin_transaction().await?;

        // Delete all permissions
        sqlx::query!(
            r#"
            DELETE FROM document_permissions
            WHERE document_id = $1
            "#,
            document_id
        )
        .execute(&mut *tx)
        .await
        .map_err(DbError::from)?;

        // Delete the document
        sqlx::query!(
            r#"
            DELETE FROM documents
            WHERE id = $1
            "#,
            document_id
        )
        .execute(&mut *tx)
        .await
        .map_err(DbError::from)?;

        // Commit the transaction
        tx.commit().await.map_err(DbError::from)?;

        Ok(())
    }

    async fn get_user_document_count(&self, user_id: Uuid) -> DbResult<i64> {
        let count = sqlx::query_scalar!(
            r#"
            SELECT COUNT(DISTINCT d.id)
            FROM documents d
            LEFT JOIN document_permissions dp ON d.id = dp.document_id
            WHERE d.owner_id = $1 OR dp.user_id = $1
            "#,
            user_id
        )
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(count.unwrap_or(0))
    }

    async fn share_document(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission> {
        // Check if the requester is the owner
        let document = self
            .get_document(document_id, Some(owner_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        if document.owner_id != owner_id {
            return Err(DbError::PermissionDenied);
        }

        // Create the permission
        let permission = sqlx::query_as!(
            DocumentPermission,
            r#"
            INSERT INTO document_permissions (document_id, user_id, permission_level)
            VALUES ($1, $2, $3)
            RETURNING id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            "#,
            document_id,
            user_id,
            permission_level as PermissionLevel
        )
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(permission)
    }

    async fn update_document_permission(
        &self,
        permission_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission> {
        // First, get the permission to find the document
        let current_permission = sqlx::query_as!(
            DocumentPermission,
            r#"
            SELECT id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            FROM document_permissions
            WHERE id = $1
            "#,
            permission_id
        )
        .fetch_optional(self.pool())
        .await
        .map_err(DbError::from)?
        .ok_or(DbError::NotFound("Permission not found".to_string()))?;

        // Check if the requester is the document owner
        let document = self
            .get_document(current_permission.document_id, Some(owner_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        if document.owner_id != owner_id {
            return Err(DbError::PermissionDenied);
        }

        // Update the permission
        let updated_permission = sqlx::query_as!(
            DocumentPermission,
            r#"
            UPDATE document_permissions
            SET permission_level = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            "#,
            permission_level as PermissionLevel,
            permission_id
        )
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(updated_permission)
    }

    async fn remove_document_permission(
        &self,
        permission_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<()> {
        // First, get the permission to find the document
        let current_permission = sqlx::query_as!(
            DocumentPermission,
            r#"
            SELECT id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            FROM document_permissions
            WHERE id = $1
            "#,
            permission_id
        )
        .fetch_optional(self.pool())
        .await
        .map_err(DbError::from)?
        .ok_or(DbError::NotFound("Permission not found".to_string()))?;

        // Check if the requester is the document owner
        let document = self
            .get_document(current_permission.document_id, Some(owner_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        if document.owner_id != owner_id {
            return Err(DbError::PermissionDenied);
        }

        // Delete the permission
        sqlx::query!(
            r#"
            DELETE FROM document_permissions
            WHERE id = $1
            "#,
            permission_id
        )
        .execute(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(())
    }

    async fn check_document_permission(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        required_permission: PermissionLevel,
    ) -> DbResult<bool> {
        // First check if user is the owner
        let document = sqlx::query_as!(
            Document,
            r#"
            SELECT id, title, content, owner_id, is_public, created_at, updated_at
            FROM documents 
            WHERE id = $1
            "#,
            document_id
        )
        .fetch_optional(self.pool())
        .await
        .map_err(DbError::from)?
        .ok_or(DbError::DocumentNotFound)?;

        // Owner has all permissions
        if document.owner_id == user_id {
            return Ok(true);
        }

        // Public documents grant read access to everyone
        if document.is_public && required_permission == PermissionLevel::Read {
            return Ok(true);
        }

        // Check for specific permissions
        let permission = sqlx::query_as!(
            DocumentPermission,
            r#"
            SELECT id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            FROM document_permissions
            WHERE document_id = $1 AND user_id = $2
            "#,
            document_id,
            user_id
        )
        .fetch_optional(self.pool())
        .await
        .map_err(DbError::from)?;

        if let Some(perm) = permission {
            match (required_permission, perm.permission_level) {
                // Read permission is granted for ReadWrite or Owner levels too
                (PermissionLevel::Read, PermissionLevel::Read) => Ok(true),
                (PermissionLevel::Read, PermissionLevel::ReadWrite) => Ok(true),
                (PermissionLevel::Read, PermissionLevel::Owner) => Ok(true),

                // ReadWrite permission is granted for ReadWrite or Owner levels
                (PermissionLevel::ReadWrite, PermissionLevel::ReadWrite) => Ok(true),
                (PermissionLevel::ReadWrite, PermissionLevel::Owner) => Ok(true),

                // Owner permission is granted only for Owner level
                (PermissionLevel::Owner, PermissionLevel::Owner) => Ok(true),

                // All other combinations are denied
                _ => Ok(false),
            }
        } else {
            Ok(false)
        }
    }

    async fn get_document_permissions(
        &self,
        document_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<Vec<DocumentPermission>> {
        // Check if the requester is the owner
        let document = self
            .get_document(document_id, Some(owner_id))
            .await?
            .ok_or(DbError::DocumentNotFound)?;

        if document.owner_id != owner_id {
            return Err(DbError::PermissionDenied);
        }

        // Get all permissions
        let permissions = sqlx::query_as!(
            DocumentPermission,
            r#"
            SELECT id, document_id, user_id, permission_level as "permission_level: PermissionLevel", created_at, updated_at
            FROM document_permissions
            WHERE document_id = $1
            "#,
            document_id
        )
        .fetch_all(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(permissions)
    }
}

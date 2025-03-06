use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::{DBClient, DbError, DbResult, DocumentExt};
use crate::models::{Document, DocumentPermission, PermissionLevel};

/// Document repository interface
///
/// Provides methods for managing documents in the system.
/// This follows the repository pattern which abstracts the data access logic.
#[async_trait]
pub trait DocumentRepository: Send + Sync {
    /// Get a document by its ID with permission checking
    async fn get_document(
        &self,
        document_id: Uuid,
        user_id: Option<Uuid>,
    ) -> DbResult<Option<Document>>;

    /// Get all documents accessible by a user
    async fn get_user_documents(
        &self,
        user_id: Uuid,
        page: u32,
        limit: usize,
    ) -> DbResult<Vec<Document>>;

    /// Create a new document
    async fn create_document<T: Into<String> + Send>(
        &self,
        title: T,
        content: T,
        owner_id: Uuid,
        is_public: bool,
    ) -> DbResult<Document>;

    /// Update a document
    async fn update_document(
        &self,
        document_id: Uuid,
        title: Option<String>,
        content: Option<String>,
        is_public: Option<bool>,
        user_id: Uuid,
    ) -> DbResult<Document>;

    /// Delete a document
    async fn delete_document(&self, document_id: Uuid, user_id: Uuid) -> DbResult<()>;

    /// Get total count of documents for a user
    async fn get_user_document_count(&self, user_id: Uuid) -> DbResult<i64>;

    /// Share a document with another user
    async fn share_document(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission>;

    /// Update document permission
    async fn update_document_permission(
        &self,
        permission_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission>;

    /// Remove document permission
    async fn remove_document_permission(&self, permission_id: Uuid, owner_id: Uuid)
    -> DbResult<()>;

    /// Check if a user has permission for a document
    async fn check_document_permission(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        required_permission: PermissionLevel,
    ) -> DbResult<bool>;

    /// Get all permissions for a document
    async fn get_document_permissions(
        &self,
        document_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<Vec<DocumentPermission>>;
}

/// Document repository implementation using the database client
pub struct DbDocumentRepository {
    db_client: Arc<DBClient>,
}

impl DbDocumentRepository {
    /// Create a new document repository with the given database client
    pub fn new(db_client: Arc<DBClient>) -> Self {
        Self { db_client }
    }
}

#[async_trait]
impl DocumentRepository for DbDocumentRepository {
    async fn get_document(
        &self,
        document_id: Uuid,
        user_id: Option<Uuid>,
    ) -> DbResult<Option<Document>> {
        self.db_client.get_document(document_id, user_id).await
    }

    async fn get_user_documents(
        &self,
        user_id: Uuid,
        page: u32,
        limit: usize,
    ) -> DbResult<Vec<Document>> {
        self.db_client
            .get_user_documents(user_id, page, limit)
            .await
    }

    async fn create_document<T: Into<String> + Send>(
        &self,
        title: T,
        content: T,
        owner_id: Uuid,
        is_public: bool,
    ) -> DbResult<Document> {
        self.db_client
            .create_document(title, content, owner_id, is_public)
            .await
    }

    async fn update_document(
        &self,
        document_id: Uuid,
        title: Option<String>,
        content: Option<String>,
        is_public: Option<bool>,
        user_id: Uuid,
    ) -> DbResult<Document> {
        self.db_client
            .update_document(document_id, title, content, is_public, user_id)
            .await
    }

    async fn delete_document(&self, document_id: Uuid, user_id: Uuid) -> DbResult<()> {
        self.db_client.delete_document(document_id, user_id).await
    }

    async fn get_user_document_count(&self, user_id: Uuid) -> DbResult<i64> {
        self.db_client.get_user_document_count(user_id).await
    }

    async fn share_document(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission> {
        self.db_client
            .share_document(document_id, user_id, permission_level, owner_id)
            .await
    }

    async fn update_document_permission(
        &self,
        permission_id: Uuid,
        permission_level: PermissionLevel,
        owner_id: Uuid,
    ) -> DbResult<DocumentPermission> {
        self.db_client
            .update_document_permission(permission_id, permission_level, owner_id)
            .await
    }

    async fn remove_document_permission(
        &self,
        permission_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<()> {
        self.db_client
            .remove_document_permission(permission_id, owner_id)
            .await
    }

    async fn check_document_permission(
        &self,
        document_id: Uuid,
        user_id: Uuid,
        required_permission: PermissionLevel,
    ) -> DbResult<bool> {
        self.db_client
            .check_document_permission(document_id, user_id, required_permission)
            .await
    }

    async fn get_document_permissions(
        &self,
        document_id: Uuid,
        owner_id: Uuid,
    ) -> DbResult<Vec<DocumentPermission>> {
        self.db_client
            .get_document_permissions(document_id, owner_id)
            .await
    }
}

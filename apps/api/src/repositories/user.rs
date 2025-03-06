use async_trait::async_trait;
use chrono::{DateTime, Utc};
use std::sync::Arc;
use uuid::Uuid;

use crate::db::{DBClient, DbError, DbResult, UserExt};
use crate::models::{User, UserRole};

/// User repository interface
///
/// Provides methods for managing users in the system.
/// This follows the repository pattern which abstracts the data access logic.
#[async_trait]
pub trait UserRepository: Send + Sync {
    /// Get a user by various identifiers
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> DbResult<Option<User>>;

    /// Get paginated list of users
    async fn get_users(&self, page: u32, limit: usize) -> DbResult<Vec<User>>;

    /// Create a new user
    async fn create_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        verification_token: T,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<User>;

    /// Get total count of users for pagination
    async fn get_user_count(&self) -> DbResult<i64>;

    /// Update a user's display name
    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        name: T,
    ) -> DbResult<User>;

    /// Update a user's role
    async fn update_user_role(&self, user_id: Uuid, role: UserRole) -> DbResult<User>;

    /// Update a user's password
    async fn update_user_password(&self, user_id: Uuid, password: String) -> DbResult<User>;

    /// Verify a user's token for email verification or password reset
    async fn verify_token(&self, token: &str) -> DbResult<()>;

    /// Add a verification token for email verification or password reset
    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        expires_at: DateTime<Utc>,
    ) -> DbResult<()>;

    /// Check if a user exists by email
    async fn user_exists_by_email(&self, email: &str) -> DbResult<bool>;

    /// Get user by email with error handling
    async fn get_user_by_email(&self, email: &str) -> DbResult<User>;

    /// Get user by ID with error handling
    async fn get_user_by_id(&self, user_id: Uuid) -> DbResult<User>;
}

/// User repository implementation using the database client
pub struct DbUserRepository {
    db_client: Arc<DBClient>,
}

impl DbUserRepository {
    /// Create a new user repository with the given database client
    pub fn new(db_client: Arc<DBClient>) -> Self {
        Self { db_client }
    }
}

#[async_trait]
impl UserRepository for DbUserRepository {
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> DbResult<Option<User>> {
        self.db_client.get_user(user_id, name, email, token).await
    }

    async fn get_users(&self, page: u32, limit: usize) -> DbResult<Vec<User>> {
        self.db_client.get_users(page, limit).await
    }

    async fn create_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        verification_token: T,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<User> {
        self.db_client
            .save_user(name, email, password, verification_token, token_expires_at)
            .await
    }

    async fn get_user_count(&self) -> DbResult<i64> {
        self.db_client.get_user_count().await
    }

    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        name: T,
    ) -> DbResult<User> {
        self.db_client.update_user_name(user_id, name).await
    }

    async fn update_user_role(&self, user_id: Uuid, role: UserRole) -> DbResult<User> {
        self.db_client.update_user_role(user_id, role).await
    }

    async fn update_user_password(&self, user_id: Uuid, password: String) -> DbResult<User> {
        self.db_client.update_user_password(user_id, password).await
    }

    async fn verify_token(&self, token: &str) -> DbResult<()> {
        self.db_client.verified_token(token).await
    }

    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        expires_at: DateTime<Utc>,
    ) -> DbResult<()> {
        self.db_client
            .add_verified_token(user_id, token, expires_at)
            .await
    }

    async fn user_exists_by_email(&self, email: &str) -> DbResult<bool> {
        let user = self
            .db_client
            .get_user(None, None, Some(email), None)
            .await?;
        Ok(user.is_some())
    }

    async fn get_user_by_email(&self, email: &str) -> DbResult<User> {
        self.db_client
            .get_user(None, None, Some(email), None)
            .await?
            .ok_or(DbError::UserNotFound)
    }

    async fn get_user_by_id(&self, user_id: Uuid) -> DbResult<User> {
        self.db_client
            .get_user(Some(user_id), None, None, None)
            .await?
            .ok_or(DbError::UserNotFound)
    }
}

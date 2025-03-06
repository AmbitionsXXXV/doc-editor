use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, TimeZone, Utc};
use sqlx::Error;
use uuid::Uuid;

use super::DBClient;
use super::DbError;
use super::DbResult;

use crate::models::{User, UserRole};

/// User database operations extension trait
///
/// Defines all operations related to user management in the database
#[async_trait]
pub trait UserExt {
    /// Get a user by various identifiers
    ///
    /// # Arguments
    /// * `user_id` - User ID
    /// * `name` - Username
    /// * `email` - User email
    /// * `token` - Verification token
    ///
    /// # Returns
    /// * `Ok(Some(User))` - User found
    /// * `Ok(None)` - User not found
    /// * `Err(DbError)` - Database error
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> DbResult<Option<User>>;

    /// Get paginated list of users
    ///
    /// # Arguments
    /// * `page` - Page number (1-based)
    /// * `limit` - Number of items per page
    ///
    /// # Returns
    /// * `Ok(Vec<User>)` - List of users
    /// * `Err(DbError)` - Database error
    async fn get_users(&self, page: u32, limit: usize) -> DbResult<Vec<User>>;

    /// Create a new user
    ///
    /// # Arguments
    /// * `name` - Username
    /// * `email` - Email address
    /// * `password` - Hashed password
    /// * `verification_token` - Email verification token
    /// * `token_expires_at` - Token expiration time
    ///
    /// # Returns
    /// * `Ok(User)` - Created user
    /// * `Err(DbError)` - Database error
    async fn save_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        verification_token: T,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<User>;

    /// Get total count of users for pagination
    ///
    /// # Returns
    /// * `Ok(i64)` - Count of users
    /// * `Err(DbError)` - Database error
    async fn get_user_count(&self) -> DbResult<i64>;

    /// Update a user's display name
    ///
    /// # Arguments
    /// * `user_id` - User ID to update
    /// * `name` - New display name
    ///
    /// # Returns
    /// * `Ok(User)` - Updated user
    /// * `Err(DbError)` - Database error
    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        name: T,
    ) -> DbResult<User>;

    /// Update a user's role
    ///
    /// # Arguments
    /// * `user_id` - User ID to update
    /// * `role` - New user role
    ///
    /// # Returns
    /// * `Ok(User)` - Updated user
    /// * `Err(DbError)` - Database error
    async fn update_user_role(&self, user_id: Uuid, role: UserRole) -> DbResult<User>;

    /// Update a user's password
    ///
    /// # Arguments
    /// * `user_id` - User ID to update
    /// * `password` - New hashed password
    ///
    /// # Returns
    /// * `Ok(User)` - Updated user
    /// * `Err(DbError)` - Database error
    async fn update_user_password(&self, user_id: Uuid, password: String) -> DbResult<User>;

    /// Verify a user's token for email verification or password reset
    ///
    /// # Arguments
    /// * `token` - Verification token
    ///
    /// # Returns
    /// * `Ok(())` - Token verified successfully
    /// * `Err(DbError)` - Database error
    async fn verified_token(&self, token: &str) -> DbResult<()>;

    /// Add a verification token for email verification or password reset
    ///
    /// # Arguments
    /// * `user_id` - User ID
    /// * `token` - Verification token
    /// * `expires_at` - Token expiration time
    ///
    /// # Returns
    /// * `Ok(())` - Token added successfully
    /// * `Err(DbError)` - Database error
    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        expires_at: DateTime<Utc>,
    ) -> DbResult<()>;
}

/// Implementation of user database operations for the database client
#[async_trait]
impl UserExt for DBClient {
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> DbResult<Option<User>> {
        let mut user: Option<User> = None;

        if let Some(user_id) = user_id {
            user = sqlx::query_as!(
                User,
                r#"SELECT id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole" FROM users WHERE id = $1"#,
                user_id
            ).fetch_optional(self.pool()).await?;
        } else if let Some(name) = name {
            user = sqlx::query_as!(
                User,
                r#"SELECT id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole" FROM users WHERE name = $1"#,
                name
            ).fetch_optional(self.pool()).await?;
        } else if let Some(email) = email {
            user = sqlx::query_as!(
                User,
                r#"SELECT id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole" FROM users WHERE email = $1"#,
                email
            ).fetch_optional(self.pool()).await?;
        } else if let Some(token) = token {
            user = sqlx::query_as!(
                User,
                r#"SELECT id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole" FROM users WHERE verification_token = $1"#,
                token
            ).fetch_optional(self.pool()).await?;
        }

        Ok(user)
    }

    async fn get_users(&self, page: u32, limit: usize) -> DbResult<Vec<User>> {
        let offset = (page - 1) * limit as u32;

        let users = sqlx::query_as!(
            User,
            r#"SELECT id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole" FROM users ORDER BY created_at DESC LIMIT $1 OFFSET $2"#,
            limit as i64,
            offset as i64,
        ).fetch_all(self.pool())
        .await?;

        Ok(users)
    }

    async fn save_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        verification_token: T,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (name, email, password, verification_token, token_expires_at) 
            VALUES ($1, $2, $3, $4, $5) 
            RETURNING id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole"
            "#,
            name.into(),
            email.into(),
            password.into(),
            verification_token.into(),
            token_expires_at
        ).fetch_one(self.pool())
        .await?;
        Ok(user)
    }

    async fn get_user_count(&self) -> DbResult<i64> {
        let count = sqlx::query_scalar!(r#"SELECT COUNT(*) FROM users"#)
            .fetch_one(self.pool())
            .await?;

        Ok(count.unwrap_or(0))
    }

    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        new_name: T,
    ) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET name = $1, updated_at = Now()
            WHERE id = $2
            RETURNING id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole"
            "#,
            new_name.into(),
            user_id
        ).fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn update_user_role(&self, user_id: Uuid, new_role: UserRole) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET role = $1, updated_at = Now()
            WHERE id = $2
            RETURNING id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole"
            "#,
            new_role as UserRole,
            user_id
        ).fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn update_user_password(&self, user_id: Uuid, new_password: String) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET password = $1, updated_at = Now()
            WHERE id = $2
            RETURNING id, name, email, password, verified, created_at, updated_at, verification_token, token_expires_at, role as "role: UserRole"
            "#,
            new_password,
            user_id
        ).fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn verified_token(&self, token: &str) -> DbResult<()> {
        let _ = sqlx::query!(
            r#"
            UPDATE users
            SET verified = true, 
                updated_at = Now(),
                verification_token = NULL,
                token_expires_at = NULL
            WHERE verification_token = $1
            "#,
            token
        )
        .execute(self.pool())
        .await?;

        Ok(())
    }

    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<()> {
        let _ = sqlx::query!(
            r#"
            UPDATE users
            SET verification_token = $1, token_expires_at = $2, updated_at = Now()
            WHERE id = $3
            "#,
            token,
            token_expires_at,
            user_id,
        )
        .execute(self.pool())
        .await?;

        Ok(())
    }
}

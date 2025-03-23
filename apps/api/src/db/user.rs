use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, TimeZone, Utc};
use sqlx::Error;
use uuid::Uuid;

use super::DBClient;
use super::DbError;
use super::DbResult;

use crate::models::{AuthProvider, User, UserRole};

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

    /// Get a user by auth provider and provider user ID
    ///
    /// # Arguments
    /// * `provider` - Authentication provider (e.g., Google)
    /// * `provider_user_id` - User ID from the provider
    ///
    /// # Returns
    /// * `Ok(Some(User))` - User found
    /// * `Ok(None)` - User not found
    /// * `Err(DbError)` - Database error
    async fn get_user_by_provider(
        &self,
        provider: AuthProvider,
        provider_user_id: &str,
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

    /// Create a new user with Google authentication
    ///
    /// # Arguments
    /// * `name` - Username from Google profile
    /// * `email` - Email address from Google profile
    /// * `password` - Hashed password (randomly generated)
    /// * `provider_user_id` - Google user ID
    /// * `profile_picture` - URL to user's Google profile picture
    ///
    /// # Returns
    /// * `Ok(User)` - Created user
    /// * `Err(DbError)` - Database error
    async fn save_google_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        provider_user_id: T,
        profile_picture: Option<String>,
    ) -> DbResult<User>;

    /// Save a new GitHub OAuth user
    ///
    /// # Arguments
    /// * `name` - Username
    /// * `email` - Email address
    /// * `password` - Hashed password
    /// * `provider_user_id` - GitHub user ID
    /// * `picture` - Profile picture URL
    ///
    /// # Returns
    /// * `Ok(User)` - User created successfully
    /// * `Err(DbError)` - Database error
    async fn save_github_user(
        &self,
        name: &str,
        email: &str,
        password: &str,
        provider_user_id: &str,
        picture: Option<String>,
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

    /// Update a Google user's profile information
    ///
    /// # Arguments
    /// * `user_id` - User ID to update
    /// * `name` - New display name from Google profile
    /// * `profile_picture` - New profile picture URL
    ///
    /// # Returns
    /// * `Ok(User)` - Updated user
    /// * `Err(DbError)` - Database error
    async fn update_google_user(
        &self,
        user_id: &Uuid,
        name: String,
        picture: Option<String>,
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

    /// Update GitHub user information
    ///
    /// # Arguments
    /// * `user_id` - User ID
    /// * `name` - Updated name
    /// * `picture` - Updated profile picture URL
    ///
    /// # Returns
    /// * `Ok(User)` - User updated successfully
    /// * `Err(DbError)` - Database error
    async fn update_github_user(
        &self,
        user_id: &Uuid,
        name: String,
        picture: Option<String>,
    ) -> DbResult<User>;
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

        if let Some(id) = user_id {
            user = sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, name, email, password, 
                    role as "role: UserRole", verified, 
                    verification_token, token_expires_at,
                    created_at, updated_at,
                    auth_provider as "auth_provider: AuthProvider",
                    provider_user_id, profile_picture
                FROM users 
                WHERE id = $1
                "#,
                id
            )
            .fetch_optional(self.pool())
            .await?;
        }

        if user.is_none() && name.is_some() {
            user = sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, name, email, password, 
                    role as "role: UserRole", verified, 
                    verification_token, token_expires_at,
                    created_at, updated_at,
                    auth_provider as "auth_provider: AuthProvider",
                    provider_user_id, profile_picture
                FROM users 
                WHERE name = $1
                "#,
                name
            )
            .fetch_optional(self.pool())
            .await?;
        }

        if user.is_none() && email.is_some() {
            user = sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, name, email, password, 
                    role as "role: UserRole", verified, 
                    verification_token, token_expires_at,
                    created_at, updated_at,
                    auth_provider as "auth_provider: AuthProvider",
                    provider_user_id, profile_picture
                FROM users 
                WHERE email = $1
                "#,
                email
            )
            .fetch_optional(self.pool())
            .await?;
        }

        if user.is_none() && token.is_some() {
            user = sqlx::query_as!(
                User,
                r#"
                SELECT 
                    id, name, email, password, 
                    role as "role: UserRole", verified, 
                    verification_token, token_expires_at,
                    created_at, updated_at,
                    auth_provider as "auth_provider: AuthProvider",
                    provider_user_id, profile_picture
                FROM users 
                WHERE verification_token = $1
                "#,
                token
            )
            .fetch_optional(self.pool())
            .await?;
        }

        Ok(user)
    }

    async fn get_user_by_provider(
        &self,
        provider: AuthProvider,
        provider_user_id: &str,
    ) -> DbResult<Option<User>> {
        let user = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            FROM users 
            WHERE auth_provider = $1 AND provider_user_id = $2
            "#,
            provider as AuthProvider,
            provider_user_id
        )
        .fetch_optional(self.pool())
        .await?;

        Ok(user)
    }

    async fn get_users(&self, page: u32, limit: usize) -> DbResult<Vec<User>> {
        let offset = (page - 1) as i64 * limit as i64;
        let users = sqlx::query_as!(
            User,
            r#"
            SELECT 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            FROM users
            ORDER BY created_at DESC
            LIMIT $1 OFFSET $2
            "#,
            limit as i64,
            offset
        )
        .fetch_all(self.pool())
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
            INSERT INTO users (
                name, email, password, 
                verification_token, token_expires_at,
                auth_provider
            ) 
            VALUES ($1, $2, $3, $4, $5, 'local')
            RETURNING 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            "#,
            name.into(),
            email.into(),
            password.into(),
            verification_token.into(),
            token_expires_at
        )
        .fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn save_google_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        provider_user_id: T,
        profile_picture: Option<String>,
    ) -> DbResult<User> {
        let profile_pic_str: Option<String> = profile_picture;

        let user = sqlx::query_as!(
            User,
            r#"
            INSERT INTO users (
                name, email, password, 
                verified, auth_provider, provider_user_id, 
                profile_picture
            ) 
            VALUES ($1, $2, $3, true, 'google', $4, $5)
            RETURNING 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            "#,
            name.into(),
            email.into(),
            password.into(),
            provider_user_id.into(),
            profile_pic_str
        )
        .fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn save_github_user(
        &self,
        name: &str,
        email: &str,
        password: &str,
        provider_user_id: &str,
        picture: Option<String>,
    ) -> DbResult<User> {
        let user = sqlx::query_as::<_, User>(
            r#"
            INSERT INTO users (name, email, password, auth_provider, provider_user_id, profile_picture, verified)
            VALUES ($1, $2, $3, 'github', $4, $5, true)
            RETURNING *
            "#,
        )
        .bind(name)
        .bind(email)
        .bind(password)
        .bind(provider_user_id)
        .bind(picture)
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(user)
    }

    async fn get_user_count(&self) -> DbResult<i64> {
        let record = sqlx::query!("SELECT COUNT(*) as count FROM users")
            .fetch_one(self.pool())
            .await?;

        Ok(record.count.unwrap_or(0))
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
            SET name = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            "#,
            new_name.into(),
            user_id
        )
        .fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn update_google_user(
        &self,
        user_id: &Uuid,
        name: String,
        picture: Option<String>,
    ) -> DbResult<User> {
        let user = sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET name = $1, profile_picture = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
            "#,
        )
        .bind(name)
        .bind(picture)
        .bind(user_id)
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(user)
    }

    async fn update_user_role(&self, user_id: Uuid, new_role: UserRole) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET role = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            "#,
            new_role as UserRole,
            user_id
        )
        .fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn update_user_password(&self, user_id: Uuid, new_password: String) -> DbResult<User> {
        let user = sqlx::query_as!(
            User,
            r#"
            UPDATE users
            SET password = $1, updated_at = NOW()
            WHERE id = $2
            RETURNING 
                id, name, email, password, 
                role as "role: UserRole", verified, 
                verification_token, token_expires_at,
                created_at, updated_at,
                auth_provider as "auth_provider: AuthProvider",
                provider_user_id, profile_picture
            "#,
            new_password,
            user_id
        )
        .fetch_one(self.pool())
        .await?;

        Ok(user)
    }

    async fn verified_token(&self, token: &str) -> DbResult<()> {
        let query_result = sqlx::query!(
            r#"
            UPDATE users
            SET verified = true, 
                verification_token = NULL, 
                token_expires_at = NULL,
                updated_at = NOW()
            WHERE verification_token = $1
            "#,
            token
        )
        .execute(self.pool())
        .await?;

        if query_result.rows_affected() == 0 {
            return Err(DbError::InvalidToken);
        }

        Ok(())
    }

    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        token_expires_at: DateTime<Utc>,
    ) -> DbResult<()> {
        let query_result = sqlx::query!(
            r#"
            UPDATE users
            SET verification_token = $1, 
                token_expires_at = $2,
                updated_at = NOW()
            WHERE id = $3
            "#,
            token,
            token_expires_at,
            user_id
        )
        .execute(self.pool())
        .await?;

        if query_result.rows_affected() == 0 {
            return Err(DbError::UserNotFound);
        }

        Ok(())
    }

    async fn update_github_user(
        &self,
        user_id: &Uuid,
        name: String,
        picture: Option<String>,
    ) -> DbResult<User> {
        let user = sqlx::query_as::<_, User>(
            r#"
            UPDATE users
            SET name = $1, profile_picture = $2, updated_at = NOW()
            WHERE id = $3
            RETURNING *
            "#,
        )
        .bind(name)
        .bind(picture)
        .bind(user_id)
        .fetch_one(self.pool())
        .await
        .map_err(DbError::from)?;

        Ok(user)
    }
}

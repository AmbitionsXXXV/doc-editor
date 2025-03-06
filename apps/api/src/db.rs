use sqlx::Pool;
use sqlx::postgres::{PgPool, PgPoolOptions, Postgres};
use std::sync::Arc;
use std::time::Duration;

// Module declarations
mod document;
mod user;

// Public re-exports
pub use document::DocumentExt;
pub use user::UserExt;

/// Database client that provides access to all repositories
///
/// This client follows the repository pattern, providing specialized
/// interfaces for each entity type while centralizing database access.
#[derive(Debug, Clone)]
pub struct DBClient {
    pool: Pool<Postgres>,
}

impl DBClient {
    /// Create a new database client with the given connection pool
    pub fn new(pool: Pool<Postgres>) -> Self {
        DBClient { pool }
    }

    /// Get a reference to the underlying connection pool
    ///
    /// This method is restricted to use within this crate only
    pub(crate) fn pool(&self) -> &Pool<Postgres> {
        &self.pool
    }

    /// Run a health check on the database
    pub async fn health_check(&self) -> Result<bool, DbError> {
        sqlx::query("SELECT 1")
            .execute(self.pool())
            .await
            .map(|_| true)
            .map_err(DbError::from)
    }

    /// Begin a transaction
    pub async fn begin_transaction(&self) -> Result<sqlx::Transaction<'_, Postgres>, DbError> {
        self.pool().begin().await.map_err(DbError::from)
    }
}

/// Database operation errors
///
/// Comprehensive error type for all database-related operations
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),

    #[error("Entity not found: {0}")]
    NotFound(String),

    #[error("User not found")]
    UserNotFound,

    #[error("Document not found")]
    DocumentNotFound,

    #[error("Permission denied for resource")]
    PermissionDenied,

    #[error("Email already exists")]
    EmailExists,

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Token expired or invalid")]
    InvalidToken,

    #[error("Constraint violation: {0}")]
    ConstraintViolation(String),

    #[error("Transaction error: {0}")]
    TransactionError(String),
}

/// Common database operation result type
pub type DbResult<T> = Result<T, DbError>;

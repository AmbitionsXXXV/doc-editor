use sqlx::Pool;
use sqlx::postgres::{PgPool, PgPoolOptions, Postgres};
use std::time::Duration;

mod user;

pub use user::UserExt;

/// 数据库客户端结构体 -- 封装了数据库连接池
#[derive(Debug, Clone)]
pub struct DBClient {
    pool: Pool<Postgres>,
}

impl DBClient {
    /// 创建新的数据库客户端实例 -- 使用给定的连接池初始化
    pub fn new(pool: Pool<Postgres>) -> Self {
        DBClient { pool }
    }

    /// 获取数据库连接池的引用 -- 用于内部模块访问
    pub(crate) fn pool(&self) -> &Pool<Postgres> {
        &self.pool
    }
}

// -- 常用错误类型
#[derive(Debug, thiserror::Error)]
pub enum DbError {
    #[error("Database error: {0}")]
    Sqlx(#[from] sqlx::Error),

    #[error("User not found")]
    UserNotFound,

    #[error("Email already exists")]
    EmailExists,

    #[error("Invalid credentials")]
    InvalidCredentials,

    #[error("Token expired or invalid")]
    InvalidToken,
}

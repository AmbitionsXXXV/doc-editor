use async_trait::async_trait;
use chrono::{DateTime, FixedOffset, TimeZone, Utc};
use sqlx::Error;
use uuid::Uuid;

use super::DBClient;

use crate::models::{User, UserRole};

/// 用户数据库操作扩展特征 -- 定义了所有与用户相关的数据库操作
#[async_trait]
pub trait UserExt {
    /// 获取用户信息 -- 支持通过多种方式查询
    ///
    /// # 参数
    /// - `user_id` -- 用户ID
    /// - `name` -- 用户名
    /// - `email` -- 用户邮箱
    /// - `token` -- 验证令牌
    ///
    /// # 返回
    /// - `Ok(Some(User))` -- 查找到用户
    /// - `Ok(None)` -- 未找到用户
    /// - `Err(sqlx::Error)` -- 数据库错误
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> Result<Option<User>, Error>;

    /// 分页获取用户列表 -- 按创建时间倒序排列
    ///
    /// # 参数
    /// - `page` -- 页码，从1开始
    /// - `limit` -- 每页数量
    async fn get_users(&self, page: u32, limit: usize) -> Result<Vec<User>, Error>;

    /// 保存新用户 -- 创建新的用户记录
    ///
    /// # 参数
    /// - `name` -- 用户名
    /// - `email` -- 邮箱
    /// - `password` -- 密码（已哈希）
    /// - `verification_token` -- 验证令牌
    /// - `token_expires_at` -- 令牌过期时间
    async fn save_user<T: Into<String> + Send>(
        &self,
        name: T,
        email: T,
        password: T,
        verification_token: T,
        token_expires_at: DateTime<Utc>,
    ) -> Result<User, Error>;

    /// 获取用户总数 -- 用于分页
    async fn get_user_count(&self) -> Result<i64, Error>;

    /// 更新用户名 -- 修改用户的显示名称
    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        name: T,
    ) -> Result<User, Error>;

    /// 更新用户角色 -- 修改用户的权限级别
    async fn update_user_role(&self, user_id: Uuid, role: UserRole) -> Result<User, Error>;

    /// 更新用户密码 -- 修改用户的登录密码
    async fn update_user_password(&self, user_id: Uuid, password: String) -> Result<User, Error>;

    /// 验证用户令牌 -- 确认邮箱验证或重置密码
    async fn verified_token(&self, token: &str) -> Result<(), Error>;

    /// 添加验证令牌 -- 用于邮箱验证或密码重置
    async fn add_verified_token(
        &self,
        user_id: Uuid,
        token: &str,
        expires_at: DateTime<Utc>,
    ) -> Result<(), Error>;
}

#[async_trait]
impl UserExt for DBClient {
    async fn get_user(
        &self,
        user_id: Option<Uuid>,
        name: Option<&str>,
        email: Option<&str>,
        token: Option<&str>,
    ) -> Result<Option<User>, Error> {
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

    async fn get_users(&self, page: u32, limit: usize) -> Result<Vec<User>, Error> {
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
    ) -> Result<User, Error> {
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

    async fn get_user_count(&self) -> Result<i64, Error> {
        let count = sqlx::query_scalar!(r#"SELECT COUNT(*) FROM users"#)
            .fetch_one(self.pool())
            .await?;

        Ok(count.unwrap_or(0))
    }

    async fn update_user_name<T: Into<String> + Send>(
        &self,
        user_id: Uuid,
        new_name: T,
    ) -> Result<User, Error> {
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

    async fn update_user_role(&self, user_id: Uuid, new_role: UserRole) -> Result<User, Error> {
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

    async fn update_user_password(
        &self,
        user_id: Uuid,
        new_password: String,
    ) -> Result<User, Error> {
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

    async fn verified_token(&self, token: &str) -> Result<(), Error> {
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
    ) -> Result<(), Error> {
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

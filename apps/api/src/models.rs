use chrono::prelude::*;
use serde::{Deserialize, Serialize};

#[derive(Debug, Deserialize, Serialize, Clone, Copy, sqlx::Type, PartialEq)]
#[sqlx(type_name = "user_role", rename_all = "lowercase")]
pub enum UserRole {
    Admin,
    User,
}

impl UserRole {
    pub fn to_str(self) -> &'static str {
        match self {
            UserRole::Admin => "admin",
            UserRole::User => "user",
        }
    }
}

#[derive(Debug, Deserialize, Serialize, Clone, Copy, sqlx::Type, PartialEq)]
#[sqlx(type_name = "auth_provider", rename_all = "lowercase")]
pub enum AuthProvider {
    Local,
    Google,
    Github,
}

impl AuthProvider {
    pub fn to_str(self) -> &'static str {
        match self {
            AuthProvider::Local => "local",
            AuthProvider::Google => "google",
            AuthProvider::Github => "github",
        }
    }
}

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow, sqlx::Type, Clone)]
pub struct User {
    pub id: uuid::Uuid,
    pub name: String,
    pub email: String,
    pub password: String,
    pub role: UserRole,
    pub verified: bool,
    pub verification_token: Option<String>,
    pub token_expires_at: Option<DateTime<Utc>>,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
    pub auth_provider: AuthProvider,
    pub provider_user_id: Option<String>,
    pub profile_picture: Option<String>,
}

// 在 models.rs 中添加
#[derive(Debug, Deserialize, Serialize, sqlx::FromRow, sqlx::Type, Clone)]
pub struct Document {
    pub id: uuid::Uuid,
    pub title: String,
    pub content: String,
    pub owner_id: uuid::Uuid,
    pub is_public: bool,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

#[derive(Debug, Deserialize, Serialize, Clone, sqlx::Type, PartialEq, Eq)]
#[sqlx(type_name = "permission_level", rename_all = "lowercase")]
pub enum PermissionLevel {
    Read,
    ReadWrite,
    Owner,
}

impl PermissionLevel {
    pub fn to_str(&self) -> &'static str {
        match self {
            PermissionLevel::Read => "read",
            PermissionLevel::ReadWrite => "readwrite",
            PermissionLevel::Owner => "owner",
        }
    }
}

#[derive(Debug, Deserialize, Serialize, sqlx::FromRow, Clone)]
pub struct DocumentPermission {
    pub id: uuid::Uuid,
    pub document_id: uuid::Uuid,
    pub user_id: uuid::Uuid,
    pub permission_level: PermissionLevel,
    #[serde(rename = "createdAt")]
    pub created_at: Option<DateTime<Utc>>,
    #[serde(rename = "updatedAt")]
    pub updated_at: Option<DateTime<Utc>>,
}

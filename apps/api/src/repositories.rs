pub mod document;
pub mod user;

// Re-export repository traits
pub use document::DocumentRepository;
pub use user::UserRepository;

use crate::db::DbResult;
use crate::models::{Document, DocumentPermission, PermissionLevel, User, UserRole};

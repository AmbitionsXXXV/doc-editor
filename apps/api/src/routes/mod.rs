use axum::{
    Router, middleware,
    routing::{delete, get, post, put},
};
use sqlx::PgPool;

use crate::controllers::{
    create_document, create_user, delete_document, get_document, get_documents, login,
    update_document,
};
use crate::middleware::auth::auth;

pub fn create_router(pool: PgPool) -> Router {
    let auth_routes = Router::new()
        .route("/documents", get(get_documents))
        .route("/documents", post(create_document))
        .route("/documents/:id", get(get_document))
        .route("/documents/:id", put(update_document))
        .route("/documents/:id", delete(delete_document))
        .layer(middleware::from_fn(auth));

    Router::new()
        .route("/health", get(|| async { "OK" }))
        .route("/api/users", post(create_user))
        .route("/api/login", post(login))
        .nest("/api", auth_routes)
        .with_state(pool)
}

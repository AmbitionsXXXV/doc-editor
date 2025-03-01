use axum::{Json, extract::State, http::StatusCode};
use serde::{Deserialize, Serialize};
use sqlx::PgPool;
use uuid::Uuid;

use crate::errors::AppError;

#[derive(Debug, Serialize)]
pub struct UserResponse {
    id: String,
    email: String,
    name: String,
}

#[derive(Debug, Deserialize)]
pub struct CreateUserRequest {
    email: String,
    name: String,
    password: String,
}

#[derive(Debug, Deserialize)]
pub struct LoginRequest {
    email: String,
    password: String,
}

#[derive(Debug, Serialize)]
pub struct LoginResponse {
    token: String,
    user: UserResponse,
}

pub async fn create_user(
    State(pool): State<PgPool>,
    Json(payload): Json<CreateUserRequest>,
) -> Result<(StatusCode, Json<UserResponse>), AppError> {
    // This is a placeholder implementation
    // In a real application, you would:
    // 1. Hash the password
    // 2. Insert the user into the database
    // 3. Return the created user

    let id = Uuid::new_v4().to_string();

    let user = UserResponse {
        id,
        email: payload.email,
        name: payload.name,
    };

    Ok((StatusCode::CREATED, Json(user)))
}

pub async fn login(
    State(pool): State<PgPool>,
    Json(payload): Json<LoginRequest>,
) -> Result<Json<LoginResponse>, AppError> {
    // This is a placeholder implementation
    // In a real application, you would:
    // 1. Verify the user's credentials
    // 2. Generate a JWT token
    // 3. Return the token and user

    let user = UserResponse {
        id: Uuid::new_v4().to_string(),
        email: payload.email,
        name: "User".to_string(),
    };

    let token = "placeholder_jwt_token".to_string();

    Ok(Json(LoginResponse { token, user }))
}

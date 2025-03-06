use std::sync::Arc;

use axum::{
    Extension, Json, Router,
    extract::Query,
    middleware,
    response::IntoResponse,
    routing::{get, put},
};
use validator::Validate;

use crate::{
    AppState,
    db::UserExt,
    dtos::{
        FilterUserDto, NameUpdateDto, RequestQueryDto, Response, RoleUpdateDto, UserData,
        UserListResponseDto, UserPasswordUpdateDto, UserResponseDto,
    },
    error::{ErrorMessage, HttpError},
    middleware::{JWTAuthMiddleware, role_check},
    models::UserRole,
    repositories::UserRepository,
    utils::password,
};

pub fn users_handler() -> Router {
    Router::new()
        .route(
            "/me",
            get(get_me).layer(middleware::from_fn(|state, req, next| {
                role_check(state, req, next, vec![UserRole::Admin, UserRole::User])
            })),
        )
        .route(
            "/users",
            get(get_users).layer(middleware::from_fn(|state, req, next| {
                role_check(state, req, next, vec![UserRole::Admin])
            })),
        )
        .route("/name", put(update_user_name))
        .route("/role", put(update_user_role))
        .route("/password", put(update_user_password))
}

pub async fn get_me(
    Extension(_app_state): Extension<Arc<AppState>>,
    Extension(user): Extension<JWTAuthMiddleware>,
) -> Result<impl IntoResponse, HttpError> {
    let filtered_user = FilterUserDto::filter_user(&user.user);

    let response_data = UserResponseDto {
        status: "success".to_string(),
        data: UserData {
            user: filtered_user,
        },
    };

    tracing::info!("成功获取用户信息: {}", user.user.email);
    Ok(Json(response_data))
}

pub async fn get_users(
    Query(query_params): Query<RequestQueryDto>,
    Extension(app_state): Extension<Arc<AppState>>,
) -> Result<impl IntoResponse, HttpError> {
    let page = query_params.page.unwrap_or(1) as u32;
    let limit = query_params.limit.unwrap_or(10);

    tracing::info!("获取用户列表，页码: {}, 每页数量: {}", page, limit);

    let users = app_state
        .user_repository
        .get_users(page, limit)
        .await
        .map_err(|e| {
            tracing::error!("获取用户列表失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let user_count = app_state.db_client.get_user_count().await.map_err(|e| {
        tracing::error!("获取用户总数失败: {}", e);
        HttpError::server_error(e.to_string())
    })?;

    tracing::info!("成功获取用户列表，总数: {}", user_count);

    let response = UserListResponseDto {
        status: "success".to_string(),
        users: FilterUserDto::filter_users(&users),
        results: user_count,
    };

    Ok(Json(response))
}

pub async fn update_user_name(
    Extension(app_state): Extension<Arc<AppState>>,
    Extension(user): Extension<JWTAuthMiddleware>,
    Json(body): Json<NameUpdateDto>,
) -> Result<impl IntoResponse, HttpError> {
    tracing::info!(
        "更新用户名，用户ID: {}, 新用户名: {}",
        user.user.id,
        body.name
    );

    body.validate().map_err(|e| {
        tracing::warn!("用户名验证失败: {}", e);
        HttpError::bad_request(e.to_string())
    })?;

    let user = &user.user;
    let user_id = uuid::Uuid::parse_str(&user.id.to_string()).unwrap();

    let result = app_state
        .user_repository
        .update_user_name(user_id, &body.name)
        .await
        .map_err(|e| {
            tracing::error!("更新用户名失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let filtered_user = FilterUserDto::filter_user(&result);

    let response = UserResponseDto {
        data: UserData {
            user: filtered_user,
        },
        status: "success".to_string(),
    };

    Ok(Json(response))
}

pub async fn update_user_role(
    Extension(app_state): Extension<Arc<AppState>>,
    Extension(user): Extension<JWTAuthMiddleware>,
    Json(body): Json<RoleUpdateDto>,
) -> Result<impl IntoResponse, HttpError> {
    body.validate().map_err(|e| {
        tracing::warn!("角色更新请求验证失败: {}", e);
        HttpError::bad_request(e.to_string())
    })?;

    if user.user.role != UserRole::Admin {
        tracing::warn!(
            "权限不足，用户: {} 尝试更新角色但不是管理员",
            user.user.email
        );
        return Err(HttpError::unauthorized(
            ErrorMessage::PermissionDenied.to_string(),
        ));
    }

    let user_id = uuid::Uuid::parse_str(&user.user.id.to_string()).unwrap();

    let result = app_state
        .user_repository
        .update_user_role(user_id, body.role)
        .await
        .map_err(|e| {
            tracing::error!("更新用户角色失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let filtered_user = FilterUserDto::filter_user(&result);

    let response = UserResponseDto {
        data: UserData {
            user: filtered_user,
        },
        status: "success".to_string(),
    };

    Ok(Json(response))
}

pub async fn update_user_password(
    Extension(app_state): Extension<Arc<AppState>>,
    Extension(user): Extension<JWTAuthMiddleware>,
    Json(body): Json<UserPasswordUpdateDto>,
) -> Result<impl IntoResponse, HttpError> {
    tracing::info!("更新用户密码，用户ID: {}", user.user.id);

    body.validate().map_err(|e| {
        tracing::warn!("密码更新请求验证失败: {}", e);
        HttpError::bad_request(e.to_string())
    })?;

    let user = &user.user;
    let user_id = uuid::Uuid::parse_str(&user.id.to_string()).unwrap();

    let result = app_state
        .user_repository
        .get_user(Some(user_id), None, None, None)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let user = result.ok_or(HttpError::unauthorized(
        ErrorMessage::InvalidToken.to_string(),
    ))?;

    let password_match = password::compare(&body.old_password, &user.password)
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    if !password_match {
        tracing::warn!("当前密码不匹配，用户ID: {}", user.id);
        return Err(HttpError::bad_request(
            ErrorMessage::WrongCredentials.to_string(),
        ));
    }

    let hash_password = password::hash(&body.new_password).map_err(|e| {
        tracing::error!("密码加密失败: {}", e);
        HttpError::server_error(e.to_string())
    })?;

    app_state
        .user_repository
        .update_user_password(user_id, hash_password)
        .await
        .map_err(|e| {
            tracing::error!("更新密码失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    tracing::info!("密码更新成功，用户ID: {}", user.id);

    let response = Response {
        message: "Password updated Successfully".to_string(),
        status: "success",
    };

    Ok(Json(response))
}

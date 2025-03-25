mod login;
mod oauth;
mod passwords;
mod register;

use axum::{
    Extension, Json, Router,
    extract::Query,
    http::{HeaderMap, header},
    response::{IntoResponse, Redirect},
    routing::{get, post},
};
use axum_extra::extract::cookie::Cookie;
use chrono::{Duration, Utc};
use std::sync::Arc;
use validator::Validate;

use crate::{
    AppState,
    db::UserExt,
    dtos::{ResendVerificationDto, Response, VerifyEmailQueryDto},
    error::{ErrorMessage, HttpError},
    mail::mails::{send_verification_email, send_welcome_email},
    utils::token,
};

pub fn auth_handler() -> Router {
    Router::new()
        .route("/register", post(register::register))
        .route("/login", post(login::login))
        .route("/verify", get(verify_email))
        // -- 重新发送验证邮件的端点
        .route("/resend-verification", post(resend_verification_email))
        .route("/forgot-password", post(passwords::forgot_password))
        .route("/reset-password", post(passwords::reset_password))
        // -- Google OAuth 登录端点
        .route("/google/login", get(oauth::google_oauth_login))
        .route("/google/callback", get(oauth::google_oauth_callback))
        // -- GitHub OAuth 登录端点
        .route("/github/login", get(oauth::github_oauth_login))
        .route("/github/callback", get(oauth::github_oauth_callback))
}

/// 处理邮箱验证请求 -- 验证用户的邮箱验证 token
///
/// # 验证流程
/// 1. 验证请求参数格式
/// 2. 根据 token 查找用户
/// 3. 检查 token 是否过期
/// 4. 更新用户验证状态
///
/// # 数据库更新操作
/// 验证成功后，通过 verified_token 函数执行以下更新：
/// - verified = true  -- 标记邮箱已验证
/// - updated_at = Now()  -- 更新时间戳
/// - verification_token = NULL  -- 清除验证 token
/// - token_expires_at = NULL  -- 清除过期时间
pub async fn verify_email(
    Query(query_params): Query<VerifyEmailQueryDto>,
    Extension(app_state): Extension<Arc<AppState>>,
) -> Result<impl IntoResponse, HttpError> {
    // -- 步骤 1: 验证请求参数格式
    query_params
        .validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    let token = &query_params.token;
    tracing::info!("开始处理邮箱验证请求，token: {}", token);

    // -- 步骤 2: 根据验证 token 查找用户
    let result = app_state
        .db_client
        .get_user(None, None, None, Some(token))
        .await
        .map_err(|e| {
            tracing::error!("查询用户失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let user = result.ok_or_else(|| {
        tracing::error!("无效的验证 token: {}", token);
        HttpError::unauthorized(ErrorMessage::InvalidToken.to_string())
    })?;

    tracing::info!("找到用户: {}, 邮箱: {}", user.name, user.email);

    // -- 步骤 3: 检查 token 是否过期
    if let Some(expires_at) = user.token_expires_at {
        let now = Utc::now();
        tracing::info!("当前时间: {:?}, Token 过期时间: {:?}", now, expires_at);

        if now > expires_at {
            tracing::warn!("验证链接已过期，用户: {}, 邮箱: {}", user.name, user.email);
            return Err(HttpError::bad_request(
                "验证链接已过期，请重新发送验证邮件".to_string(),
            ));
        }
    } else {
        tracing::error!(
            "验证 token 不存在，用户: {}, 邮箱: {}",
            user.name,
            user.email
        );
        return Err(HttpError::bad_request("验证 token 不存在".to_string()));
    }

    // -- 步骤 4: 更新用户验证状态
    app_state
        .db_client
        .verified_token(token)
        .await
        .map_err(|e| {
            tracing::error!("更新用户验证状态失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    tracing::info!("用户 {} 邮箱验证成功", user.email);

    // -- 发送欢迎邮件
    match send_welcome_email(&user.email, &user.name).await {
        Ok(_) => tracing::info!("成功发送欢迎邮件给用户: {}", user.email),
        Err(e) => tracing::error!("发送欢迎邮件失败: {}", e),
    }

    // -- 创建 JWT token
    let token = token::create_token(
        &user.id.to_string(),
        app_state.env.jwt_secret.as_bytes(),
        app_state.env.jwt_maxage,
    )
    .map_err(|e| {
        tracing::error!("创建 JWT token 失败: {}", e);
        HttpError::server_error(e.to_string())
    })?;

    // -- 设置 cookie
    let cookie_duration = time::Duration::minutes(app_state.env.jwt_maxage * 60);
    let cookie = Cookie::build(("token", token.clone()))
        .path("/")
        .max_age(cookie_duration)
        .http_only(true)
        .build();

    let mut headers = HeaderMap::new();
    headers.append(header::SET_COOKIE, cookie.to_string().parse().unwrap());

    // -- 重定向到前端
    let redirect = Redirect::to(&app_state.env.frontend_url);
    let mut response = redirect.into_response();
    response.headers_mut().extend(headers);

    tracing::info!("用户 {} 验证完成，重定向到前端", user.email);
    Ok(response)
}

pub async fn resend_verification_email(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<ResendVerificationDto>,
) -> Result<impl IntoResponse, HttpError> {
    // -- 验证请求数据
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    tracing::info!("处理重新发送验证邮件请求: {}", body.email);

    // -- 查找用户
    let result = app_state
        .db_client
        .get_user(None, None, Some(&body.email), None)
        .await
        .map_err(|e| {
            tracing::error!("查询用户失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let user = result.ok_or_else(|| {
        tracing::warn!("邮箱地址未注册: {}", body.email);
        HttpError::bad_request("邮箱地址未注册".to_string())
    })?;

    // -- 检查是否已经验证过
    if user.verified {
        tracing::warn!("用户邮箱已经验证过了: {}", body.email);
        return Err(HttpError::bad_request("邮箱已经验证过了".to_string()));
    }

    // -- 生成新的验证 token，有效期设置为 30 分钟
    let verification_token = uuid::Uuid::new_v4().to_string();
    let expires_at = Utc::now() + Duration::minutes(30);

    tracing::info!(
        "为用户 {} 生成新的验证 token，当前时间: {:?}, 过期时间: {:?}",
        user.email,
        Utc::now(),
        expires_at
    );

    let user_id = uuid::Uuid::parse_str(&user.id.to_string()).unwrap();

    // -- 更新验证 token
    app_state
        .db_client
        .add_verified_token(user_id, &verification_token, expires_at)
        .await
        .map_err(|e| {
            tracing::error!("更新验证 token 失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    tracing::info!("成功更新用户 {} 的验证 token", user.email);

    // -- 发送验证邮件
    match send_verification_email(&user.email, &user.name, &verification_token).await {
        Ok(_) => {
            tracing::info!("成功重新发送验证邮件给用户: {}", user.email);

            let response = Response {
                message: "验证邮件已重新发送，请在 30 分钟内完成验证".to_string(),
                status: "success",
            };

            Ok(Json(response))
        }
        Err(e) => {
            tracing::error!("重新发送验证邮件失败: {}", e);
            Err(HttpError::server_error("发送邮件失败".to_string()))
        }
    }
}

use std::sync::Arc;

use axum::{
    Extension, Json, Router,
    extract::Query,
    http::{HeaderMap, StatusCode, header},
    response::{IntoResponse, Redirect},
    routing::{get, post},
};
use axum_extra::extract::cookie::Cookie;
use chrono::{Duration, FixedOffset, Utc};
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, PkceCodeChallenge,
    PkceCodeVerifier, RedirectUrl, Scope, TokenResponse, TokenUrl, basic::BasicClient,
};
use reqwest::Client as HttpClient;
use serde::Deserialize;
use sqlx::error::DatabaseError;
use validator::Validate;

use crate::{
    AppState,
    db::{DbError, UserExt},
    dtos::{
        ForgotPasswordRequestDto, GithubCallbackDto, GithubUserInfo, GoogleCallbackDto,
        GoogleUserInfo, LoginUserDto, RegisterUserDto, ResendVerificationDto,
        ResetPasswordRequestDto, Response, UserLoginResponseDto, VerifyEmailQueryDto,
    },
    error::{ErrorMessage, HttpError},
    mail::mails::{send_forgot_password_email, send_verification_email, send_welcome_email},
    models::AuthProvider,
    utils::{password, token},
};

/// 处理 GitHub OAuth 登录请求 -- 重定向到 GitHub 登录页面
///
/// 创建 GitHub OAuth 授权 URL 并重定向用户
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含 GitHub OAuth 配置等共享资源
///
/// # 返回
/// - 重定向响应，将用户重定向到 GitHub 登录页面
pub async fn github_oauth_login(
    Extension(app_state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    // 检查是否配置了 GitHub OAuth
    if app_state.env.github_client_id.is_empty() || app_state.env.github_client_secret.is_empty() {
        return Err(HttpError::server_error("GitHub OAuth 未配置".to_string()));
    }

    let auth_url = AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
        .expect("Invalid authorization endpoint URL");
    let token_url = TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
        .expect("Invalid token endpoint URL");

    // 创建 OAuth2 客户端
    let client = BasicClient::new(ClientId::new(app_state.env.github_client_id.clone()))
        .set_client_secret(ClientSecret::new(
            app_state.env.github_client_secret.clone(),
        ))
        .set_auth_uri(auth_url)
        .set_token_uri(token_url)
        .set_redirect_uri(
            RedirectUrl::new(app_state.env.google_redirect_url.clone()).expect("无效的重定向 URL"),
        );

    // 设置授权范围
    let (auth_url, _csrf_token) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("user:email".to_string())) // 获取用户邮箱
        .add_scope(Scope::new("read:user".to_string())) // 获取用户信息
        .url();

    // 重定向到 GitHub 授权页面
    Ok(Redirect::to(auth_url.as_ref()))
}

/// 处理 GitHub OAuth 回调请求
///
/// 验证 GitHub 返回的授权码，获取用户信息，并创建或更新用户
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含数据库连接和 GitHub OAuth 配置
/// - `query` -- URL 查询参数，包含授权码
///
/// # 返回
/// - 重定向响应，将用户重定向到前端应用
pub async fn github_oauth_callback(
    Extension(app_state): Extension<Arc<AppState>>,
    Query(query): Query<GithubCallbackDto>,
) -> impl IntoResponse {
    // 处理错误响应
    if let Some(error) = &query.error {
        tracing::error!("GitHub OAuth 错误: {}", error);
        return Err(HttpError::bad_request(format!(
            "GitHub 登录失败: {}",
            error
        )));
    }

    let auth_url = AuthUrl::new("https://github.com/login/oauth/authorize".to_string())
        .expect("Invalid authorization endpoint URL");
    let token_url = TokenUrl::new("https://github.com/login/oauth/access_token".to_string())
        .expect("Invalid token endpoint URL");

    let http_client = reqwest::ClientBuilder::new()
        // Following redirects opens the client up to SSRF vulnerabilities.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .expect("Client should build");

    // 创建 OAuth2 客户端
    let client = BasicClient::new(ClientId::new(app_state.env.github_client_id.clone()))
        .set_client_secret(ClientSecret::new(
            app_state.env.github_client_secret.clone(),
        ))
        .set_auth_uri(auth_url)
        .set_token_uri(token_url)
        .set_redirect_uri(
            RedirectUrl::new(app_state.env.google_redirect_url.clone()).expect("无效的重定向 URL"),
        );

    // 交换授权码获取访问令牌
    let token_result = client
        .exchange_code(AuthorizationCode::new(query.code.clone()))
        .request_async(&http_client)
        .await
        .map_err(|e| {
            tracing::error!("获取访问令牌失败: {}", e);
            HttpError::server_error("无法获取访问令牌".to_string())
        })?;

    let access_token = token_result.access_token().secret();

    // 使用访问令牌获取用户信息
    let user_info = get_github_user_info(access_token).await.map_err(|e| {
        tracing::error!("获取 GitHub 用户信息失败: {}", e);
        HttpError::server_error("无法获取用户信息".to_string())
    })?;

    // 获取用户邮箱（如果不在基本信息中）
    let email = if let Some(email) = user_info.email.clone() {
        email
    } else {
        get_github_user_emails(access_token).await.map_err(|e| {
            tracing::error!("获取 GitHub 用户邮箱失败: {}", e);
            HttpError::server_error("无法获取用户邮箱".to_string())
        })?
    };

    // 检查用户是否已存在 (通过 provider_user_id 或 email)
    let existing_user = app_state
        .db_client
        .get_user_by_provider(AuthProvider::Github, &user_info.id.to_string())
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let user = if let Some(user) = existing_user {
        // 用户已存在，更新信息
        let name = user_info.name.unwrap_or(user_info.login.clone());
        app_state
            .db_client
            .update_github_user(&user.id, name, user_info.avatar_url.clone())
            .await
            .map_err(|e| HttpError::server_error(e.to_string()))?
    } else {
        // 检查邮箱是否已注册但不是通过 GitHub
        let email_user = app_state
            .db_client
            .get_user(None, None, Some(&email), None)
            .await
            .map_err(|e| HttpError::server_error(e.to_string()))?;

        if let Some(user) = email_user {
            // 邮箱已经被其他非 GitHub 账户使用
            if user.auth_provider != AuthProvider::Github {
                return Err(HttpError::bad_request(format!(
                    "邮箱 {} 已被其他账户使用",
                    email
                )));
            }
        }

        // 创建新用户
        let name = user_info.name.unwrap_or(user_info.login.clone());
        let random_password = uuid::Uuid::new_v4().to_string();
        let hashed_password =
            password::hash(&random_password).map_err(|e| HttpError::server_error(e.to_string()))?;

        app_state
            .db_client
            .save_github_user(
                &name,
                &email,
                &hashed_password,
                &user_info.id.to_string(),
                user_info.avatar_url.clone(),
            )
            .await
            .map_err(|e| HttpError::server_error(e.to_string()))?
    };

    // 创建 JWT token
    let token = token::create_token(
        &user.id.to_string(),
        app_state.env.jwt_secret.as_bytes(),
        app_state.env.jwt_maxage,
    )
    .map_err(|e| HttpError::server_error(e.to_string()))?;

    // 设置 cookie
    let cookie_duration = time::Duration::minutes(app_state.env.jwt_maxage * 60);
    let cookie = Cookie::build(("token", token.clone()))
        .path("/")
        .max_age(cookie_duration)
        .http_only(true)
        .build();

    // 重定向到前端，并带上 token 参数
    let redirect_url = format!("{}?token={}", app_state.env.frontend_url, token);

    let mut response = Redirect::to(&redirect_url).into_response();
    response
        .headers_mut()
        .insert(header::SET_COOKIE, cookie.to_string().parse().unwrap());

    Ok(response)
}

/// 从 GitHub API 获取用户信息
///
/// 使用访问令牌从 GitHub API 获取用户的个人资料信息
///
/// # 参数
/// - `access_token` - GitHub 提供的访问令牌
///
/// # 返回
/// - `Result<GithubUserInfo, String>` - 成功时返回用户信息，失败时返回错误信息
async fn get_github_user_info(access_token: &str) -> Result<GithubUserInfo, String> {
    let client = HttpClient::new();
    let response = client
        .get("https://api.github.com/user")
        .bearer_auth(access_token)
        .header("User-Agent", "doc-editor-app")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("请求 GitHub API 失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("GitHub API 返回错误: {} - {}", status, text));
    }

    let user_info = response
        .json::<GithubUserInfo>()
        .await
        .map_err(|e| format!("解析 GitHub 用户信息失败: {}", e))?;

    Ok(user_info)
}

/// 从 GitHub API 获取用户邮箱
///
/// 当用户未设置公开邮箱时，需要单独请求邮箱信息
///
/// # 参数
/// - `access_token` - GitHub 提供的访问令牌
///
/// # 返回
/// - `Result<String, String>` - 成功时返回主要邮箱地址，失败时返回错误信息
async fn get_github_user_emails(access_token: &str) -> Result<String, String> {
    #[derive(Debug, Deserialize)]
    struct GithubEmail {
        email: String,
        primary: bool,
        verified: bool,
    }

    let client = HttpClient::new();
    let response = client
        .get("https://api.github.com/user/emails")
        .bearer_auth(access_token)
        .header("User-Agent", "doc-editor-app")
        .header("Accept", "application/vnd.github.v3+json")
        .send()
        .await
        .map_err(|e| format!("请求 GitHub 邮箱 API 失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("GitHub 邮箱 API 返回错误: {} - {}", status, text));
    }

    let emails = response
        .json::<Vec<GithubEmail>>()
        .await
        .map_err(|e| format!("解析 GitHub 邮箱信息失败: {}", e))?;

    // 优先返回主要且已验证的邮箱
    let primary_email = emails
        .iter()
        .find(|e| e.primary && e.verified)
        .or_else(|| emails.iter().find(|e| e.verified))
        .ok_or_else(|| "未找到已验证的 GitHub 邮箱".to_string())?;

    Ok(primary_email.email.clone())
}

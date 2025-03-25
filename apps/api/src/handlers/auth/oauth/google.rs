use axum::{
    Extension,
    extract::Query,
    http::header,
    response::{IntoResponse, Redirect},
};
use axum_extra::extract::cookie::Cookie;
use chrono::Duration;
use oauth2::{
    AuthUrl, AuthorizationCode, ClientId, ClientSecret, CsrfToken, RedirectUrl, Scope,
    TokenResponse, TokenUrl, basic::BasicClient,
};
use reqwest::Client as HttpClient;
use std::sync::Arc;
use validator::Validate;

use crate::{
    AppState,
    db::UserExt,
    dtos::{GoogleCallbackDto, GoogleUserInfo},
    error::HttpError,
    models::AuthProvider,
    utils::{password, token},
};

/// 处理 Google OAuth 登录请求 -- 重定向到 Google 登录页面
///
/// 创建 Google OAuth 授权 URL 并重定向用户
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含 Google OAuth 配置等共享资源
///
/// # 返回
/// - 重定向响应，将用户重定向到 Google 登录页面
pub async fn google_oauth_login(
    Extension(app_state): Extension<Arc<AppState>>,
) -> impl IntoResponse {
    // 检查是否配置了 Google OAuth
    if app_state.env.google_client_id.is_empty() || app_state.env.google_client_secret.is_empty() {
        return Err(HttpError::server_error("Google OAuth 未配置".to_string()));
    }

    let auth_url = AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
        .expect("Invalid authorization endpoint URL");
    let token_url = TokenUrl::new("https://www.googleapis.com/oauth2/v3/token".to_string())
        .expect("Invalid token endpoint URL");

    // 创建 OAuth2 客户端
    let client = BasicClient::new(ClientId::new(app_state.env.google_client_id.clone()))
        .set_client_secret(ClientSecret::new(
            app_state.env.google_client_secret.clone(),
        ))
        .set_auth_uri(auth_url)
        .set_token_uri(token_url)
        .set_redirect_uri(
            RedirectUrl::new(app_state.env.google_redirect_url.clone()).expect("无效的重定向 URL"),
        );

    // 设置授权范围
    let (authorize_url, csrf_state) = client
        .authorize_url(CsrfToken::new_random)
        .add_scope(Scope::new("profile".to_string()))
        .add_scope(Scope::new("email".to_string()))
        .url();

    // 重定向到 Google 授权页面
    Ok(Redirect::to(authorize_url.as_ref()))
}

/// 处理 Google OAuth 回调请求
///
/// 验证 Google 返回的授权码，获取用户信息，并创建或更新用户
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含数据库连接和 Google OAuth 配置
/// - `query` -- URL 查询参数，包含授权码
///
/// # 返回
/// - 重定向响应，将用户重定向到前端应用
pub async fn google_oauth_callback(
    Extension(app_state): Extension<Arc<AppState>>,
    Query(query): Query<GoogleCallbackDto>,
) -> impl IntoResponse {
    // 处理错误响应
    if let Some(error) = &query.error {
        tracing::error!("Google OAuth 错误: {}", error);
        return Err(HttpError::bad_request(format!(
            "Google 登录失败: {}",
            error
        )));
    }

    let auth_url = AuthUrl::new("https://accounts.google.com/o/oauth2/v2/auth".to_string())
        .expect("Invalid authorization endpoint URL");
    let token_url = TokenUrl::new("https://www.googleapis.com/oauth2/v3/token".to_string())
        .expect("Invalid token endpoint URL");

    let http_client = reqwest::ClientBuilder::new()
        // Following redirects opens the client up to SSRF vulnerabilities.
        .redirect(reqwest::redirect::Policy::none())
        .build()
        .expect("Client should build");

    // 创建 OAuth2 客户端
    let client = BasicClient::new(ClientId::new(app_state.env.google_client_id.clone()))
        .set_client_secret(ClientSecret::new(
            app_state.env.google_client_secret.clone(),
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
    let user_info = get_google_user_info(access_token).await.map_err(|e| {
        tracing::error!("获取 Google 用户信息失败: {}", e);
        HttpError::server_error("无法获取用户信息".to_string())
    })?;

    // 检查用户是否已存在 (通过 provider_user_id 或 email)
    let existing_user = app_state
        .db_client
        .get_user_by_provider(AuthProvider::Google, &user_info.id)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let user = if let Some(user) = existing_user {
        // 用户已存在，更新信息
        app_state
            .db_client
            .update_google_user(&user.id, user_info.name.clone(), user_info.picture.clone())
            .await
            .map_err(|e| HttpError::server_error(e.to_string()))?
    } else {
        // 检查邮箱是否已注册但不是通过 Google
        let email_user = app_state
            .db_client
            .get_user(None, None, Some(&user_info.email), None)
            .await
            .map_err(|e| HttpError::server_error(e.to_string()))?;

        if let Some(user) = email_user {
            // 邮箱已经被其他非 Google 账户使用
            if user.auth_provider != AuthProvider::Google {
                return Err(HttpError::bad_request(format!(
                    "邮箱 {} 已被其他账户使用",
                    user_info.email
                )));
            }
        }

        // 创建新用户
        let random_password = uuid::Uuid::new_v4().to_string();
        let hashed_password =
            password::hash(&random_password).map_err(|e| HttpError::server_error(e.to_string()))?;

        app_state
            .db_client
            .save_google_user(
                &user_info.name,
                &user_info.email,
                &hashed_password,
                &user_info.id,
                user_info.picture.clone(),
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

/// 从 Google API 获取用户信息
///
/// 使用访问令牌从 Google API 获取用户的个人资料信息
///
/// # 参数
/// - `access_token` - Google 提供的访问令牌
///
/// # 返回
/// - `Result<GoogleUserInfo, String>` - 成功时返回用户信息，失败时返回错误信息
async fn get_google_user_info(access_token: &str) -> Result<GoogleUserInfo, String> {
    let client = HttpClient::new();
    let response = client
        .get("https://www.googleapis.com/oauth2/v1/userinfo")
        .bearer_auth(access_token)
        .send()
        .await
        .map_err(|e| format!("请求 Google API 失败: {}", e))?;

    if !response.status().is_success() {
        let status = response.status();
        let text = response.text().await.unwrap_or_default();
        return Err(format!("Google API 返回错误: {} - {}", status, text));
    }

    let user_info = response
        .json::<GoogleUserInfo>()
        .await
        .map_err(|e| format!("解析 Google 用户信息失败: {}", e))?;

    Ok(user_info)
}

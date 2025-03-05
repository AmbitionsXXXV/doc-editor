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
use validator::Validate;

use crate::{
    AppState,
    db::UserExt,
    dtos::{
        ForgotPasswordRequestDto, LoginUserDto, RegisterUserDto, ResendVerificationDto,
        ResetPasswordRequestDto, Response, UserLoginResponseDto, VerifyEmailQueryDto,
    },
    error::{ErrorMessage, HttpError},
    mail::mails::{send_forgot_password_email, send_verification_email, send_welcome_email},
    utils::{password, token},
};

pub fn auth_handler() -> Router {
    Router::new()
        .route("/register", post(register))
        .route("/login", post(login))
        .route("/verify", get(verify_email))
        // -- 重新发送验证邮件的端点
        .route("/resend-verification", post(resend_verification_email))
        .route("/forgot-password", post(forgot_password))
        .route("/reset-password", post(reset_password))
}

/// 处理用户注册请求 -- 创建新用户并发送验证邮件
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含数据库连接等共享资源
/// - `body` -- 用户注册请求体，包含用户名、邮箱和密码
///
/// # 返回
/// - `Ok(Response)` -- 注册成功，返回成功消息
/// - `Err(HttpError)` -- 注册失败，返回错误信息
///   - `BadRequest` -- 请求参数验证失败
///   - `UniqueViolation` -- 邮箱已存在
///   - `ServerError` -- 服务器内部错误
pub async fn register(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<RegisterUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    // -- 验证请求数据
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    // -- 检查邮箱是否已注册
    let user_exists = app_state
        .db_client
        .get_user(None, None, Some(&body.email), None)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    if user_exists.is_some() {
        return Err(HttpError::bad_request("邮箱已被注册".to_string()));
    }

    // -- 生成验证 token，有效期设置为 30 分钟
    let verification_token = uuid::Uuid::new_v4().to_string();
    let token_expires_at = Utc::now() + Duration::minutes(30);

    // -- 打印时间信息以便调试
    tracing::info!(
        "生成验证 token，当前时间: {:?}, 过期时间: {:?}",
        Utc::now(),
        token_expires_at
    );

    // -- 加密密码
    let hash_password =
        password::hash(&body.password).map_err(|e| HttpError::server_error(e.to_string()))?;

    // -- 保存用户信息
    let result = app_state
        .db_client
        .save_user(
            &body.name,
            &body.email,
            &hash_password,
            &verification_token,
            token_expires_at,
        )
        .await;

    match result {
        Ok(_user) => {
            // -- 异步发送验证邮件
            let email = body.email.clone();
            let name = body.name.clone();
            let token = verification_token.clone();

            tracing::info!("用户注册成功，准备发送验证邮件给: {}", email);

            tokio::spawn(async move {
                match send_verification_email(&email, &name, &token).await {
                    Ok(_) => tracing::info!("成功发送验证邮件给用户: {}", email),
                    Err(e) => tracing::error!("发送验证邮件失败: {}", e),
                }
            });

            // -- 返回注册成功响应
            Ok((
                StatusCode::CREATED,
                Json(Response {
                    status: "success",
                    message: "注册成功，请在 30 分钟内完成邮箱验证".to_string(),
                }),
            ))
        }
        // -- 处理数据库错误
        Err(sqlx::Error::Database(db_err)) => {
            // -- 处理唯一约束违反（邮箱已存在）
            if db_err.is_unique_violation() {
                Err(HttpError::unique_constraint_violation(
                    ErrorMessage::EmailExist.to_string(),
                ))
            } else {
                // -- 处理其他数据库错误
                Err(HttpError::server_error(db_err.to_string()))
            }
        }
        // -- 处理其他错误
        Err(e) => Err(HttpError::server_error(e.to_string())),
    }
}

/// 处理用户登录请求 -- 验证用户身份并生成访问令牌
///
/// # 参数
/// - `app_state` -- 应用程序状态，包含数据库连接等共享资源
/// - `body` -- 登录请求体，包含邮箱和密码
///
/// # 返回
/// - `Ok(Response)` -- 登录成功，返回访问令牌和用户信息
/// - `Err(HttpError)` -- 登录失败，返回错误信息
///   - `BadRequest` -- 请求参数验证失败
///   - `Unauthorized` -- 邮箱或密码错误
///   - `ServerError` -- 服务器内部错误
///   - `NotFound` -- 用户未找到
///   - `Forbidden` -- 账户未验证
pub async fn login(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<LoginUserDto>,
) -> Result<impl IntoResponse, HttpError> {
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    let result = app_state
        .db_client
        .get_user(None, None, Some(&body.email), None)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let user = result.ok_or(HttpError::bad_request(
        ErrorMessage::WrongCredentials.to_string(),
    ))?;

    let password_matched = password::compare(&body.password, &user.password)
        .map_err(|_| HttpError::bad_request(ErrorMessage::WrongCredentials.to_string()))?;

    if password_matched {
        let token = token::create_token(
            &user.id.to_string(),
            app_state.env.jwt_secret.as_bytes(),
            app_state.env.jwt_maxage,
        )
        .map_err(|e| HttpError::server_error(e.to_string()))?;

        let cookie_duration = time::Duration::minutes(app_state.env.jwt_maxage * 60);
        let cookie = Cookie::build(("token", token.clone()))
            .path("/")
            .max_age(cookie_duration)
            .http_only(true)
            .build();

        let response = axum::response::Json(UserLoginResponseDto {
            status: "success".to_string(),
            token,
        });

        let mut headers = HeaderMap::new();

        headers.append(header::SET_COOKIE, cookie.to_string().parse().unwrap());

        let mut response = response.into_response();
        response.headers_mut().extend(headers);

        Ok(response)
    } else {
        Err(HttpError::bad_request(
            ErrorMessage::WrongCredentials.to_string(),
        ))
    }
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

pub async fn forgot_password(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<ForgotPasswordRequestDto>,
) -> Result<impl IntoResponse, HttpError> {
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    tracing::info!("处理忘记密码请求: {}", body.email);

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
        HttpError::bad_request("Email not found!".to_string())
    })?;

    let verification_token = uuid::Uuid::new_v4().to_string();
    let expires_at = Utc::now() + Duration::minutes(30);

    tracing::info!(
        "为用户 {} 生成密码重置 token，过期时间: {:?}",
        user.email,
        expires_at
    );

    let user_id = uuid::Uuid::parse_str(&user.id.to_string()).unwrap();

    app_state
        .db_client
        .add_verified_token(user_id, &verification_token, expires_at)
        .await
        .map_err(|e| {
            tracing::error!("更新密码重置 token 失败: {}", e);
            HttpError::server_error(e.to_string())
        })?;

    let reset_link = format!(
        "{}/reset-password?token={}",
        &app_state.env.frontend_url, verification_token
    );

    tracing::info!("生成密码重置链接: {}", reset_link);

    // -- 发送密码重置邮件
    match send_forgot_password_email(&user.email, &reset_link, &user.name).await {
        Ok(_) => {
            tracing::info!("成功发送密码重置邮件给用户: {}", user.email);

            let response = Response {
                message: "密码重置邮件已发送，请在 30 分钟内完成重置".to_string(),
                status: "success",
            };

            Ok(Json(response))
        }
        Err(e) => {
            tracing::error!("发送密码重置邮件失败: {}", e);
            Err(HttpError::server_error("发送邮件失败".to_string()))
        }
    }
}

pub async fn reset_password(
    Extension(app_state): Extension<Arc<AppState>>,
    Json(body): Json<ResetPasswordRequestDto>,
) -> Result<impl IntoResponse, HttpError> {
    body.validate()
        .map_err(|e| HttpError::bad_request(e.to_string()))?;

    let result = app_state
        .db_client
        .get_user(None, None, None, Some(&body.token))
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let user = result.ok_or(HttpError::bad_request(
        "Invalid or expired token".to_string(),
    ))?;

    if let Some(expires_at) = user.token_expires_at {
        if Utc::now() > expires_at {
            return Err(HttpError::bad_request(
                "Verification token has expired".to_string(),
            ))?;
        }
    } else {
        return Err(HttpError::bad_request(
            "Invalid verification token".to_string(),
        ))?;
    }

    let user_id = uuid::Uuid::parse_str(&user.id.to_string()).unwrap();

    let hash_password =
        password::hash(&body.new_password).map_err(|e| HttpError::server_error(e.to_string()))?;

    app_state
        .db_client
        .update_user_password(user_id, hash_password)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    app_state
        .db_client
        .verified_token(&body.token)
        .await
        .map_err(|e| HttpError::server_error(e.to_string()))?;

    let response = Response {
        message: "Password has been successfully reset.".to_string(),
        status: "success",
    };

    Ok(Json(response))
}

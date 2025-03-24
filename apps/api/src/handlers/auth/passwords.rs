use std::sync::Arc;

use axum::{Extension, Json, response::IntoResponse};
use chrono::{Duration, Utc};
use validator::Validate;

use crate::{
    AppState,
    db::{DbError, UserExt},
    dtos::{ForgotPasswordRequestDto, ResetPasswordRequestDto, Response},
    error::HttpError,
    mail::mails::send_forgot_password_email,
    utils::password,
};

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

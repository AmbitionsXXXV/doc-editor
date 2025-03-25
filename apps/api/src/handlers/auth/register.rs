use std::sync::Arc;

use axum::{Extension, Json, http::StatusCode, response::IntoResponse};
use chrono::{Duration, Utc};
use validator::Validate;

use crate::{
    AppState,
    db::{DbError, UserExt},
    dtos::{RegisterUserDto, Response},
    error::{ErrorMessage, HttpError},
    mail::mails::send_verification_email,
    utils::password,
};

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
        Err(DbError::Sqlx(db_err)) => {
            // -- 处理唯一约束违反（邮箱已存在）
            if let Some(db_err) = db_err.as_database_error() {
                if db_err.is_unique_violation() {
                    Err(HttpError::unique_constraint_violation(
                        ErrorMessage::EmailExist.to_string(),
                    ))
                } else {
                    // -- 处理其他数据库错误
                    Err(HttpError::server_error(db_err.to_string()))
                }
            } else {
                // -- 处理非数据库错误
                Err(HttpError::server_error(db_err.to_string()))
            }
        }
        // -- 处理其他错误
        Err(e) => Err(HttpError::server_error(e.to_string())),
    }
}

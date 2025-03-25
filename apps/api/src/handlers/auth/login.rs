use std::sync::Arc;

use axum::{
    Extension, Json,
    http::{HeaderMap, header},
    response::IntoResponse,
};
use axum_extra::extract::cookie::Cookie;
use chrono::Duration;
use validator::Validate;

use crate::{
    AppState,
    db::UserExt,
    dtos::{LoginUserDto, UserLoginResponseDto},
    error::{ErrorMessage, HttpError},
    utils::{password, token},
};

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

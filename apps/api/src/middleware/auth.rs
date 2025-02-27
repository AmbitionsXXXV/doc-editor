use axum::{Extension, extract::Request, middleware::Next, response::IntoResponse};
use axum_extra::extract::CookieJar;
use hyper::header;
use serde::{Deserialize, Serialize};

use crate::errors::{ErrorMessage, HttpError};

#[derive(Debug, Serialize, Deserialize)]
pub struct Claims {
    pub sub: String,
    pub exp: u64,
    pub iat: u64,
}

pub async fn auth(
    cookie_jar: CookieJar,
    // Extension(app_state): Extension<Arc<AppState>>,
    req: Request,
    next: Next,
) -> Result<impl IntoResponse, HttpError> {
    // This is a placeholder implementation
    // In a real application, you would:
    // 1. Get the JWT secret from the config
    // 2. Verify the token
    // 3. Add the user ID to the request extensions

    // For now, we'll just check if the token is not empty
    let cookies = cookie_jar
        .get("token")
        .map(|cookie| cookie.value().to_string())
        .or_else(|| {
            req.headers()
                .get(header::AUTHORIZATION)
                .and_then(|auth_header| auth_header.to_str().ok())
                .and_then(|auth_value| -> Option<String> {
                    if auth_value.starts_with("Bearer ") {
                        Some(auth_value[7..].to_owned())
                    } else {
                        None
                    }
                })
        });

    let token = cookies
        .ok_or_else(|| HttpError::unauthorized(ErrorMessage::TokenNotProvided.to_string()))?;

    // Normally, you'd do something like this:
    // let config = request.extensions().get::<Config>().unwrap();
    // let token_data = decode::<Claims>(
    //     auth.token(),
    //     &DecodingKey::from_secret(config.jwt_secret.as_bytes()),
    //     &Validation::new(Algorithm::HS256),
    // ).map_err(|_| AppError::Unauthorized("Invalid token".to_string()))?;

    // request.extensions_mut().insert(token_data.claims.sub);

    Ok(next.run(req).await)
}

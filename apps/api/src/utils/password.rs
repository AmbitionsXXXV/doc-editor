use argon2::{
    Argon2,
    password_hash::{PasswordHash, PasswordHasher, PasswordVerifier, SaltString, rand_core::OsRng},
};

use crate::error::ErrorMessage;

const MAX_PASSWORD_LENGTH: usize = 64;

/// 对密码进行哈希处理。
///
/// 如果密码为空或超过最大允许长度，将返回错误。
///
/// # 错误类型
///
/// - `EmptyPassword`: -- 密码为空时返回此错误
/// - `ExceededMaxPasswordLength`: -- 密码超过最大允许长度时返回此错误
/// - `HashingError`: -- 密码哈希处理失败时返回此错误
pub fn hash(password: impl Into<String>) -> Result<String, ErrorMessage> {
    let password = password.into();

    if password.is_empty() {
        return Err(ErrorMessage::EmptyPassword);
    }

    if password.len() > MAX_PASSWORD_LENGTH {
        return Err(ErrorMessage::ExceededMaxPasswordLength(MAX_PASSWORD_LENGTH));
    }

    let salt = SaltString::generate(&mut OsRng);
    let hashed_password = Argon2::default()
        .hash_password(password.as_bytes(), &salt)
        .map_err(|_| ErrorMessage::HashingError)?
        .to_string();

    Ok(hashed_password)
}

/// 比较原始密码与其哈希版本。
///
/// 此函数接收一个原始密码和一个哈希后的密码，
/// 如果原始密码与哈希密码匹配则返回 `true`，
/// 否则返回 `false`。
///
/// 如果原始密码为空或超过最大允许长度，
/// 此函数将返回错误。
///
/// # 错误类型
///
/// - `EmptyPassword`: -- 原始密码为空
/// - `ExceededMaxPasswordLength`: -- 原始密码超过最大允许长度
/// - `InvalidHashFormat`: -- 哈希密码格式无效
pub fn compare(password: &str, hashed_password: &str) -> Result<bool, ErrorMessage> {
    if password.is_empty() {
        return Err(ErrorMessage::EmptyPassword);
    }

    if password.len() > MAX_PASSWORD_LENGTH {
        return Err(ErrorMessage::ExceededMaxPasswordLength(MAX_PASSWORD_LENGTH));
    }

    let parsed_hash =
        PasswordHash::new(hashed_password).map_err(|_| ErrorMessage::InvalidHashFormat)?;

    let password_matched = Argon2::default()
        .verify_password(password.as_bytes(), &parsed_hash)
        .is_ok_and(|_| true);

    Ok(password_matched)
}

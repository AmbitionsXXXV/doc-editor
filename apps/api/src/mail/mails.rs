use crate::{config::Config, mail::sendmail::send_email};
use std::path::Path;

pub async fn send_verification_email(
    to_email: &str,
    username: &str,
    token: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let subject = "Email Verification";
    let template_path = get_template_path("Verification-email.html")?;
    let config = Config::from_env();
    let base_url = format!("http://localhost:{}/api/auth/verify", config.server_port);
    let verification_link = create_verification_link(&base_url, token);
    let placeholders = vec![
        ("{{username}}".to_string(), username.to_string()),
        ("{{verification_link}}".to_string(), verification_link),
    ];

    send_email(to_email, subject, &template_path, &placeholders).await
}

fn create_verification_link(base_url: &str, token: &str) -> String {
    format!("{}?token={}", base_url, token)
}

pub async fn send_welcome_email(
    to_email: &str,
    username: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let subject = "Welcome to Application";
    let template_path = get_template_path("Welcome-email.html")?;
    let placeholders = vec![("{{username}}".to_string(), username.to_string())];

    send_email(to_email, subject, &template_path, &placeholders).await
}

pub async fn send_forgot_password_email(
    to_email: &str,
    reset_link: &str,
    username: &str,
) -> Result<(), Box<dyn std::error::Error>> {
    let subject = "Reset your Password";
    let template_path = get_template_path("ResetPassword-email.html")?;
    let placeholders = vec![
        ("{{username}}".to_string(), username.to_string()),
        ("{{reset_link}}".to_string(), reset_link.to_string()),
    ];

    send_email(to_email, subject, &template_path, &placeholders).await
}

/// 获取邮件模板的绝对路径
fn get_template_path(template_name: &str) -> Result<String, Box<dyn std::error::Error>> {
    let possible_paths = vec![
        format!("src/mail/templates/{}", template_name),
        format!("apps/api/src/mail/templates/{}", template_name),
    ];

    for path in possible_paths {
        if Path::new(&path).exists() {
            return Ok(path);
        }
    }

    Err(format!("找不到邮件模板: {}", template_name).into())
}

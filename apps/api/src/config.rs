use std::env;

// -- 应用配置结构体
#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub server_port: u16,
    pub jwt_secret: String,
    pub jwt_maxage: i64,
    pub frontend_url: String,
    pub log_dir: String,
    pub log_retention_days: u64,
    pub max_connections: u32,
    pub host: String,
    pub cors_allowed_origins: Vec<String>,
    pub env: String,
    pub google_client_id: String,
    pub google_client_secret: String,
    pub google_redirect_url: String,
    pub github_client_id: String,
    pub github_client_secret: String,
    pub github_redirect_url: String,
}

impl Config {
    /// 从环境变量加载配置
    ///
    /// 读取环境变量并将其加载到 `Config` 实例中。
    /// 对于必要的环境变量，如果不存在或解析失败，将使用默认值并记录警告。
    ///
    pub fn from_env() -> Self {
        // 获取当前环境
        let env_mode = env::var("ENV").unwrap_or_else(|_| "development".to_string());

        // 数据库配置
        let database_url = env::var("DATABASE_URL").unwrap_or_else(|_| {
            eprintln!("警告: DATABASE_URL 未设置，使用默认值");
            "postgres://postgres:postgres@localhost:5432/doc_editor".to_string()
        });

        let max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "10".to_string())
            .parse()
            .unwrap_or_else(|_| {
                eprintln!("警告: DATABASE_MAX_CONNECTIONS 解析失败，使用默认值 10");
                10
            });

        // 服务器配置
        let host = env::var("API_HOST").unwrap_or_else(|_| "127.0.0.1".to_string());

        let server_port = env::var("API_PORT")
            .or_else(|_| env::var("SERVER_PORT"))
            .unwrap_or_else(|_| "8080".to_string())
            .parse()
            .unwrap_or_else(|_| {
                eprintln!("警告: SERVER_PORT/API_PORT 解析失败，使用默认值 8080");
                8080
            });

        // JWT 配置
        let jwt_secret = env::var("JWT_SECRET_KEY").unwrap_or_else(|_| {
            if env_mode == "production" {
                eprintln!("警告: 生产环境中 JWT_SECRET_KEY 未设置，使用随机值");
            }
            uuid::Uuid::new_v4().to_string()
        });

        let jwt_maxage = env::var("JWT_MAXAGE")
            .unwrap_or_else(|_| "60".to_string())
            .parse()
            .unwrap_or_else(|_| {
                eprintln!("警告: JWT_MAXAGE 解析失败，使用默认值 60");
                60
            });

        // 前端 URL
        let frontend_url = env::var("FRONTEND_URL")
            .or_else(|_| env::var("VITE_PUBLIC_URL"))
            .unwrap_or_else(|_| "http://localhost:5173".to_string());

        // CORS 配置
        let cors_allowed_origins = env::var("CORS_ALLOWED_ORIGINS")
            .unwrap_or_else(|_| frontend_url.clone())
            .split(',')
            .map(|s| s.trim().to_string())
            .collect();

        // 日志配置
        let log_dir = env::var("LOG_DIR").unwrap_or_else(|_| "./logs".to_string());

        let log_retention_days = env::var("LOG_RETENTION_DAYS")
            .unwrap_or_else(|_| "7".to_string())
            .parse()
            .unwrap_or_else(|_| {
                eprintln!("警告: LOG_RETENTION_DAYS 解析失败，使用默认值 7");
                7
            });

        // Google OAuth 配置
        let google_client_id = env::var("GOOGLE_CLIENT_ID").unwrap_or_else(|_| {
            if env_mode == "production" {
                eprintln!("警告: 生产环境中 GOOGLE_CLIENT_ID 未设置");
            }
            "".to_string()
        });

        let google_client_secret = env::var("GOOGLE_CLIENT_SECRET").unwrap_or_else(|_| {
            if env_mode == "production" {
                eprintln!("警告: 生产环境中 GOOGLE_CLIENT_SECRET 未设置");
            }
            "".to_string()
        });

        let google_redirect_url = env::var("GOOGLE_REDIRECT_URL")
            .unwrap_or_else(|_| format!("{}/api/auth/google/callback", frontend_url));

        // GitHub OAuth 配置
        let github_client_id = env::var("GITHUB_CLIENT_ID").unwrap_or_else(|_| {
            if env_mode == "production" {
                eprintln!("警告: 生产环境中 GITHUB_CLIENT_ID 未设置");
            }
            "".to_string()
        });

        let github_client_secret = env::var("GITHUB_CLIENT_SECRET").unwrap_or_else(|_| {
            if env_mode == "production" {
                eprintln!("警告: 生产环境中 GITHUB_CLIENT_SECRET 未设置");
            }
            "".to_string()
        });

        let github_redirect_url = env::var("GITHUB_REDIRECT_URL")
            .unwrap_or_else(|_| format!("{}/api/auth/github/callback", frontend_url));

        Self {
            jwt_secret,
            jwt_maxage,
            database_url,
            server_port,
            frontend_url,
            log_dir,
            log_retention_days,
            max_connections,
            host,
            cors_allowed_origins,
            env: env_mode,
            google_client_id,
            google_client_secret,
            google_redirect_url,
            github_client_id,
            github_client_secret,
            github_redirect_url,
        }
    }
}

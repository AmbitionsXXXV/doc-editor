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
}

impl Config {
    /// 从环境变量加载配置
    ///
    /// 读取环境变量 `DATABASE_URL`, `JWT_SECRET_KEY`, `JWT_MAXAGE`, `SERVER_PORT`,
    /// `FRONTEND_URL`, `LOG_DIR` 和 `LOG_RETENTION_DAYS`，并将其加载到 `Config` 实例中。
    /// 如果必要的环境变量不存在或解析失败，将会 panic。
    ///
    pub fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
        let jwt_secret = std::env::var("JWT_SECRET_KEY").expect("JWT_SECRET_KEY must be set");
        let jwt_maxage = std::env::var("JWT_MAXAGE")
            .expect("JWT_MAXAGE must be set")
            .parse()
            .expect("JWT_MAXAGE must be a number");

        let server_port = env::var("SERVER_PORT")
            .unwrap_or_else(|_| "3000".to_string())
            .parse()
            .expect("SERVER_PORT must be a valid number");

        let frontend_url =
            env::var("FRONTEND_URL").unwrap_or_else(|_| "http://localhost:5173".to_string());

        // 日志目录，默认为 /var/log/axum_backend
        let log_dir = env::var("LOG_DIR").unwrap_or_else(|_| "/var/log/axum_backend".to_string());

        // 日志保留天数，默认为 7 天
        let log_retention_days = env::var("LOG_RETENTION_DAYS")
            .unwrap_or_else(|_| "7".to_string())
            .parse()
            .unwrap_or(7);

        let max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "10".to_string())
            .parse()
            .unwrap_or(10);

        Self {
            jwt_secret,
            jwt_maxage,
            database_url,
            server_port,
            frontend_url,
            log_dir,
            log_retention_days,
            max_connections,
        }
    }
}

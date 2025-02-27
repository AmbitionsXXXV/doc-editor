use std::env;

#[derive(Debug, Clone)]
pub struct Config {
    pub database_url: String,
    pub database_max_connections: u32,
    pub jwt_secret: String,
    pub jwt_expiration: u64,
}

impl Config {
    pub fn from_env() -> Self {
        let database_url = env::var("DATABASE_URL")
            .expect("DATABASE_URL must be set");
            
        let database_max_connections = env::var("DATABASE_MAX_CONNECTIONS")
            .unwrap_or_else(|_| "5".to_string())
            .parse::<u32>()
            .expect("DATABASE_MAX_CONNECTIONS must be a number");
            
        let jwt_secret = env::var("JWT_SECRET")
            .expect("JWT_SECRET must be set");
            
        let jwt_expiration = env::var("JWT_EXPIRATION")
            .unwrap_or_else(|_| "86400".to_string())
            .parse::<u64>()
            .expect("JWT_EXPIRATION must be a number");
            
        Self {
            database_url,
            database_max_connections,
            jwt_secret,
            jwt_expiration,
        }
    }
}

#![allow(unused)]

mod config;
mod db;
mod dtos;
mod error;
mod handlers;
mod mail;
mod middleware;
mod models;
mod repositories;
mod routes;
mod utils;

use std::path::Path;
use std::sync::Arc;

use axum::{
    http::{
        HeaderValue, Method,
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    },
    middleware::from_fn,
    routing::get,
};
use config::Config;
use db::DBClient;
use dotenvy::dotenv;
use routes::create_router;
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use utils::init_production_logging;

pub struct AppState {
    pub env: Config,
    pub db_client: DBClient,
    pub user_repository: repositories::user::DbUserRepository,
    pub document_repository: repositories::document::DbDocumentRepository,
}

/// Bootstrap the application
///
/// This function initializes all components of the application:
/// - Loads environment variables and configurations
/// - Sets up logging
/// - Establishes database connections
/// - Configures middleware
/// - Sets up the HTTP server with all routes
#[tokio::main]
async fn main() -> Result<(), Box<dyn std::error::Error>> {
    // -- 加载环境变量，优先从根目录加载
    // 1. 尝试加载根目录的 .env 文件
    let root_env_path = Path::new("../../.env");
    if root_env_path.exists() {
        println!("Loading environment variables from root directory");
        dotenvy::from_path(root_env_path).ok();
    }

    // 2. 然后加载当前目录的 .env 文件（如果存在，它会覆盖根目录的同名变量）
    dotenv().ok();

    // 3. 根据环境加载特定环境的配置
    let env = std::env::var("ENV").unwrap_or_else(|_| "development".to_string());
    let env_file = format!("../../.env.{}", env);
    let env_path = Path::new(&env_file);
    if env_path.exists() {
        println!("Loading environment-specific variables from: {}", env_file);
        dotenvy::from_path(env_path).ok();
    }

    // -- 加载配置
    let config = config::Config::from_env();

    // -- 打印配置信息
    println!("Environment: {}", config.env);
    println!(
        "Database URL: {}",
        config.database_url.split('@').last().unwrap_or("")
    );
    println!("Server: {}:{}", config.host, config.server_port);

    // -- 初始化日志系统
    init_production_logging(Some(&config.log_dir), Some(config.log_retention_days)).await;
    tracing::info!("Logging initialized");

    // -- 设置数据库连接池
    tracing::info!(
        "Connecting to database at {}",
        config.database_url.split('@').last().unwrap_or("")
    );
    let pool = PgPoolOptions::new()
        .max_connections(config.max_connections)
        .connect(&config.database_url)
        .await
        .map_err(|err| {
            tracing::error!("🐞 Failed to connect to the database: {:?}", err);
            err
        })?;
    tracing::info!("✅ Connected to database successfully");

    // -- 配置 CORS 中间件
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .cors_allowed_origins
                .first()
                .map(|origin| {
                    origin.parse::<HeaderValue>().unwrap_or_else(|_| {
                        tracing::warn!("Invalid origin: {}, using wildcard", origin);
                        HeaderValue::from_static("*")
                    })
                })
                .unwrap_or_else(|| HeaderValue::from_static("*")),
        )
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        .allow_credentials(true)
        .allow_methods([
            Method::GET,
            Method::POST,
            Method::PUT,
            Method::DELETE,
            Method::OPTIONS,
        ]);
    tracing::info!(
        "CORS configured for origins: {:?}",
        config.cors_allowed_origins
    );

    // -- 初始化应用状态
    let db_client = DBClient::new(pool);
    let db_client_arc = Arc::new(db_client.clone());

    let user_repository = repositories::user::DbUserRepository::new(db_client_arc.clone());
    let document_repository = repositories::document::DbDocumentRepository::new(db_client_arc);

    let app_state = Arc::new(AppState {
        env: config.clone(),
        db_client,
        user_repository,
        document_repository,
    });

    // -- 创建路由
    let mut app = create_router(app_state).layer(cors);

    if config.env == "development" {
        app = app.route("/", get(|| async { "Hello, World!" }));
    }

    // -- 配置并启动 HTTP 服务器
    let bind_addr = format!("{}:{}", &config.host, &config.server_port);
    tracing::info!("Starting server on {}", bind_addr);
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!(
        "✅ Server running at http://{}:{}",
        config.host,
        config.server_port
    );

    // -- 开始处理请求
    axum::serve(listener, app).await?;

    Ok(())
}

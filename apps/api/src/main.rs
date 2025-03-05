#![allow(unused)]

mod config;
mod db;
mod dtos;
mod error;
mod handlers;
mod mail;
mod middleware;
mod models;
mod routes;
mod utils;

use std::sync::Arc;

use axum::{
    http::{
        HeaderValue, Method,
        header::{ACCEPT, AUTHORIZATION, CONTENT_TYPE},
    },
    middleware::from_fn,
};
use config::Config;
use db::DBClient;
use dotenvy::dotenv;
use routes::create_router;
use sqlx::postgres::PgPoolOptions;
use tower_http::cors::CorsLayer;
use utils::init_production_logging;

#[derive(Debug, Clone)]
pub struct AppState {
    pub env: Config,
    pub db_client: DBClient,
}

#[tokio::main]
async fn main() {
    // -- 加载环境变量
    dotenv().ok();

    // -- 加载配置
    let config = config::Config::from_env();

    // -- 初始化日志系统，使用配置中的日志目录和保留天数
    init_production_logging(Some(&config.log_dir), Some(config.log_retention_days)).await;

    // -- 创建数据库连接池
    let pool = match PgPoolOptions::new()
        .max_connections(config.max_connections)
        .connect(&config.database_url)
        .await
    {
        Ok(pool) => {
            tracing::info!("✅ Connection to the database is successful!");
            pool
        }
        Err(err) => {
            tracing::error!("🔥 Failed to connect to the database: {:?}", err);
            std::process::exit(1);
        }
    };

    // -- 创建一个新的 CORS 中间件层
    let cors = CorsLayer::new()
        // -- 允许来自前端 URL 的跨域请求
        .allow_origin(config.frontend_url.parse::<HeaderValue>().unwrap())
        // -- 允许请求头中包含 认证、 接受类型 和 内容类型 字段
        .allow_headers([AUTHORIZATION, ACCEPT, CONTENT_TYPE])
        // -- 允许跨域请求中包含 认证信息（如 cookies）
        .allow_credentials(true)
        // -- 允许使用 GET、 POST 和 PUT 这些 HTTP 请求方法
        .allow_methods([Method::GET, Method::POST, Method::PUT]);

    // -- 初始化数据库客户端连接
    let db_client = DBClient::new(pool);
    // -- 创建应用程序状态，包含 环境配置 和 数据库客户端
    let app_state = AppState {
        env: config.clone(),
        db_client,
    };

    // -- 使用 Arc 包装 app_state 实现线程安全的共享引用，使多个并发请求可以安全地访问应用状态
    let app = create_router(Arc::new(app_state.clone())).layer(cors);

    let listener = tokio::net::TcpListener::bind(format!("0.0.0.0:{}", &config.server_port))
        .await
        .unwrap();

    tracing::info!("Server running on port {}", config.server_port);
    axum::serve(listener, app).await.unwrap();
}

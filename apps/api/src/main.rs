mod config;
mod controllers;
mod database;
mod errors;
mod middleware;
mod models;
mod routes;
mod utils;

#[allow(unused)]

use std::net::SocketAddr;

use axum::{Router, routing::get};
use tower_http::{
    cors::{Any, CorsLayer},
    trace::TraceLayer,
};
use tracing::info;

#[tokio::main]
async fn main() -> anyhow::Result<()> {
    // 加载环境变量
    dotenvy::dotenv().ok();

    // 初始化日志
    tracing_subscriber::fmt::init();

    // 服务器配置
    let host = std::env::var("HOST").unwrap_or_else(|_| "127.0.0.1".to_string());
    let port = std::env::var("PORT")
        .unwrap_or_else(|_| "8080".to_string())
        .parse::<u16>()
        .expect("PORT must be a number");
    let addr = format!("{}:{}", host, port);
    let socket_addr: SocketAddr = addr.parse()?;

    info!("Starting server on {}", socket_addr);

    // CORS 配置
    let cors = CorsLayer::new()
        .allow_origin(Any)
        .allow_methods(Any)
        .allow_headers(Any);

    // 创建路由
    let app = Router::new()
        .route("/", get(|| async { "Doc Editor API is running!" }))
        .route("/health", get(|| async { "OK" }))
        .layer(TraceLayer::new_for_http())
        .layer(cors);

    let listener = tokio::net::TcpListener::bind(socket_addr).await?;

    // 启动服务器
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}

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
use routes::create_router;
use sqlx::postgres::PgPoolOptions;
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

    // -- 加载配置
    let config = config::Config::from_env();

    // -- 创建数据库连接池
    // let pool = match PgPoolOptions::new()
    //     .max_connections(10)
    //     .connect(&config.database_url)
    //     .await
    // {
    //     Ok(pool) => {
    //         println!("✅ Connection to the database is successful!");
    //         pool
    //     }
    //     Err(err) => {
    //         println!("🔥 Failed to connect to the database: {:?}", err);
    //         std::process::exit(1);
    //     }
    // };

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
    // let mut app = create_router(pool)
    let mut app = Router::new().layer(TraceLayer::new_for_http()).layer(cors);

    // -- dev 模式下，添加一个测试路由
    if config.mode == "development" {
        app = app.route("/", get(|| async { "Doc Editor API is running!" }));
    }

    let listener = tokio::net::TcpListener::bind(socket_addr).await?;

    // 启动服务器
    axum::serve(listener, app.into_make_service()).await?;

    Ok(())
}

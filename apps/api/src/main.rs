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
    // -- Load environment variables
    dotenv().ok();

    // -- Load configuration
    let config = config::Config::from_env();

    // -- Initialize logging system with configured log directory and retention
    init_production_logging(Some(&config.log_dir), Some(config.log_retention_days)).await;
    tracing::info!("Logging initialized");

    // -- Setup database connection pool with configured parameters
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

    // --Configure CORS middleware for frontend communication
    let cors = CorsLayer::new()
        .allow_origin(
            config
                .frontend_url
                .parse::<HeaderValue>()
                .unwrap_or_else(|_| {
                    tracing::warn!("Invalid frontend URL, using wildcard");
                    HeaderValue::from_static("*")
                }),
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
    tracing::info!("CORS configured for origin: {}", config.frontend_url);

    // -- Initialize application state with all required components
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

    // -- Create router with all defined routes and middleware
    let app = create_router(app_state).layer(cors);

    // Configure and start the HTTP server
    let bind_addr = format!("0.0.0.0:{}", &config.server_port);
    tracing::info!("Starting server on {}", bind_addr);
    let listener = tokio::net::TcpListener::bind(&bind_addr).await?;
    tracing::info!("✅ Server running on port {}", config.server_port);

    // -- Start serving requests
    axum::serve(listener, app).await?;

    Ok(())
}

use sqlx::{Pool, Postgres, postgres::PgPoolOptions};
use tracing::info;

use crate::config::Config;

pub type DbPool = Pool<Postgres>;

pub async fn create_pool(config: &Config) -> DbPool {
    info!("Creating database connection pool");

    PgPoolOptions::new()
        .max_connections(config.database_max_connections)
        .connect(&config.database_url)
        .await
        .expect("Failed to create database connection pool")
}

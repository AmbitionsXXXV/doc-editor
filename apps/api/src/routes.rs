use std::sync::Arc;

use axum::{Extension, Router, middleware};
use tower_http::trace::TraceLayer;

use crate::{
    AppState,
    handlers::{auth::auth_handler, users::users_handler},
    middleware::auth,
};

pub fn create_router(app_state: Arc<AppState>) -> Router {
    let api_route = Router::new()
        .nest("/auth", auth_handler())
        // -- users 路由请求执行流程：
        // -- 1. 请求首先进入 users 路由
        // -- 2. 经过认证中间件 auth 检查请求中的 token
        // -- 3. token 验证通过后，请求传递给具体的用户处理函数
        .nest("/users", users_handler().layer(middleware::from_fn(auth)))
        // -- 4. TraceLayer 记录整个请求的处理过程，包括耗时、状态等信息
        .layer(TraceLayer::new_for_http())
        // -- 5. Extension 中间件使处理函数能够访问应用状态（如数据库连接）
        .layer(Extension(app_state));

    // -- 创建根路由，并嵌套 API 路由
    Router::new().nest("/api", api_route)
}

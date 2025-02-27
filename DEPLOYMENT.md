# Doc Editor 部署指南

本文档提供了关于 Doc Editor 项目的详细部署说明，包括生产环境配置、性能优化和安全最佳实践。

## 目录

- [部署前准备](#部署前准备)
- [生产环境配置](#生产环境配置)
- [部署选项](#部署选项)
  - [Docker 部署](#docker-部署)
  - [手动部署](#手动部署)
  - [CI/CD 部署](#cicd-部署)
- [数据库设置](#数据库设置)
- [性能优化](#性能优化)
- [安全配置](#安全配置)
- [监控和日志](#监控和日志)
- [备份和恢复](#备份和恢复)
- [更新和回滚](#更新和回滚)

## 部署前准备

在部署 Doc Editor 之前，请确保满足以下要求：

1. **服务器要求**：
   - 最低配置：2 CPU 核心，4GB RAM，20GB 存储
   - 推荐配置：4 CPU 核心，8GB RAM，40GB SSD 存储

2. **软件要求**：
   - Docker 和 Docker Compose（推荐）
   - 或 Node.js 18+，Rust 1.78+，PostgreSQL 16+

3. **域名和 SSL**：
   - 配置好的域名指向服务器
   - SSL 证书（可使用 Let's Encrypt）

4. **环境变量**：准备以下环境变量
   ```
   # 数据库配置
   DATABASE_URL=postgres://user:password@localhost:5432/doc_editor
   
   # 安全配置
   JWT_SECRET=your_secure_random_string
   COOKIE_SECRET=another_secure_random_string
   
   # 日志配置
   RUST_LOG=info
   
   # 服务配置
   API_PORT=8000
   CORS_ORIGIN=https://your-domain.com
   ```

## 生产环境配置

### 前端构建优化

1. **创建生产环境构建**：
   ```bash
   # 安装依赖
   pnpm install --prod
   
   # 构建前端
   pnpm --filter "@doc-editor/web" build
   ```

2. **优化构建选项**：
   - 确保在 `vite.config.ts` 中启用了代码分割
   - 启用 React Compiler 优化
   - 配置适当的缓存策略

### 后端构建优化

1. **创建优化的 Rust 构建**：
   ```bash
   cd apps/api
   cargo build --release --features production
   ```

2. **优化选项**：
   - 使用 `RUSTFLAGS="-C target-cpu=native"` 进行特定 CPU 优化
   - 配置适当的线程池大小

## 部署选项

### Docker 部署

Docker 是最简单的部署方式，适合大多数用例。

1. **构建和启动容器**：
   ```bash
   docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build
   ```

2. **配置 Nginx 反向代理**：
   ```nginx
   server {
       listen 80;
       server_name your-domain.com;
       
       location / {
           return 301 https://$host$request_uri;
       }
   }
   
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       # 前端
       location / {
           proxy_pass http://localhost:3000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
       
       # API
       location /api {
           proxy_pass http://localhost:8000;
           proxy_set_header Host $host;
           proxy_set_header X-Real-IP $remote_addr;
       }
   }
   ```

3. **配置 SSL 证书**：
   ```bash
   # 使用 Certbot 获取 Let's Encrypt 证书
   certbot --nginx -d your-domain.com
   ```

### 手动部署

如果您需要更多控制或无法使用 Docker，可以手动部署。

1. **部署前端**：
   ```bash
   # 构建前端
   pnpm --filter "@doc-editor/web" build
   
   # 复制到 Web 服务器目录
   cp -r apps/web/dist/* /var/www/html/
   ```

2. **配置 Nginx 服务前端**：
   ```nginx
   server {
       listen 443 ssl;
       server_name your-domain.com;
       
       ssl_certificate /path/to/cert.pem;
       ssl_certificate_key /path/to/key.pem;
       
       root /var/www/html;
       index index.html;
       
       location / {
           try_files $uri $uri/ /index.html;
       }
   }
   ```

3. **部署后端**：
   ```bash
   # 构建后端
   cd apps/api && cargo build --release
   
   # 复制二进制文件
   cp target/release/api /usr/local/bin/doc-editor-api
   
   # 创建系统服务
   cat > /etc/systemd/system/doc-editor-api.service << EOF
   [Unit]
   Description=Doc Editor API
   After=network.target postgresql.service
   
   [Service]
   User=www-data
   Environment=DATABASE_URL=postgres://user:password@localhost:5432/doc_editor
   Environment=JWT_SECRET=your_secure_random_string
   Environment=RUST_LOG=info
   ExecStart=/usr/local/bin/doc-editor-api
   Restart=on-failure
   
   [Install]
   WantedBy=multi-user.target
   EOF
   
   # 启动服务
   systemctl enable doc-editor-api
   systemctl start doc-editor-api
   ```

### CI/CD 部署

设置 CI/CD 管道可以自动化部署过程。

1. **GitHub Actions 示例**：
   ```yaml
   name: Deploy Doc Editor
   
   on:
     push:
       branches: [ main ]
   
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         
         - name: Setup Node.js
           uses: actions/setup-node@v4
           with:
             node-version: '18'
         
         - name: Setup pnpm
           uses: pnpm/action-setup@v3
           with:
             version: 8.15.4
         
         - name: Install dependencies
           run: pnpm install
         
         - name: Build packages
           run: pnpm build
         
         - name: Deploy to server
           uses: appleboy/ssh-action@master
           with:
             host: ${{ secrets.HOST }}
             username: ${{ secrets.USERNAME }}
             key: ${{ secrets.SSH_KEY }}
             script: |
               cd /path/to/deployment
               git pull
               pnpm install --prod
               pnpm build
               cd apps/api && cargo build --release
               systemctl restart doc-editor-api
   ```

## 数据库设置

### 初始化数据库

1. **创建数据库**：
   ```sql
   CREATE DATABASE doc_editor;
   CREATE USER doc_editor WITH ENCRYPTED PASSWORD 'your_password';
   GRANT ALL PRIVILEGES ON DATABASE doc_editor TO doc_editor;
   ```

2. **运行迁移**：
   ```bash
   cd apps/api && cargo run --bin migrate
   ```

### 数据库优化

1. **PostgreSQL 配置**：
   ```
   # 内存设置
   shared_buffers = 1GB
   work_mem = 32MB
   
   # 写入性能
   wal_buffers = 16MB
   
   # 查询优化
   effective_cache_size = 3GB
   ```

2. **索引优化**：确保所有频繁查询的列都有适当的索引

## 性能优化

### 前端性能

1. **启用 CDN**：将静态资源部署到 CDN
   ```nginx
   location /assets/ {
       proxy_pass https://your-cdn.com/assets/;
       expires max;
   }
   ```

2. **配置缓存**：
   ```nginx
   location ~* \.(js|css|png|jpg|jpeg|gif|ico)$ {
       expires 30d;
       add_header Cache-Control "public, no-transform";
   }
   ```

### 后端性能

1. **配置连接池**：
   ```rust
   // 在 main.rs 中
   let pool = PgPoolOptions::new()
       .max_connections(20)
       .connect(&database_url)
       .await?;
   ```

2. **启用压缩**：
   ```rust
   // 在路由配置中
   .layer(tower_http::compression::CompressionLayer::new())
   ```

## 安全配置

1. **配置 CORS**：
   ```rust
   // 在路由配置中
   .layer(
       CorsLayer::new()
           .allow_origin(env::var("CORS_ORIGIN").unwrap_or_else(|_| "https://your-domain.com".to_string()).parse::<HeaderValue>().unwrap())
           .allow_methods([Method::GET, Method::POST, Method::PUT, Method::DELETE])
           .allow_credentials(true)
           .allow_headers([AUTHORIZATION, CONTENT_TYPE])
   )
   ```

2. **配置 CSP**：
   ```nginx
   add_header Content-Security-Policy "default-src 'self'; script-src 'self'; style-src 'self'; img-src 'self' data:; connect-src 'self' https://api.your-domain.com;";
   ```

3. **配置 HTTPS**：
   ```nginx
   ssl_protocols TLSv1.2 TLSv1.3;
   ssl_prefer_server_ciphers on;
   ssl_ciphers ECDHE-ECDSA-AES128-GCM-SHA256:ECDHE-RSA-AES128-GCM-SHA256;
   ssl_session_cache shared:SSL:10m;
   ssl_session_timeout 10m;
   ```

## 监控和日志

1. **配置日志**：
   ```bash
   # 在 .env 文件中
   RUST_LOG=info,tower_http=debug
   ```

2. **设置监控**：
   ```bash
   # 安装 Prometheus 和 Grafana
   docker-compose -f monitoring/docker-compose.yml up -d
   ```

## 备份和恢复

1. **数据库备份**：
   ```bash
   # 创建备份脚本
   cat > /usr/local/bin/backup-db.sh << EOF
   #!/bin/bash
   BACKUP_DIR=/var/backups/doc-editor
   mkdir -p \$BACKUP_DIR
   FILENAME=doc-editor-\$(date +%Y%m%d-%H%M%S).sql
   pg_dump -U postgres doc_editor > \$BACKUP_DIR/\$FILENAME
   gzip \$BACKUP_DIR/\$FILENAME
   EOF
   
   chmod +x /usr/local/bin/backup-db.sh
   
   # 添加到 crontab
   echo "0 2 * * * /usr/local/bin/backup-db.sh" | crontab -
   ```

2. **恢复数据库**：
   ```bash
   gunzip -c backup-file.sql.gz | psql -U postgres doc_editor
   ```

## 更新和回滚

1. **更新流程**：
   ```bash
   # 拉取最新代码
   git pull
   
   # 更新依赖
   pnpm install
   
   # 构建
   pnpm build
   
   # 更新后端
   cd apps/api && cargo build --release
   
   # 重启服务
   systemctl restart doc-editor-api
   ```

2. **回滚流程**：
   ```bash
   # 回滚到特定版本
   git checkout v1.2.3
   
   # 重复构建和部署步骤
   ```

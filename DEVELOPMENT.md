# Doc Editor 开发指南

本文档提供了关于 Doc Editor 项目的详细开发、部署和故障排除指南。

## 目录

- [开发环境设置](#开发环境设置)
- [项目结构](#项目结构)
- [开发工作流](#开发工作流)
- [Docker 开发环境](#docker-开发环境)
- [部署流程](#部署流程)
- [数据库迁移](#数据库迁移)
- [故障排除](#故障排除)

## 开发环境设置

### 系统要求

- **Node.js**: 18.0.0 或更高版本
- **pnpm**: 8.15.4 或更高版本
- **Rust**: 1.78.0 或更高版本
- **Docker**: 最新版本 (用于数据库和开发环境)
- **PostgreSQL**: 16.x (如果不使用 Docker)

### 初始设置

1. **克隆仓库**:

   ```bash
   git clone https://github.com/yourusername/doc-editor.git
   cd doc-editor
   ```

2. **使用自动设置脚本**:

   ```bash
   # 使脚本可执行
   chmod +x ./tools/setup.sh
   
   # 运行设置脚本
   ./tools/setup.sh
   ```

   或者**手动设置**:

   ```bash
   # 安装依赖
   pnpm install
   
   # 构建所有包
   pnpm build
   ```

### 启动开发服务器

```bash
# 启动所有服务 (前端和后端)
pnpm dev

# 仅启动前端
pnpm --filter "@doc-editor/web" dev

# 仅启动后端
cd apps/api && cargo run
```

## 项目结构

Doc Editor 使用 monorepo 结构，包含以下主要目录:

```bash
doc-editor/
├── apps/                  # 应用程序
│   ├── api/               # Rust 后端 API
│   └── web/               # React 前端应用
├── packages/              # 共享包
│   ├── editor/            # 文档编辑器组件
│   ├── schema/            # 共享类型和验证
│   └── ui/                # UI 组件库
├── docker/                # Docker 配置
├── tools/                 # 开发工具和脚本
├── biome.json             # Biome 配置
├── lefthook.yml           # Git hooks 配置
├── pnpm-workspace.yaml    # pnpm 工作区配置
├── tsconfig.json          # TypeScript 配置
└── turbo.json             # Turborepo 配置
```

### 关键包说明

- **@doc-editor/web**: 主要前端应用，使用 React 19 和 Vite
- **@doc-editor/ui**: 基于 shadcn/ui 的共享 UI 组件库
- **@doc-editor/editor**: 基于 Tiptap 的文档编辑器组件
- **@doc-editor/schema**: 共享类型定义和 Zod 验证
- **api**: Rust 后端 API，使用 Axum 框架

## 开发工作流

### 1. 创建新组件

使用 shadcn/ui CLI 添加新组件:

```bash
# 在 UI 包中添加组件
cd packages/ui
pnpm dlx shadcn-ui@latest add button

# 在 Web 应用中添加组件
cd apps/web
pnpm dlx shadcn-ui@latest add dialog
```

### 2. 构建包

```bash
# 构建所有包
pnpm build

# 构建特定包
pnpm --filter "@doc-editor/ui" build
pnpm --filter "@doc-editor/schema" build
pnpm --filter "@doc-editor/editor" build
```

### 3. 类型检查

```bash
# 检查所有包
pnpm typecheck

# 检查特定包
pnpm --filter "@doc-editor/web" typecheck
```

### 4. 代码格式化和 Lint

我们使用 Biome 进行代码格式化和 lint:

```bash
# 格式化代码
pnpm format

# 运行 lint
pnpm lint

# 自动修复 lint 问题
pnpm lint:fix
```

### 5. 运行测试

```bash
# 运行所有测试
pnpm test

# 运行特定包的测试
pnpm --filter "@doc-editor/editor" test
```

### 6. 更新依赖

使用我们的依赖更新工具:

```bash
# 更新所有依赖
node tools/update-deps.js

# 更新特定依赖
node tools/update-deps.js react --exact
node tools/update-deps.js typescript --dev
```

## Docker 开发环境

### 启动完整环境

```bash
# 启动所有服务
docker compose -f docker/docker-compose.yml up

# 在后台启动
docker compose -f docker/docker-compose.yml up -d

# 仅启动数据库
docker compose -f docker/docker-compose.yml up postgres
sqlx database create
sqlx migrate run
```

### 查看日志

```bash
# 查看所有容器的日志
docker compose -f docker/docker-compose.yml logs -f

# 查看特定服务的日志
docker compose -f docker/docker-compose.yml logs -f api
```

### 停止环境

```bash
docker compose -f docker/docker-compose.yml down
```

## 部署流程

### 1. 生产环境构建

```bash
# 构建前端
pnpm --filter "@doc-editor/web" build

# 构建后端
cd apps/api && cargo build --release
```

### 2. Docker 部署

我们提供了生产环境的 Docker Compose 配置:

```bash
# 构建并启动所有容器
docker-compose -f docker/docker-compose.yml -f docker/docker-compose.prod.yml up -d --build
```

### 3. 手动部署

#### 前端部署

1. 构建前端应用:

   ```bash
   pnpm --filter "@doc-editor/web" build
   ```

2. 将 `apps/web/dist` 目录部署到 Web 服务器或 CDN

#### 后端部署

1. 构建后端应用:

   ```bash
   cd apps/api && cargo build --release
   ```

2. 配置环境变量:

   ```bash
   DATABASE_URL=postgres://user:password@localhost:5432/doc_editor
   JWT_SECRET=your_production_secret
   RUST_LOG=info
   ```

3. 运行二进制文件:

   ```bash
   ./target/release/api
   ```

## 数据库迁移

我们使用 SQLx 进行数据库迁移:

```bash
# 创建新迁移
cd apps/api && cargo run --bin create_migration -- add_users_table

# 运行迁移
cd apps/api && cargo run --bin migrate
```

## 故障排除

### 常见问题

1. **依赖问题**:

   如果遇到依赖冲突，尝试清除 node_modules 并重新安装:

   ```bash
   pnpm clean && pnpm install
   ```

2. **端口冲突**:

   默认端口:
   - 前端: 3000
   - 后端: 8000
   - 数据库: 5432

   可以通过环境变量修改:

   ```bash
   PORT=4000 pnpm --filter "@doc-editor/web" dev
   ```

3. **数据库连接问题**:

   确保 PostgreSQL 正在运行并且连接字符串正确。检查 `.env` 文件中的配置。

4. **构建失败**:

   如果构建失败，尝试清除构建缓存:

   ```bash
   pnpm clean:build && pnpm build
   ```

5. **TypeScript 错误**:

   如果遇到 TypeScript 错误，确保所有依赖包都已构建:

   ```bash
   pnpm build
   ```

### 调试技巧

1. **前端调试**:

   - 使用 React DevTools 进行组件调试
   - 检查 Vite 开发服务器的控制台输出
   - 使用浏览器开发工具的网络面板检查 API 请求

2. **后端调试**:

   - 设置 `RUST_LOG=debug` 环境变量获取详细日志
   - 使用 `cargo run` 的调试模式
   - 检查数据库查询日志

3. **Docker 调试**:

   - 使用 `docker-compose logs` 查看容器日志
   - 使用 `docker exec -it <container_id> /bin/sh` 进入容器
   - 检查容器网络和卷挂载

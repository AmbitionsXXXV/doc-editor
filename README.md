# Doc Editor

一个支持在线编辑的文档网站，基于React 19 + shadcn/ui + Tailwind CSS v4 + Tiptap编辑器。后端使用Rust构建，前端使用React编译器提升性能。

## 技术栈

- 前端：
  - React 19 + React Compiler
  - Tailwind CSS v4
  - shadcn/ui 组件库
  - Tiptap编辑器
  - Biome (格式化和lint工具)
  
- 后端：
  - Rust (Axum框架)
  - PostgreSQL数据库
  - Redis缓存

## 快速开始

### 要求

- Node.js 22+
- pnpm 10.5.0+
- Rust 1.85+
- Docker (用于数据库和缓存)

### 安装依赖

```bash
# 使用脚本自动设置开发环境
./tools/setup.sh

# 或手动安装依赖
pnpm install
```

### 启动开发服务器

```bash
# 启动前端和其他服务（不包括API）
pnpm dev

# 仅启动API服务
pnpm dev:api

# 启动所有服务（包括API）
pnpm dev:all

# 仅启动前端
pnpm --filter "@doc-editor/web" dev

# 直接使用Cargo启动后端
cd apps/api && cargo run
```

## 项目结构

- `/apps/web` - 前端React应用
- `/apps/api` - 后端Rust应用 
- `/packages/ui` - UI组件库
- `/packages/editor` - 编辑器封装
- `/packages/schema` - 共享类型定义和验证
- `/docker` - Docker配置文件
- `/tools` - 开发工具脚本

## 主要功能

- 在线文档编辑
- 实时协作
- 版本历史
- 用户权限管理
- 文档分享
- 黑暗模式支持
- 响应式设计

## 详细文档

- [开发指南](./DEVELOPMENT.md) - 详细的开发环境设置和工作流程
- [部署指南](./DEPLOYMENT.md) - 生产环境部署和优化指南

## 贡献指南

1. Fork仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开Pull Request

## 许可证

MIT

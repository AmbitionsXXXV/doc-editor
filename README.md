# Doc Editor

一个支持在线编辑的文档网站，基于 React 19 + shadcn/ui + Tailwind CSS v4 + Tiptap 编辑器。后端使用 Rust 构建，前端使用 React 编译器提升性能。

## 技术栈

- 前端：
  - React 19 + React Compiler
  - Tailwind CSS v4
  - shadcn/ui 组件库
  - Tiptap 编辑器
  - Biome (格式化和 lint 工具)

- 后端：
  - Rust (Axum 框架)
  - PostgreSQL 数据库
  - Redis 缓存

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

# 直接使用  Cargo 启动后端
cd apps/api && cargo run
```

## 项目结构

- `/apps` - 应用程序
  - `/apps/web` - 前端React应用
  - `/apps/api` - 后端Rust应用 (Axum框架)
- `/packages` - 共享包
  - `/packages/core` - 编辑器核心功能包
    - `/packages/core/api` - 编辑器API，包括块操作、导出/解析器和测试工具
    - `/packages/core/blocks` - 块内容定义和类型，如文本、图片、音频、视频等
    - `/packages/core/editor` - 编辑器核心实现，包括 EtcDocEditor 主类
    - `/packages/core/extensions` - 编辑器扩展，如格式工具栏、链接工具栏、侧边菜单等
    - `/packages/core/schema` - 编辑器模式定义，包括块、内联内容和样式
  - `/packages/ui` - UI组件库 (基于shadcn/ui)
  - `/packages/config-tailwind` - Tailwind配置
  - `/packages/schema` - 共享类型定义和验证
- `/docker` - Docker配置文件
- `/tools` - 开发工具脚本
  - `/tools/setup.sh` - 环境设置脚本
  - `/tools/clean.js` - 清理脚本
  - `/tools/update-deps.js` - 依赖更新脚本
- `/docs` - 项目文档
  - `/docs/ROADMAP.md` - 项目路线图

## 主要功能

- 在线文档编辑
- 实时协作
- 版本历史
- 用户权限管理
- 文档分享
- 黑暗模式支持
- 响应式设计

## 核心包详细说明

`packages/core` 是文档编辑器的核心实现，基于 Prosemirror 和 Tiptap 构建的类 Notion、飞书文档风格的可扩展文本编辑器。

### 核心功能

- **块操作** - 提供丰富的块操作API，包括插入、更新、删除和替换块
- **文档导出/导入** - 支持 HTML 和 Markdown 格式的导出和导入
- **实时协作** - 基于 Yjs 实现的实时协作编辑功能
- **富文本编辑** - 支持多种文本样式、链接、表格等富文本功能
- **媒体支持** - 内置图片、音频、视频、文件等媒体块
- **代码块** - 支持语法高亮的代码块
- **可扩展性** - 提供扩展机制，可自定义块类型和编辑器行为

### 主要组件

- **EtcDocEditor** - 编辑器核心类，提供文档操作的主要接口
- **块操作API** - 包括 `insertBlocks`、`updateBlock`、`removeBlocks` 等命令
- **UI扩展** - 格式工具栏、链接工具栏、侧边菜单、建议菜单等UI组件
- **导出器** - HTML 和 Markdown 格式的文档导出功能
- **解析器** - 从 HTML 和 Markdown 解析文档内容

### 技术特点

- 基于 Prosemirror 和 Tiptap 构建的可扩展编辑器
- 使用 TypeScript 实现，提供完善的类型定义
- 支持块级编辑和内联内容编辑
- 支持实时协作编辑
- 提供丰富的 API 接口，方便集成和扩展

## 详细文档

- [开发指南](./DEVELOPMENT.md) - 详细的开发环境设置和工作流程
- [部署指南](./DEPLOYMENT.md) - 生产环境部署和优化指南

## 贡献指南

1. Fork 仓库
2. 创建功能分支 (`git checkout -b feature/amazing-feature`)
3. 提交更改 (`git commit -m 'Add some amazing feature'`)
4. 推送到分支 (`git push origin feature/amazing-feature`)
5. 打开 Pull Request

## 许可证

MIT

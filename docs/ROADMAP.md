# 文档编辑器项目需求与待办事项

## 项目概述

本项目旨在创建一个个人博客平台，具有在线文档编辑功能。该平台将允许用户创建、编辑和分享文章，同时提供丰富的交互体验。

## 主要功能需求

### 前端 (apps/web)

#### 核心功能
- 博客网站基础功能
  - 文章列表与分类
  - 文章阅读界面
  - 标签系统
  - 搜索功能
- 在线文档编辑功能
  - 实时协作编辑
  - 富文本编辑器
  - 版本历史
  - 自动保存

#### 用户体验
- 交互丰富的主页设计
  - 动态视觉效果
  - 平滑过渡动画
  - 响应式布局
- 现代化UI设计
  - 清晰的排版
  - 深色/浅色模式切换
  - 自定义主题

### 后端 (apps/api)

#### 用户认证
- 简化的认证流程
  - 基于邮箱的无密码登录
  - 邮箱验证码登录
  - 会话管理
- 未来扩展
  - Web3钱包登录支持
  - OAuth集成（可选）

#### 数据管理
- 文档存储与检索
- 用户权限管理
- API端点设计

## 待办事项 (TODOs)

### 前端开发 (apps/web)

- [ ] **设计原型**
  - [ ] 创建主页交互原型 (HTML/CSS)
  - [ ] 设计文章编辑界面
  - [ ] 设计文章阅读界面
  - [ ] 完善导航与信息架构

- [ ] **主页开发**
  - [ ] 实现丰富的视觉交互效果
  - [ ] 添加博客文章预览组件
  - [ ] 开发导航系统
  - [ ] 实现响应式布局

- [ ] **编辑器功能**
  - [ ] 集成富文本编辑器
  - [ ] 实现文档保存功能
  - [ ] 添加版本历史功能
  - [ ] 开发协作编辑能力

- [ ] **博客功能**
  - [ ] 开发文章列表页面
  - [ ] 实现文章阅读页面
  - [ ] 添加标签与分类系统
  - [ ] 开发搜索功能

### 后端开发 (apps/api)

- [ ] **认证系统**
  - [ ] 实现邮箱验证码登录
  - [ ] 开发会话管理
  - [ ] 设计权限系统
  - [ ] 为未来Web3钱包登录准备接口

- [ ] **数据管理**
  - [ ] 设计数据库模式
  - [ ] 实现文档存储API
  - [ ] 开发用户管理API
  - [ ] 实现数据备份策略

- [ ] **API端点**
  - [ ] 设计RESTful API架构
  - [ ] 实现文档CRUD操作
  - [ ] 开发用户管理端点
  - [ ] 添加API文档

## 技术栈

### 前端
- React + React Router v7
- TypeScript
- Tiptap 编辑器
- Tailwind CSS
- Motion 动画库

### 后端
- Rust
- Axum 框架
- PostgreSQL (通过SQLx)
- 仓库模式架构

## 后续可能的扩展

- 社交功能（评论、分享）
- 分析与统计
- 自定义域名支持
- 更多身份验证方法
- SEO优化

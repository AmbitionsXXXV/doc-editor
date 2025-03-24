# 用户认证模块

本模块提供完整的用户认证功能，包括注册、登录、邮箱验证、密码管理以及第三方登录等功能。

## 模块结构

认证模块按功能划分为以下子模块：

```bash
auth/
├── login.rs          # 用户登录相关功能
├── register.rs       # 用户注册相关功能
├── verification.rs   # 邮箱验证相关功能
├── password.rs       # 密码管理相关功能
├── oauth/            # 第三方OAuth认证
│   ├── mod.rs        # OAuth模块入口
│   ├── google.rs     # Google OAuth认证
│   ├── github.rs     # GitHub OAuth认证
│   └── README.md     # OAuth使用文档
└── mod.rs            # 认证模块入口，路由定义
```

## API 接口概览

### 基本认证接口

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|---------|
| POST | `/api/auth/register` | 用户注册 | 否 |
| POST | `/api/auth/login` | 用户登录 | 否 |
| GET | `/api/auth/verify` | 验证邮箱 | 否 |
| POST | `/api/auth/resend-verification` | 重发验证邮件 | 否 |
| POST | `/api/auth/forgot-password` | 忘记密码请求 | 否 |
| GET | `/api/auth/reset-password` | 重置密码页面 | 否 |
| POST | `/api/auth/reset-password` | 提交新密码 | 否 |

### OAuth 认证接口

| 方法 | 路径 | 描述 | 认证要求 |
|------|------|------|---------|
| GET | `/api/auth/oauth/google/login` | 发起Google登录 | 否 |
| GET | `/api/auth/oauth/google/callback` | Google登录回调 | 否 |
| GET | `/api/auth/oauth/github/login` | 发起GitHub登录 | 否 |
| GET | `/api/auth/oauth/github/callback` | GitHub登录回调 | 否 |

## 详细接口说明

### 用户注册

```curl
POST /api/auth/register
```

**请求体**:

```json
{
  "name": "张三",
  "email": "example@example.com",
  "password": "Password123!"
}
```

**响应**:

```json
{
  "status": "success",
  "message": "注册成功，请在 30 分钟内完成邮箱验证"
}
```

**说明**:

- 成功注册后，系统会向用户邮箱发送验证链接
- 密码需符合安全要求（至少8位，包含大小写字母和数字）

### 用户登录

```bash
POST /api/auth/login
```

**请求体**:

```json
{
  "email": "example@example.com",
  "password": "Password123!"
}
```

**响应**:

```json
{
  "status": "success",
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
}
```

**说明**:

- 登录成功后返回JWT令牌
- 同时会设置包含令牌的HTTP Only Cookie

### 验证邮箱

```bash
GET /api/auth/verify?token={验证令牌}
```

**响应**:

- 成功：重定向到前端页面，附带verified=true参数
- 失败：返回错误信息

**说明**:

- 用户通过点击验证邮件中的链接访问此接口
- 验证令牌有效期为30分钟

### 重发验证邮件

```bash
POST /api/auth/resend-verification
```

**请求体**:

```json
{
  "email": "example@example.com"
}
```

**响应**:

```json
{
  "status": "success",
  "message": "验证邮件已重新发送，请在 30 分钟内完成验证"
}
```

### 忘记密码

```bash
POST /api/auth/forgot-password
```

**请求体**:

```json
{
  "email": "example@example.com"
}
```

**响应**:

```json
{
  "status": "success",
  "message": "密码重置邮件已发送，请在 30 分钟内完成重置操作"
}
```

**说明**:

- 系统会向用户邮箱发送密码重置链接
- 重置链接有效期为30分钟

### 重置密码页面

```bash
GET /api/auth/reset-password?token={重置令牌}
```

**响应**:

- 成功：重定向到前端重置密码页面，附带reset_token参数
- 失败：返回错误信息

### 提交新密码

```bash
POST /api/auth/reset-password?token={重置令牌}
```

**请求体**:

```json
{
  "password": "NewPassword123!",
  "password_confirm": "NewPassword123!"
}
```

**响应**:

```json
{
  "status": "success",
  "message": "密码重置成功，请使用新密码登录"
}
```

## OAuth 认证

关于第三方OAuth认证的详细说明，请参考[OAuth文档](./oauth/README.md)。

## 安全说明

1. **密码存储**: 所有密码都经过Argon2算法加密后存储
2. **JWT认证**: 使用签名的JWT令牌进行认证，避免令牌被篡改
3. **CSRF保护**: OAuth流程中使用状态参数防止CSRF攻击
4. **HTTP-Only Cookie**: 认证令牌存储在HTTP-Only Cookie中，防止XSS攻击
5. **邮箱验证**: 所有新注册账号需要通过邮箱验证，确保邮箱真实性

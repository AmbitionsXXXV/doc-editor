# OAuth 认证服务

本模块提供了通过 Google 和 GitHub 进行第三方登录的功能。用户可以使用他们的 Google 或 GitHub 账号直接登录系统，无需单独注册账号。

## 功能概述

- **Google OAuth 登录**：允许用户使用 Google 账号登录
- **GitHub OAuth 登录**：允许用户使用 GitHub 账号登录

## API 接口

### Google OAuth

#### 1. 发起 Google 登录

```curl
GET /api/auth/oauth/google/login
```

**功能说明**：

- 将用户重定向到 Google 的登录授权页面
- 用户在 Google 页面上确认授权后，Google 会将用户重定向回我们的回调 URL

**调用示例**：

```javascript
// 前端可以通过简单的链接或按钮跳转
window.location.href = 'https://your-api-domain.com/api/auth/oauth/google/login';
```

**响应**：

- 302 重定向到 Google 授权页面

#### 2. Google 授权回调

```curl
GET /api/auth/oauth/google/callback?code={授权码}&state={状态码}
```

**功能说明**：

- 处理 Google 授权成功后的回调
- 获取用户信息并创建或更新用户
- 生成 JWT 令牌并设置 Cookie
- 重定向到前端应用

**参数**：

- `code`: Google 提供的授权码（由 Google 自动填充）
- `state`: 防跨站请求伪造的状态码（可选，由 Google 自动填充）

**响应**：

- 302 重定向到前端应用，URL 中包含 token 参数
- 同时设置包含令牌的 HTTP Only Cookie

### GitHub OAuth

#### 1. 发起 GitHub 登录

```curl
GET /api/auth/oauth/github/login
```

**功能说明**：

- 将用户重定向到 GitHub 的登录授权页面
- 用户在 GitHub 页面上确认授权后，GitHub 会将用户重定向回我们的回调 URL

**调用示例**：

```javascript
// 前端可以通过简单的链接或按钮跳转
window.location.href = 'https://your-api-domain.com/api/auth/oauth/github/login';
```

**响应**：

- 302 重定向到 GitHub 授权页面

#### 2. GitHub 授权回调

```curl
GET /api/auth/oauth/github/callback?code={授权码}&state={状态码}
```

**功能说明**：

- 处理 GitHub 授权成功后的回调
- 获取用户信息并创建或更新用户
- 生成 JWT 令牌并设置 Cookie
- 重定向到前端应用

**参数**：

- `code`: GitHub 提供的授权码（由 GitHub 自动填充）
- `state`: 防跨站请求伪造的状态码（可选，由 GitHub 自动填充）

**响应**：

- 302 重定向到前端应用，URL 中包含 token 参数
- 同时设置包含令牌的 HTTP Only Cookie

## 前端集成示例

### 添加社交登录按钮

```html
<div class="social-login">
  <button onclick="window.location.href='/api/auth/oauth/google/login'">
    使用 Google 账号登录
  </button>
  
  <button onclick="window.location.href='/api/auth/oauth/github/login'">
    使用 GitHub 账号登录
  </button>
</div>
```

### 处理重定向回来的令牌

```javascript
// 在前端应用的入口处或认证相关页面
document.addEventListener('DOMContentLoaded', function() {
  // 从URL中获取token参数
  const urlParams = new URLSearchParams(window.location.search);
  const token = urlParams.get('token');
  
  if (token) {
    // 将令牌存储在localStorage中
    localStorage.setItem('authToken', token);
    
    // 清除URL中的token参数
    const url = new URL(window.location.href);
    url.searchParams.delete('token');
    window.history.replaceState({}, document.title, url.toString());
    
    // 重定向到应用主页或仪表板
    window.location.href = '/dashboard';
  }
});
```

## 配置要求

要启用 OAuth 功能，需要在环境变量中配置以下参数：

### Google OAuth 配置

```bash
GOOGLE_CLIENT_ID=your_google_client_id
GOOGLE_CLIENT_SECRET=your_google_client_secret
GOOGLE_REDIRECT_URL=https://your-api-domain.com/api/auth/oauth/google/callback
```

### GitHub OAuth 配置

```bash
GITHUB_CLIENT_ID=your_github_client_id
GITHUB_CLIENT_SECRET=your_github_client_secret
GITHUB_REDIRECT_URL=https://your-api-domain.com/api/auth/oauth/github/callback
```

## 获取 OAuth 凭证

### Google OAuth

1. 访问 [Google Cloud Console](https://console.cloud.google.com/)
2. 创建一个项目
3. 导航到 "API 和服务" > "凭证"
4. 点击 "创建凭证" > "OAuth 客户端 ID"
5. 应用类型选择 "Web 应用"
6. 添加授权的重定向 URI：`https://your-api-domain.com/api/auth/oauth/google/callback`
7. 创建后获取客户端 ID 和客户端密钥

### GitHub OAuth

1. 访问 [GitHub Developer Settings](https://github.com/settings/developers)
2. 点击 "New OAuth App"
3. 填写应用信息
4. 授权回调 URL 填写：`https://your-api-domain.com/api/auth/oauth/github/callback`
5. 创建后获取客户端 ID 和客户端密钥

## 数据流程

1. 用户点击 "使用 Google/GitHub 登录" 按钮
2. 用户被重定向到 Google/GitHub 授权页面
3. 用户在 Google/GitHub 授权页面上确认登录并授权
4. Google/GitHub 将用户重定向回我们的回调 URL，并附带授权码
5. 我们的服务器使用授权码获取访问令牌
6. 使用访问令牌获取用户信息
7. 在数据库中创建或更新用户记录
8. 生成 JWT 令牌
9. 将用户重定向回前端应用，并在 URL 中附带令牌
10. 前端应用保存令牌并使用它进行后续 API 调用

# 远程分类服务器需求文档 (Backend Requirements)

本文档规定了该主页项目远程链接服务的后端接口需求，适用于使用 Python + FastAPI（可兼容 Cloudflare Workers / Vercel Serverless）编写的后端服务。

## 1. 业务逻辑与安全要求

为防止密码明文在网络上被抓包获取或发生重放攻击，本设计采用 **基于动态盐值 (Challenge) 的 HMAC / SHA-256 哈希验证方案**。
- **配置与数据**：后端以单独的配置文件（例如 JSON 格式）来存放分类包含的链接列表、是否启用了密码，以及原始密码。
- **跨域支持 (CORS)**：由于前端页面和后端可能部署在不同域名下，必须配置全放行的 CORS，或者允许来自主页域名的跨域请求。
- **多路由分类支持**：后端应支持通过不同的路径参数区分不同的链接分类（例如 `/api/links/1`、`/api/links/2`、`/api/links/tools` 等）。每一个分类可以动态地配置自己独立的密码以及它专属的 `links` 列表。

## 2. 接口设计

### 2.1 获取分类基本信息与请求验证 (GET)

此接口用于获取特定分类是否被密码保护以及其含有的链接总数。如果受保护，系统将返回一个临时的混淆盐值（Challenge/Salt）。

- **Method**: `GET`
- **Path**: `/api/links/{category_id}` （其中的 `{category_id}` 将由前端在 `config.ts` 中的 `remote_uri` 定义并请求）
- **Response**:

  **情况 A：未设置密码（无需鉴权，直接返回链接）**
  ```json
  {
      "need_pwd": false,
      "link_count": 2,
      "links": [
          { "title": "Murasame's Sharepoint", "url": "https://share.shirayukinoa.top", "description": "基于 Openlist 的云盘服务", "fa": "fa-solid fa-cloud" },
          { "title": "Murasame's SSO", "url": "https://sso.shirayukinoa.top", "description": "基于 Authentik 的单点认证服务", "fa": "fa-solid fa-key" }
      ]
  }
  ```

  **情况 B：已设置密码（需鉴权，下发盐值与包含数量）**
  ```json
  {
      "need_pwd": true,
      "link_count": 2, // 链接总数，用于前端提前渲染对应数量的骨架屏占位
      "challenge": "a1b2c3d4e5f6g7h8..." // 随机生成的临时盐值，推荐使用UUID或随机Hex
  }
  ```

> **注意**：`challenge` 应当有较短的生命周期，建议后端可使用内存缓存 (如 Redis，或服务端直接使用带有时间戳及签名 JWT-like 机制的无状态 Token 作为 challenge，省去内存存储) 来验证请求效期。

### 2.2 验证密码获取链接表 (POST)

前端用户填写密码后，将计算 `SHA256(challenge + 密码明文)` 生成哈希值，并通过 POST 提出对具体分类的验证请求。

- **Method**: `POST`
- **Path**: `/api/links/{category_id}`
- **Content-Type**: `application/json`
- **Request Body**:
  ```json
  {
      "challenge": "a1b2c3d4e5f6g7h8...", // GET请求中获取的盐值
      "hash": "e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855" // 前端运算结果
  }
  ```

- **Response**:

  **成功鉴权 (200 OK)**:
  ```json
  {
      "status": "success",
      "links": [
          { "title": "Murasame's Sharepoint", "url": "https://...", "description": "...", "fa": "..." },
          { "title": "Murasame's SSO", "url": "https://...", "description": "...", "fa": "..." }
      ]
  }
  ```

  **鉴权失败 (401 Unauthorized)**:
  ```json
  {
      "status": "error",
      "message": "密码错误或验证超时"
  }
  ```

## 3. CF Workers / Vercel Serverless 实现注意点 (Python + FastAPI)

1. **Serverless 无状态特性**：由于 CF Workers 或 Vercel Function 环境可能是无状态且生命周期极短，为了验证 `challenge`，推荐以下方案之一：
   - 将 `challenge` 设计为 `HMAC-SHA256(timestamp + server_secret)`，并在 GET 返回时附带 timestamp。前端 POST 时带回 `challenge`。服务端立刻验证该 `challenge` 是否由合法 `server_secret` 签发，并且是否在有效期（如 3 分钟）内。若为真，再拿此 `challenge` 与真实秘密拼接后进行匹配。这样即可达成伪状态缓存。
2. **密码存储**：切勿在明文配置文件中直写密码明文，建议直接存放 `SHA256(密码)`，或者以环境变量配置密码。

## 4. 链路时序参考

1. 前端 -> `GET /api/links/{category_id}`
2. 后端 -> 返回 `{ need_pwd: true, challenge: 'xxx', link_count: 2 }`
3. 前端 -> 根据 `link_count` 绘制 2 个加载骨架屏，并使用高斯模糊覆盖密码框。
4. 用户 -> 填入密码 `123456`
5. 前端 -> 计算 `Hash = SHA-256("xxx" + "123456")`
6. 前端 -> `POST /api/links/{category_id}` 发送 `challenge` 和 `Hash`
7. 后端 -> 取得对应 `{category_id}` 分类的密码，计算 `ServerHash = SHA-256("xxx" + 该分类密码)`
8. 后端 -> 对比 `Hash == ServerHash`，如果一致返回真实 `links` 列表。
9. 前端 -> 渲染 `links`，移除密码框遮罩。
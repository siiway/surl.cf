# SURL.CF - 简单、快速的链接缩短服务

SURL.CF 是一个使用 Next.js 和 Cloudflare Pages 构建的链接缩短服务。它允许用户将长 URL 转换为短链接，方便分享和使用。它支持自定义短链接、复制到剪贴板、响应式设计、使用 Cloudflare KV 存储链接数据、使用 Cloudflare Turnstile 进行可选的人机验证、可配置的右上角弹出式公告系统、管理员控制台、GitHub 链接集成等功能。

## 功能特点

- 快速将长 URL 转换为短链接
- 支持自定义短链接（例如：surl.cf/my-product）
- 复制到剪贴板功能
- 响应式设计，适配各种设备
- 使用 Cloudflare KV 存储链接数据
- 使用 Cloudflare Turnstile 进行可选的人机验证
- 可配置的右上角弹出式公告系统，支持标题、Markdown 内容和不同类型的通知
- 管理员控制台，用于管理和分析短链接
- GitHub 仓库链接集成
- 部署在 Cloudflare Pages 上，全球快速访问

## 本地开发

1. 克隆仓库：

```bash
git clone https://github.com/siiway/surl.cf.git
cd surl.cf
```

2. 安装依赖：

```bash
npm install
```

3. 运行开发服务器：

```bash
npm run dev
```

4. 在浏览器中打开 [http://localhost:3000](http://localhost:3000) 查看结果。

## 部署到 Cloudflare Pages

1. 在 Cloudflare 控制面板中创建一个 KV 命名空间，命名为 `LINKS_KV`。

2. 更新 `wrangler.toml` 文件中的 KV 命名空间 ID：

```toml
kv_namespaces = [
  { binding = "LINKS_KV", id = "YOUR_KV_ID_HERE", preview_id = "YOUR_PREVIEW_KV_ID_HERE" }
]
```

3. 在 [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) 创建一个站点，获取 Site Key 和 Secret Key。

4. 更新 `wrangler.toml` 文件中的 Turnstile 密钥：

```toml
[env.production]
NODE_ENV = "production"
NEXT_PUBLIC_TURNSTILE_SITE_KEY = "YOUR_TURNSTILE_SITE_KEY"
TURNSTILE_SECRET_KEY = "YOUR_TURNSTILE_SECRET_KEY"
```

5. 使用 Cloudflare Pages 部署：
   - 连接你的 GitHub 仓库
   - 设置构建命令为 `npm run build`
   - 设置输出目录为 `.next`
   - 添加环境变量 `NODE_ENV=production`

6. 部署完成后，你的链接缩短服务将在 Cloudflare Pages 提供的域名上可用。

## 技术栈

- [Next.js](https://nextjs.org) - React 框架
- [Tailwind CSS](https://tailwindcss.com) - CSS 框架
- [Cloudflare Pages](https://pages.cloudflare.com) - 托管服务
- [Cloudflare KV](https://developers.cloudflare.com/workers/runtime-apis/kv) - 键值存储
- [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) - 人机验证服务
- [Jose](https://github.com/panva/jose) - JWT 实现库

## 管理员控制台

SURL.CF 包含一个管理员控制台，可以通过访问 `/admin` 路径进入。默认的管理员凭据为：

- 用户名: `admin`
- 密码: `admin123`

**重要提示：** 在生产环境中，请务必更改默认凭据，并使用强密码和安全的 JWT 密钥。

管理员控制台功能：

1. **仪表盘** - 查看链接统计信息
2. **链接管理** - 查看、搜索和删除短链接
3. **设置** - 管理账户设置和系统配置，包括启用/禁用人机验证

要配置管理员凭据，请在 `wrangler.toml` 文件中设置以下环境变量：

```toml
JWT_SECRET = "your-super-secret-jwt-key" # 用于 JWT 签名的密钥
ADMIN_USERNAME = "your-username" # 管理员用户名
ADMIN_PASSWORD = "your-password" # 管理员密码
NEXT_PUBLIC_ENABLE_TURNSTILE = "true" # 是否启用 Turnstile 人机验证 (true/false)
NEXT_PUBLIC_ANNOUNCEMENT_TITLE = "欢迎使用 SURL.CF" # 公告标题，设置为空字符串则不显示
NEXT_PUBLIC_ANNOUNCEMENT_CONTENT = "这是一个**简单、快速**的链接缩短服务！\n\n- 支持自定义短链接\n- 支持复制到剪贴板" # 公告内容，支持 Markdown 格式
NEXT_PUBLIC_ANNOUNCEMENT_TYPE = "info" # 公告类型: info, warning, success, error
NEXT_PUBLIC_GITHUB_URL = "https://github.com/siiway/surl.cf" # GitHub 仓库链接
```

## 开源许可

本项目使用 GNU General Public License v3.0。

更多信息请查看 [LICENSE](LICENSE) 文件。

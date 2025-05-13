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
- 多语言支持（中文和英文）

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

2. 在 Cloudflare Pages 项目设置中将 KV 命名空间 ID 设置为环境变量：

```toml
name = "your-project-name"
compatibility_date = "2023-12-01"
pages_build_output_dir = ".next"
node_version = "20"

[build]
command = "npm run build"

[env.production]
# 你的环境变量在这里...

# 生产环境的 KV 命名空间
kv_namespaces = [
  { binding = "LINKS_KV", id = "${KV_ID}" }
]

[env.preview]
# 你的环境变量在这里...

# 预览环境的 KV 命名空间
kv_namespaces = [
  { binding = "LINKS_KV", id = "${KV_PREVIEW_ID}" }
]
```

获取 KV ID 和 PREVIEW ID 的方法：

**使用 Cloudflare 控制面板：**

- 进入 Cloudflare 控制面板 > Workers & Pages > KV
- 创建两个命名空间：一个用于生产环境（例如 `LINKS_KV`），一个用于预览环境（例如 `LINKS_KV_PREVIEW`）
- 复制这两个命名空间的 ID

**使用 Wrangler CLI：**

- 安装 Wrangler：`npm install -g wrangler`
- 登录：`wrangler login`
- 创建命名空间：

```bash
wrangler kv:namespace create "LINKS_KV"
wrangler kv:namespace create "LINKS_KV_PREVIEW" --preview
```

- 命令输出将显示您需要的 ID

然后在 Cloudflare Pages 项目设置中将它们设置为环境变量：

- `KV_ID`：您的生产环境 KV 命名空间 ID
- `KV_PREVIEW_ID`：您的预览环境 KV 命名空间 ID（用于开发和预览部署）

3. 在 [Cloudflare Turnstile](https://www.cloudflare.com/products/turnstile/) 创建一个站点，获取 Site Key 和 Secret Key。

4. 在 Cloudflare Pages 项目设置中将 Turnstile 密钥设置为环境变量：

```toml
[env.production]
NODE_ENV = "production"
NEXT_PUBLIC_TURNSTILE_SITE_KEY = "${TURNSTILE_SITE_KEY}"
TURNSTILE_SECRET_KEY = "${TURNSTILE_SECRET_KEY}"
```

5. 使用 Cloudflare Pages 部署：
   - 连接你的 GitHub 仓库
   - 设置构建命令为 `npm run build`
   - 设置输出目录为 `.next`
   - 对于 Framework preset（框架预设），选择 **Next.js**
   - 设置 Node.js 版本为 **20**（Next.js 15+ 所需）
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

要配置管理员凭据和其他设置，在 Cloudflare Pages 项目设置中设置以下环境变量：

```env
JWT_SECRET                      # 用于 JWT 签名的密钥
ADMIN_USERNAME                  # 管理员用户名
ADMIN_PASSWORD                  # 管理员密码
NEXT_PUBLIC_ENABLE_TURNSTILE    # 是否启用 Turnstile 人机验证 (true/false)
NEXT_PUBLIC_ANNOUNCEMENT_TITLE  # 公告标题，设置为空字符串则不显示
NEXT_PUBLIC_ANNOUNCEMENT_CONTENT # 公告内容，支持 Markdown 格式
NEXT_PUBLIC_ANNOUNCEMENT_TYPE   # 公告类型: info, warning, success, error
NEXT_PUBLIC_GITHUB_URL          # GitHub 仓库链接
```

示例值：

```env
JWT_SECRET = "your-super-secret-jwt-key"
ADMIN_USERNAME = "your-username"
ADMIN_PASSWORD = "your-password"
NEXT_PUBLIC_ENABLE_TURNSTILE = "true"
NEXT_PUBLIC_ANNOUNCEMENT_TITLE = "欢迎使用 SURL.CF"
NEXT_PUBLIC_ANNOUNCEMENT_CONTENT = "这是一个**简单、快速**的链接缩短服务！"
NEXT_PUBLIC_ANNOUNCEMENT_TYPE = "info"
NEXT_PUBLIC_GITHUB_URL = "https://github.com/siiway/surl.cf"
```

## 开源许可

本项目使用 GNU General Public License v3.0。

更多信息请查看 [LICENSE](LICENSE) 文件。

## 语言支持

本项目支持中文和英文。英文版 README 请查看 [README.md](README.md)。

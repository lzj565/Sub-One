# Sub-One Manager

> 🚀 基于 Vue 3 的现代化网络订阅管理与转换平台，专为 Cloudflare Workers 与轻量私有化容器打造。

[![GitHub Release](https://img.shields.io/badge/Release-v2.0.0-blue.svg)](https://github.com/binbankm/Sub-One/releases)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Deploy-F38020?style=flat&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![Docker Image](https://img.shields.io/badge/Docker-ghcr.io-2496ED?style=flat&logo=docker&logoColor=white)](https://github.com/binbankm/Sub-One/pkgs/container/sub-one)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

**简体中文** | [English](README.en.md)

---

## 🌟 界面预览

![Sub-One Manager 仪表盘](images/1.png)

<details>
<summary>🖼️ 点击展开查看更多功能模块截图</summary>

### 🔐 账号登录与初始化

![登录界面](images/0.png)
*简洁安全的登录界面，首次部署自动引导创建管理员*

### 📋 订阅源管理

![订阅源管理](images/2.png)
*响应式网格布局，支持多订阅源批量管理与状态监控*

### 👥 订阅组聚合

![订阅组聚合](images/3.png)
*强大的聚合配置面板，支持多源节点重组与自定义节点过滤*

### ⚙️ 节点管理

![节点管理](images/4.png)
*独立节点展示与批量导入工具，支持多协议节点快速解析*

</details>

---

## ✨ 核心特性

| 模块 | 特性说明 |
| :--- | :--- |
| ⚡ **内置转换引擎** | 彻底摆脱对外部 Subconverter 依赖，解析与转换全在本地或 Worker 内完成，零隐私泄露风险、无第三方网络延迟 |
| 🔄 **双转换模式** | 支持内置极速内核与外部转换 API 双模式，兼顾极致安全性与深度定制需求 |
| 💾 **双存储引擎** | 原生适配 **Cloudflare KV**（毫秒级极速读取）与 **Cloudflare D1**（SQL 关系型数据库），后台支持一键无损平滑迁移 |
| 🔐 **现代化安全认证** | 告别繁琐易错的环境变量配置，内置开箱即用的管理员引导初始化与基于 SHA-256 + JWT Token 的安全认证 |
| 🔗 **短链与分发** | 原生支持短链接生成与多协议客户端适配，订阅分发更加整洁高效 |
| 📱 **全终端响应式** | 基于 Vue 3 + Tailwind CSS 构建，完美适配桌面宽屏、平板与手机移动端，支持精美深色主题 |

---

## 🚀 部署指南

本项目支持 Cloudflare Workers 和 Docker。

### 方案 A：Cloudflare Workers 部署

使用 Node.js 22 或更新版本，运行 `npm ci` 和 `npm run build`。本地预览可运行 `npx wrangler dev --test-scheduled`，使用本地 KV 和 D1。

配置 `CLOUDFLARE_ACCOUNT_ID` 和 `CLOUDFLARE_API_TOKEN` 后运行 `npm run deploy`。Token 需要目标账号的 Workers Scripts、Workers KV Storage 和 D1 编辑权限。使用 Workers Builds 时，创建名为 `sub-one` 的 Worker，构建命令填 `npm run build`，部署命令填 `npm run deploy`，并配置相同的部署变量，将 Token 保存为构建密钥。

在仓库根目录用 zsh 执行以下命令。全新安装可跳过注释中的迁移变量。

```zsh
npm ci && npm run build

export CLOUDFLARE_ACCOUNT_ID='your-account-id'
read -rs 'CLOUDFLARE_API_TOKEN?Cloudflare API Token: '
export CLOUDFLARE_API_TOKEN
echo

# export SUB_ONE_KV_ID='existing-kv-namespace-id'
# export SUB_ONE_D1_ID='existing-d1-database-id'

npm run deploy
```

部署自动创建或复用名为 `subone` 的 KV 命名空间和 D1 数据库，并初始化 D1 表结构。应用默认使用 KV，可在后台设置中切换存储后端。

从 Pages 迁移时，首次部署前将 `SUB_ONE_KV_ID` 和已使用的 `SUB_ONE_D1_ID` 设为原资源 ID，后续部署继续保留这些变量。在 Worker 上重新设置此前使用的应用密钥，例如 `ADMIN_PASSWORD`。先通过 Workers 地址验证登录、已有数据和订阅链接，再切换自定义域名。全新部署首次访问时按页面提示创建管理员账号。

### 方案 B：Docker / VPS 部署（轻量容器化）

适合拥有独立 VPS 并希望将数据存放在本地服务器的用户。数据将持久保存在本地 `./data/kv.json`。

#### 1. 使用 Docker Compose 一键启动（推荐）

下载预设的 `docker-compose.yml`：

```bash
# 下载配置文件
curl -O https://raw.githubusercontent.com/binbankm/Sub-One/main/docker-compose.yml

# 启动服务
docker-compose up -d
```

或手动编写 `docker-compose.yml`：

```yaml
version: '3.8'
services:
  sub-one:
    image: ghcr.io/binbankm/sub-one:latest
    container_name: sub-one
    ports:
      - '3055:3055'
    volumes:
      - ./data:/app/data
    restart: unless-stopped
    environment:
      - PORT=3055
      - TZ=Asia/Shanghai
```

#### 2. 使用 Docker Run 单行运行

```bash
docker run -d \
  --name sub-one \
  --restart unless-stopped \
  -p 3055:3055 \
  -v $(pwd)/data:/app/data \
  -e PORT=3055 \
  ghcr.io/binbankm/sub-one:latest
```

> [!IMPORTANT]
> 容器默认监听端口为 `3055`。务必挂载 `/app/data` 目录以确保持久化存储订阅和账号数据，避免容器更新或重启后数据丢失。

---

### 方案 C：本地开发与编译构建

```bash
# 1. 克隆代码仓库
git clone https://github.com/binbankm/Sub-One.git
cd Sub-One

# 2. 安装依赖包
npm install

# 3. 启动本地开发服务 (支持前端热更新)
npm run dev

# 4. 编译打包生产版本
npm run build

# 5. 预览生产版本
npm run preview
```

---

## 🏗️ 架构与目录结构

<details>
<summary>📁 点击展开查看完整源码架构树</summary>

```text
Sub-One/
├── src/                         # 前端工程源码
│   ├── assets/                 # 静态多媒体资源
│   ├── components/              # 通用业务与UI组件 (图表、编辑器、弹窗等)
│   ├── composables/            # Vue 组合式业务逻辑
│   ├── features/               # 核心功能模块 (Dashboard、Nodes、Profiles、Settings等)
│   ├── pages/                  # 顶层路由页面 (LoginPage, DashboardPage)
│   ├── stores/                 # Pinia 状态管理
│   ├── types/                  # 全局 TypeScript 类型声明
│   ├── utils/                  # 前端工具函数库
│   ├── App.vue                 # 根组件
│   └── main.ts                 # 前端入口文件
├── lib/                         # 后端核心业务逻辑库
│   └── backend/                # 纯 TypeScript 后端实现
│       ├── api/               # API 路由转发与处理器
│       ├── config/            # 全局常量与默认配置
│       ├── cron/              # 定时自动化任务
│       ├── proxy/             # 转换引擎 (核心 Parser 与 Converter)
│       ├── services/          # 数据与存储驱动 (KV, D1, JSON, Auth, Notification)
│       └── utils/             # 后端辅助工具库
├── docker/                     # 容器化适配脚本 (内置 Node.js 本地模拟环境)
├── worker/                     # Cloudflare Workers 接口入口
├── images/                     # 文档演示截图
├── db/                         # D1 数据库初始化脚本 (init.sql)
├── wrangler.toml               # Cloudflare 配置文件
└── Dockerfile                  # 镜像构建定义
```

</details>

---

## 📝 版本更新历史 (v2.0)

- **⚡ 内置转换引擎**：彻底重构协议解析与生成底层逻辑，移除外部依赖，全面提升稳定性与安全性。
- **🔄 灵活双模转换**：内置转换支持高保真格式处理，同时保留外部自定义转换 API 接入能力。
- **🔐 全新账户鉴权**：废除繁杂的环境变量依赖，改用动态多用户管理与安全 JWT 校验机制。
- **🔗 原生短链接**：支持一键生成节点与聚合配置短链，方便导入各类主流客户端。
- **🏗️ 全模块化解耦**：前后端工程结构重构，清晰分离视图层与代理转换核心，便于社区协同维护。

---

## 🛠️ 常见问题排查 (FAQ)

<details>
<summary>❓ 遇到问题？点击展开常见解决方案</summary>

1. **首次部署打开后没有出现初始化界面？**
   - 检查 Cloudflare Workers 项目中环境变量/命名空间绑定变量名是否严格为 `SUB_ONE_KV`。
   - 打开浏览器开发者工具（F12），检查控制台网络请求是否有报错。
   - 清除浏览器缓存或在无痕模式下访问。

2. **忘记管理员用户名或密码怎么办？**
   - **Cloudflare Workers**：进入 Cloudflare 控制台 → **KV** → 选择您的命名空间，搜索并删除键名为 `sub_one_users_v1` 的数据项，刷新页面即可重新初始化管理员账号。
   - **Docker 部署**：删除挂载目录 `data/` 下对应的用户信息键值或直接重命名 `kv.json` 即可重新初始化。

3. **从 KV 切换至 D1 数据库报错？**
   - 确认是否已在 D1 控制台完整执行过 `db/init.sql` 初始化语句。
   - 确认 Workers 项目绑定中变量名称是否严格为 `SUB_ONE_D1`。

4. **构建编译失败 (Build Error)？**
   - 请确保 Node.js 版本 `>= 18.0.0`。
   - 尝试在本地清理依赖后重新构建：`rm -rf node_modules dist && npm install && npm run build`。

</details>

---

## 🔒 安全建议

1. **强密码策略**：首次创建管理员账号时，请务必设置包含大小写字母、数字及特殊符号的复杂密码。
2. **凭据安全存储**：用户认证密码采用单向不可逆的 SHA-256 哈希加盐计算，切勿随意公开存储文件备份。
3. **启用 HTTPS**：建议通过 Cloudflare 开启全程强制 HTTPS 加密传输，防止中间人嗅探。
4. **定期数据备份**：利用系统内置的「备份与恢复」功能定期导出配置数据，以防数据误删。

---

## 🙏 致谢与灵感源泉

- **[CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB)**：感谢 [@cmliu](https://github.com/cmliu) 大佬提供的优秀架构思路与灵感。
- **[MiSub](https://github.com/imzyb/MiSub)**：感谢原作者 [@imzyb](https://github.com/imzyb) 及所有参与贡献的开发者。
- **开源生态**：感谢 Vue.js、Tailwind CSS、Cloudflare Workers 等优秀开源项目支持。

---

## Sponsors

Sponsored by [ForZTN](https://sponsorship.forztn.com/github.com/binbankm/Sub-One).

---

## 📄 开源协议

本项目采用 [MIT License](LICENSE) 授权开源，欢迎自由分发与二次开发。

*如果您觉得这个项目对您有所帮助，请给仓库点亮一个 ⭐ Star，感谢支持！*

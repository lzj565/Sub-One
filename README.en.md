# Sub-One Manager

> 🚀 A modern network subscription management and conversion platform based on Vue 3, specifically designed for Cloudflare Workers and lightweight private containers.

[![GitHub Release](https://img.shields.io/badge/Release-v2.0.0-blue.svg)](https://github.com/binbankm/Sub-One/releases)
[![Vue.js](https://img.shields.io/badge/Vue.js-3.5+-4FC08D?style=flat&logo=vue.js&logoColor=white)](https://vuejs.org/)
[![TypeScript](https://img.shields.io/badge/TypeScript-5.0+-3178C6?style=flat&logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4.0+-38B2AC?style=flat&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![Cloudflare Workers](https://img.shields.io/badge/Cloudflare_Workers-Deploy-F38020?style=flat&logo=cloudflare&logoColor=white)](https://developers.cloudflare.com/workers/)
[![Docker Image](https://img.shields.io/badge/Docker-ghcr.io-2496ED?style=flat&logo=docker&logoColor=white)](https://github.com/binbankm/Sub-One/pkgs/container/sub-one)
[![License](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

[简体中文](README.md) | **English**

---

## 🌟 Preview

![Sub-One Manager Dashboard](images/1.png)

<details>
<summary>🖼️ Click to expand more screenshots</summary>

### 🔐 Authentication & Initialization

![Login Interface](images/0.png)
*Clean and secure login interface, automatically prompting administrator creation on first setup*

### 📋 Subscription Management

![Subscription Management](images/2.png)
*Responsive grid layout supporting batch management and real-time status monitoring*

### 👥 Profile Aggregation

![Profile Aggregation](images/3.png)
*Powerful aggregation panel supporting multi-source node reordering and custom rule filtering*

### ⚙️ Node Management

![Node Management](images/4.png)
*Individual node viewer and batch import tool supporting quick parsing across protocols*

</details>

---

## ✨ Key Features

| Module | Feature Description |
| :--- | :--- |
| ⚡ **Built-in Conversion Engine** | Completely eliminates dependence on external Subconverter instances; all parsing and conversions run locally or inside Workers with zero data leakage and zero third-party latency |
| 🔄 **Dual Conversion Modes** | Supports both high-performance built-in engines and external conversion APIs, balancing enterprise security with advanced customization |
| 💾 **Dual Storage Engines** | Native support for **Cloudflare KV** (sub-millisecond reads) and **Cloudflare D1** (SQL relational database) with zero-downtime automated migrations from the dashboard |
| 🔐 **Modern Authentication** | Replaces static environment variables with intuitive first-time setup and secure SHA-256 + JWT token multi-account authentication |
| 🔗 **Short Links & Distribution** | Built-in short link generation and universal client format export for clean and effortless subscription distribution |
| 📱 **Full-Device Responsive UI** | Built with Vue 3 + Tailwind CSS, beautifully optimized across desktop widescreen, tablets, and mobile devices with native dark mode |

---

## 🚀 Deployment Guide

Sub-One supports Cloudflare Workers and Docker.

### Strategy A: Cloudflare Workers

Run `npm ci` and `npm run build` with Node.js 22 or newer. Run `npx wrangler dev --test-scheduled` for local development with local KV and D1.

Set `CLOUDFLARE_ACCOUNT_ID` and `CLOUDFLARE_API_TOKEN` and run `npm run deploy`. Use an account-scoped token with Workers Scripts, Workers KV Storage and D1 edit permissions. In Workers Builds, create a Worker named `sub-one`, set the build command to `npm run build`, the deploy command to `npm run deploy`, and provide the same deployment variables, with the token stored as a build secret.

Run the following in the repository root using zsh. For a fresh installation, skip the two commented migration variables.

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

Deployment creates or reuses a KV namespace and a D1 database, both named `subone`, and initializes the D1 schema. The application defaults to KV. You can switch storage in Settings.

For a Pages migration, set `SUB_ONE_KV_ID` and, if applicable, `SUB_ONE_D1_ID` to your existing resource IDs before the first deployment and keep them configured for later deployments. Restore any application secrets such as `ADMIN_PASSWORD` on the Worker. Verify login, existing data and subscription links on the Workers URL before moving the custom domain. On a fresh deployment, follow the first-visit prompt to create the administrator account.

### Strategy B: Docker / VPS Deployment (Lightweight Container)

Ideal for users with their own VPS who prefer local data ownership. Data is persisted to `./data/kv.json`.

#### 1. Quick Start via Docker Compose (Recommended)

Download the pre-configured `docker-compose.yml`:

```bash
# Download compose file
curl -O https://raw.githubusercontent.com/binbankm/Sub-One/main/docker-compose.yml

# Start service
docker-compose up -d
```

Or manually create `docker-compose.yml`:

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

#### 2. Single-line Command via Docker Run

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
> The container listens on port `3055` by default. Always mount the `/app/data` volume to guarantee persistent storage of subscriptions and credentials across updates.

---

### Strategy C: Local Development & Build

```bash
# 1. Clone the repository
git clone https://github.com/binbankm/Sub-One.git
cd Sub-One

# 2. Install dependencies
npm install

# 3. Start local development server (with HMR)
npm run dev

# 4. Build production bundle
npm run build

# 5. Preview production build
npm run preview
```

---

## 🏗️ Architecture & Project Structure

<details>
<summary>📁 Click to expand full source architecture tree</summary>

```text
Sub-One/
├── src/                         # Frontend application source
│   ├── assets/                 # Static media and icons
│   ├── components/              # Shared UI and business components (Charts, Modals, etc.)
│   ├── composables/            # Vue composable business logic
│   ├── features/               # Core feature modules (Dashboard, Nodes, Profiles, Settings)
│   ├── pages/                  # Top-level route pages (LoginPage, DashboardPage)
│   ├── stores/                 # State management (Pinia)
│   ├── types/                  # Global TypeScript type definitions
│   ├── utils/                  # Frontend utilities
│   ├── App.vue                 # Root component
│   └── main.ts                 # Frontend entry point
├── lib/                         # Backend business logic library
│   └── backend/                # Pure TypeScript backend implementation
│       ├── api/               # API routes and request handlers
│       ├── config/            # Global constants and defaults
│       ├── cron/              # Automated scheduled tasks
│       ├── proxy/             # Core conversion engine (Parser & Converter)
│       ├── services/          # Storage and infrastructure services (KV, D1, Auth, Notification)
│       └── utils/             # Backend utilities
├── docker/                     # Container adapter script (Node.js runtime simulator)
├── worker/                     # Cloudflare Workers entry points
├── images/                     # Documentation screenshots
├── db/                         # D1 database initialization scripts (init.sql)
├── wrangler.toml               # Cloudflare configuration file
└── Dockerfile                  # Container build instructions
```

</details>

---

## 📝 Changelog Highlights (v2.0)

- **⚡ Built-in Conversion Engine**: Core parser and generator completely overhauled to eliminate external subconverter dependencies, maximizing speed and data privacy.
- **🔄 Flexible Dual Conversion**: Added built-in high-fidelity protocol conversion while retaining optional custom external API integration.
- **🔐 Modernized Access Control**: Deprecated clumsy environment variables in favor of dynamic admin onboarding and cryptographically secure JWT verification.
- **🔗 Native Short Links**: Native short link generation makes subscription sharing and client onboarding seamless.
- **🏗️ Decoupled Modular Architecture**: Clean separation between reactive frontend views and core conversion proxies for simpler maintenance.

---

## 🛠️ Troubleshooting (FAQ)

<details>
<summary>❓ Encountering issues? Click to expand common solutions</summary>

1. **Initialization screen does not appear on first visit?**
   - Verify that your Cloudflare Workers KV namespace binding variable name is strictly `SUB_ONE_KV`.
   - Open browser developer tools (F12) and inspect the Console/Network tabs for errors.
   - Clear your browser cache or visit in Incognito mode.

2. **Forgot administrator username or password?**
   - **Cloudflare Workers**: In the Cloudflare Dashboard → **KV** → select your namespace, search and delete the key `sub_one_users_v1`, then refresh your application to re-initialize your admin account.
   - **Docker Deployment**: Remove the user key from the mounted `data/` volume or rename `kv.json` to trigger onboarding.

3. **Errors when switching from KV to D1?**
   - Ensure you have executed `db/init.sql` in the D1 database console.
   - Double check that the Workers binding variable name is set strictly to `SUB_ONE_D1`.

4. **Build failed during deployment?**
   - Make sure your Node.js runtime version is `>= 18.0.0`.
   - Try local clean build: `rm -rf node_modules dist && npm install && npm run build`.

</details>

---

## 🔒 Security Best Practices

1. **Strong Passwords**: Use a strong password containing uppercase, lowercase, numbers, and special characters during administrator setup.
2. **Encrypted Storage**: Credentials are salted and hashed using one-way SHA-256 before storage.
3. **Always HTTPS**: Enable Cloudflare Full (Strict) SSL/TLS encryption to prevent eavesdropping and MITM attacks.
4. **Regular Backups**: Use the built-in Backup & Restore feature in Settings to export configurations regularly.

---

## 🙏 Acknowledgements

- **[CF-Workers-SUB](https://github.com/cmliu/CF-Workers-SUB)**: Special thanks to [@cmliu](https://github.com/cmliu) for architectural inspiration.
- **[MiSub](https://github.com/imzyb/MiSub)**: Appreciation to original author [@imzyb](https://github.com/imzyb) and contributors.
- **Open Source Community**: Gratitude to the Vue.js, Tailwind CSS, and Cloudflare Workers ecosystems.

---

## Sponsors

Sponsored by [ForZTN](https://sponsorship.forztn.com/github.com/binbankm/Sub-One).

---

## 📄 License

This project is open-source under the [MIT License](LICENSE). Contributions and forks are welcomed!

*If you find Sub-One Manager helpful, please give it a ⭐ Star on GitHub!*

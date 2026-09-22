# PrivacyPay Deployment Guide

## 1. Overview
PrivacyPay is built as a cloud-native monorepo ready for deployment on Vercel, Node.js container runtimes, and the Midnight Network.

---

## 2. Environments

| Environment | Purpose | Blockchain Target |
| :--- | :--- | :--- |
| **Development** | Local iteration & testing | Local Compact Runtime & Simulator |
| **Preprod** | MVP testing & user validation | Midnight Preprod Testnet |
| **Mainnet** | Production release | Midnight Mainnet |

---

## 3. Vercel Monorepo Configuration
The repository includes `vercel.json` at root:

```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "frontend/.next",
  "framework": "nextjs"
}
```

Deploy directly via GitHub integration on [vercel.com](https://vercel.com).

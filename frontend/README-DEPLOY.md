# Frontend Deployment Instructions

## Option A: Same Repository
1. In Render service settings, set "Root Directory" to: `frontend`
2. Keep render.yaml as is

## Option B: Separate Repository (Recommended)
1. Create new GitHub repo: `stock-meuve-frontend`
2. Copy only the frontend folder contents
3. Use this render.yaml:

```yaml
services:
  - type: web
    name: stockflow-frontend
    env: node
    plan: free
    buildCommand: npm install && npm run build
    startCommand: npm start
    envVars:
      - key: NEXT_PUBLIC_API_URL
        value: https://stock-meuve.onrender.com
    healthCheckPath: /
```

## Files to Copy for Separate Repo:
- package.json
- next.config.ts
- tsconfig.json
- tailwind.config.js
- postcss.config.js
- src/ folder
- public/ folder
- .env.production

## Do NOT copy:
- node_modules/
- .next/
- Any backend files

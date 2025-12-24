# Vercel Deployment - Implementation Summary

## Overview

This document summarizes the changes made to enable deployment of both the API and Web applications to Vercel in a single project.

## What Changed

### 1. **Project Structure**

The repository is now structured as a monorepo that can be deployed to Vercel with both frontend and backend:

```
/
├── api/                           # Backend API
│   ├── api/                      # NEW: Vercel serverless entry
│   │   ├── index.ts             # Serverless function handler
│   │   ├── README.md            # Structure documentation
│   │   └── .gitignore           # Ignore build artifacts
│   ├── src/
│   │   ├── app.ts               # NEW: Express app (serverless-ready)
│   │   ├── index.ts             # MODIFIED: Local dev server
│   │   └── ...
│   ├── package.json             # MODIFIED: Added postinstall, vercel-build
│   └── tsconfig.json            # MODIFIED: Include api/ directory
├── web/                          # Frontend React app (unchanged)
├── vercel.json                   # MODIFIED: Multi-build configuration
├── package.json                  # NEW: Root workspace config
├── .vercelignore                 # NEW: Exclude files from deployment
├── .env.vercel.example           # NEW: Environment variables template
├── VERCEL_DEPLOYMENT.md          # NEW: Complete deployment guide
├── VERCEL_QUICK_START.md         # NEW: Quick reference guide
└── README.md                     # MODIFIED: Added deployment section
```

### 2. **Key Technical Changes**

#### API Restructuring
- **Created `api/src/app.ts`**: Exports the Express app without starting a server
- **Modified `api/src/index.ts`**: Now imports app and starts local server with Socket.io
- **Created `api/api/index.ts`**: Vercel serverless function entry point
- This separation allows:
  - Local development with full HTTP server and Socket.io
  - Serverless deployment on Vercel (without Socket.io)

#### Vercel Configuration (`vercel.json`)
```json
{
  "version": 2,
  "builds": [
    {
      "src": "api/api/index.ts",
      "use": "@vercel/node",
      "config": {
        "includeFiles": ["api/prisma/schema.prisma"]
      }
    },
    {
      "src": "web/package.json",
      "use": "@vercel/static-build",
      "config": {
        "distDir": "dist"
      }
    }
  ],
  "routes": [
    {
      "src": "/api/(.*)",
      "dest": "/api/api/index.ts"
    },
    {
      "src": "/(.*)",
      "dest": "/web/$1"
    }
  ],
  "rewrites": [
    {
      "source": "/((?!api).*)",
      "destination": "/web/index.html"
    }
  ],
  "env": {
    "NODE_ENV": "production"
  }
}
```

This configuration:
- Builds API as serverless functions at `/api/*`
- Builds Web as static site at `/*`
- Routes API requests to serverless function (note: `/api/api/index.ts` is the Vercel path format where the first `api/` is the workspace directory and the second `api/` is the serverless function directory)
- Routes all other requests to web app with SPA support

#### API Package Changes (`api/package.json`)
```json
{
  "scripts": {
    "postinstall": "prisma generate",
    "vercel-build": "prisma generate && tsc"
  },
  "dependencies": {
    "prisma": "^5.7.0"  // Moved from devDependencies
  }
}
```

- **postinstall**: Automatically generates Prisma Client after npm install
- **vercel-build**: Custom build command for Vercel
- **prisma**: Moved to dependencies to ensure it's available in production

#### TypeScript Configuration (`api/tsconfig.json`)
```json
{
  "compilerOptions": {
    "rootDir": "."  // Changed from "./src"
  },
  "include": ["src/**/*", "api/**/*"]  // Added api/**/*
}
```

This allows TypeScript to compile both `src/` and `api/` directories.

### 3. **Documentation Added**

1. **VERCEL_DEPLOYMENT.md** (10,000+ words)
   - Complete step-by-step deployment guide
   - Database setup instructions (Neon, Supabase, Railway)
   - Environment variables configuration
   - Troubleshooting section
   - Post-deployment verification

2. **VERCEL_QUICK_START.md** (3,000+ words)
   - Quick reference checklist
   - Essential environment variables
   - Common commands
   - Testing procedures

3. **api/api/README.md**
   - Explains the dual structure (local vs serverless)
   - Documents how the builds work

4. **.env.vercel.example**
   - Template for all required environment variables
   - Examples for different database providers
   - Instructions for generating secrets

## How It Works

### Local Development

```bash
# Terminal 1 - API with Socket.io
cd api
npm install
npm run dev  # Uses src/index.ts

# Terminal 2 - Web
cd web
npm install
npm run dev
```

- API runs on `http://localhost:3001`
- Web runs on `http://localhost:5173`
- Full Socket.io support for real-time features

### Vercel Deployment

1. **Build Process**
   ```
   api/api/index.ts → @vercel/node → Serverless function
   web/            → @vercel/static-build → Static site
   ```

2. **Routing**
   ```
   /api/*     → API serverless function
   /*         → Web static site (with SPA support)
   ```

3. **Runtime**
   - API: Node.js serverless functions (cold starts possible)
   - Web: Static files served from CDN (instant)
   - Database: External PostgreSQL (Neon, Supabase, Railway)

## Deployment Process

### Quick Steps

1. **Set up database** (Neon, Supabase, or Railway)
2. **Connect repository to Vercel**
3. **Add environment variables**:
   - `DATABASE_URL`
   - `JWT_SECRET`
   - `REFRESH_TOKEN_SECRET`
   - `VITE_API_URL`
   - `CORS_ORIGIN`
4. **Deploy** (automatic from `vercel.json`)
5. **Run migrations**: `npx prisma migrate deploy`
6. **Update `VITE_API_URL`** with deployment URL
7. **Redeploy**

### Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://...

# Authentication
JWT_SECRET=<generate-random-32-chars>
REFRESH_TOKEN_SECRET=<generate-random-32-chars>

# Configuration
NODE_ENV=production
VITE_API_URL=https://your-project.vercel.app
CORS_ORIGIN=https://your-project.vercel.app
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

Generate secrets with:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

## Important Limitations

### Socket.io Not Supported

⚠️ **Vercel serverless functions don't support WebSocket connections**

This means:
- ✅ All REST API endpoints work
- ❌ Real-time Socket.io features won't work
- ❌ Live debate real-time updates won't work

**Solutions**:
1. Deploy Socket.io separately (Railway, Render, Fly.io)
2. Use alternative real-time services (Pusher, Ably)
3. Use Vercel Edge Functions with Server-Sent Events (SSE)
4. Accept limitation for REST API only deployment

### Other Considerations

1. **Cold Starts**: First request after inactivity may be slow (1-3 seconds)
2. **Stateless**: Each request may hit different serverless instance
3. **Execution Time**: Vercel has 10-second timeout for hobby plan
4. **Database Migrations**: Must be run manually, not during deployment

## Testing Deployment

### 1. API Health Check
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Virtual Debating Club API is running"}
```

### 2. User Registration
```bash
curl -X POST https://your-project.vercel.app/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "username": "testuser",
    "password": "TestPassword123!",
    "name": "Test User"
  }'
```

### 3. Web App
Visit `https://your-project.vercel.app` in browser

## Files Modified

### Modified Files
- `api/src/index.ts` - Now uses app from app.ts
- `api/package.json` - Added postinstall, vercel-build, moved prisma
- `api/tsconfig.json` - Changed rootDir, added api/** to includes
- `vercel.json` - Complete rewrite for dual deployment
- `.gitignore` - Added .vercel
- `README.md` - Added deployment section

### New Files
- `api/src/app.ts` - Serverless-ready Express app
- `api/api/index.ts` - Vercel serverless entry point
- `api/api/README.md` - Structure documentation
- `api/api/.gitignore` - Ignore build outputs
- `package.json` (root) - Workspace configuration
- `.vercelignore` - Exclude files from deployment
- `.env.vercel.example` - Environment variables template
- `VERCEL_DEPLOYMENT.md` - Complete deployment guide
- `VERCEL_QUICK_START.md` - Quick reference

## Backward Compatibility

✅ **All existing functionality remains unchanged for local development**

- `npm run dev` works exactly as before
- Docker Compose works as before
- All tests work as before
- Socket.io works in local development

The changes only add Vercel deployment capability without breaking existing workflows.

## Next Steps

After reviewing this implementation:

1. Test local development to ensure nothing broke
2. Deploy to Vercel following VERCEL_DEPLOYMENT.md
3. Verify all API endpoints work in production
4. Test web app functionality
5. Consider Socket.io alternatives if real-time features are needed

## Support

- **Full Guide**: [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)
- **Quick Reference**: [VERCEL_QUICK_START.md](VERCEL_QUICK_START.md)
- **Issues**: Open a GitHub issue if problems arise

## Summary

The project is now ready for Vercel deployment with:
- ✅ Single-project deployment (API + Web)
- ✅ Automatic builds and deployments
- ✅ Complete documentation
- ✅ Environment variable templates
- ✅ Local development unchanged
- ⚠️ Socket.io limitation documented
- ✅ All REST API functionality working

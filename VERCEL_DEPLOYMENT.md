# Vercel Deployment Guide

This guide will walk you through deploying both the API and Web applications to Vercel in a single project.

## 📋 Table of Contents

1. [Prerequisites](#prerequisites)
2. [Project Structure](#project-structure)
3. [Database Setup](#database-setup)
4. [Vercel Configuration](#vercel-configuration)
5. [Deployment Steps](#deployment-steps)
6. [Environment Variables](#environment-variables)
7. [Post-Deployment](#post-deployment)
8. [Troubleshooting](#troubleshooting)

## Prerequisites

Before deploying to Vercel, ensure you have:

- A [Vercel account](https://vercel.com/signup) (free tier works)
- A [GitHub account](https://github.com) with this repository
- A PostgreSQL database (we recommend [Neon](https://neon.tech), [Supabase](https://supabase.com), or [Railway](https://railway.app))
- Basic knowledge of Git and command line

## Project Structure

The project is structured as a monorepo with both API and Web applications:

```
/
├── api/                    # Backend Express API
│   ├── api/               # Vercel serverless function entry
│   │   └── index.ts       # API handler for Vercel
│   ├── src/               # API source code
│   │   ├── app.ts         # Express app (serverless-ready)
│   │   ├── index.ts       # Local development server
│   │   └── routes/        # API routes
│   ├── prisma/            # Database schema
│   └── package.json       # API dependencies
├── web/                   # Frontend React application
│   ├── src/               # Web source code
│   ├── dist/              # Build output (generated)
│   └── package.json       # Web dependencies
├── vercel.json            # Vercel configuration
├── package.json           # Root workspace configuration
└── .vercelignore          # Files to exclude from deployment
```

## Database Setup

### Option 1: Neon (Recommended)

1. Sign up at [Neon](https://neon.tech)
2. Create a new project
3. Copy the connection string (it will look like: `postgresql://user:password@ep-xxx.us-east-2.aws.neon.tech/neondb`)

### Option 2: Supabase

1. Sign up at [Supabase](https://supabase.com)
2. Create a new project
3. Go to Settings → Database
4. Copy the "Connection string" under "Connection pooling" (transaction mode)

### Option 3: Railway

1. Sign up at [Railway](https://railway.app)
2. Create a new project
3. Add a PostgreSQL database
4. Copy the connection string from the database settings

## Vercel Configuration

The repository includes a `vercel.json` file that configures:

- **API**: Deployed as serverless functions at `/api/*`
- **Web**: Deployed as a static site at `/*`
- **Routing**: API requests go to `/api/api/index.ts`, all other requests go to the web app

## Deployment Steps

### 1. Fork or Clone the Repository

If you haven't already, fork this repository to your GitHub account or ensure you have push access.

### 2. Connect to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click **"Add New..."** → **"Project"**
3. Select **"Import Git Repository"**
4. Choose your GitHub repository
5. Click **"Import"**

### 3. Configure Project Settings

Vercel will auto-detect the configuration from `vercel.json`. Verify these settings:

- **Framework Preset**: Other (or None)
- **Root Directory**: `.` (leave empty for root)
- **Build Command**: Leave empty (uses vercel.json configuration)
- **Output Directory**: Leave empty (uses vercel.json configuration)
- **Install Command**: `npm install`

### 4. Set Environment Variables

Click on **"Environment Variables"** and add the following:

#### Required Variables

| Variable Name | Value | Description |
|--------------|-------|-------------|
| `DATABASE_URL` | `postgresql://...` | PostgreSQL connection string from your database provider |
| `JWT_SECRET` | Generate a random string | Secret key for JWT tokens (use a password generator) |
| `REFRESH_TOKEN_SECRET` | Generate a random string | Secret key for refresh tokens |
| `NODE_ENV` | `production` | Node environment |
| `VITE_API_URL` | Will be set after first deploy | Your Vercel deployment URL (e.g., `https://your-project.vercel.app`) |

#### Optional Variables (with defaults)

| Variable Name | Default | Description |
|--------------|---------|-------------|
| `ACCESS_TOKEN_TTL` | `15m` | Access token expiration time |
| `REFRESH_TOKEN_TTL` | `7d` | Refresh token expiration time |
| `CORS_ORIGIN` | Auto-configured | CORS allowed origins (use your Vercel URL) |

**Note**: For `JWT_SECRET` and `REFRESH_TOKEN_SECRET`, you can generate secure random strings using:
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### 5. Deploy

1. Click **"Deploy"**
2. Vercel will:
   - Install dependencies
   - Build the API (compile TypeScript)
   - Generate Prisma Client
   - Build the Web app (Vite)
   - Deploy both to CDN and serverless functions

3. Wait for deployment to complete (usually 2-5 minutes)

### 6. Update API URL

After the first deployment:

1. Copy your deployment URL (e.g., `https://your-project.vercel.app`)
2. Go to **Project Settings** → **Environment Variables**
3. Update `VITE_API_URL` to your deployment URL
4. **Redeploy** the project (Settings → Deployments → click on latest deployment → Redeploy)

### 7. Run Database Migrations

Vercel serverless functions cannot run migrations automatically. You need to run migrations locally or from a CI/CD pipeline:

#### Option A: Run Locally

```bash
# Clone the repository
git clone <your-repo-url>
cd debate

# Install dependencies
cd api
npm install

# Set DATABASE_URL in your environment
export DATABASE_URL="your-production-database-url"

# Run migrations
npx prisma migrate deploy

# Generate Prisma Client
npx prisma generate
```

#### Option B: Use Vercel CLI

```bash
# Install Vercel CLI
npm install -g vercel

# Login to Vercel
vercel login

# Link to your project
vercel link

# Pull environment variables
vercel env pull

# Run migrations
cd api
npx prisma migrate deploy
```

## Environment Variables

### Complete List

Here's the complete list of environment variables you need to set in Vercel:

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication
JWT_SECRET=your-super-secret-jwt-key-min-32-chars
REFRESH_TOKEN_SECRET=your-super-secret-refresh-key-min-32-chars
ACCESS_TOKEN_TTL=15m
REFRESH_TOKEN_TTL=7d

# API Configuration
NODE_ENV=production
PORT=3001

# CORS (use your Vercel URL)
CORS_ORIGIN=https://your-project.vercel.app
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app

# Web App (Frontend)
VITE_API_URL=https://your-project.vercel.app
```

### Setting Environment Variables

1. Go to your project in Vercel
2. Click **Settings** → **Environment Variables**
3. Add each variable with its value
4. Choose which environments it applies to:
   - **Production**: For your main deployment
   - **Preview**: For pull request previews
   - **Development**: For local development

## Post-Deployment

### Verify Deployment

1. **Check API Health**
   - Visit: `https://your-project.vercel.app/api/health`
   - Should return: `{"status":"ok","message":"Virtual Debating Club API is running"}`

2. **Check Web App**
   - Visit: `https://your-project.vercel.app`
   - Should load the home page

3. **Test Authentication**
   - Try registering a new user
   - Try logging in

### Configure Custom Domain (Optional)

1. Go to your project in Vercel
2. Click **Settings** → **Domains**
3. Click **Add Domain**
4. Enter your domain name (e.g., `debate.yourdomain.com`)
5. Follow DNS configuration instructions
6. Update `VITE_API_URL` and `CORS_ORIGIN` environment variables with your custom domain

### Enable Auto-Deployments

Vercel automatically deploys:
- **Production**: Every push to `main` branch
- **Preview**: Every pull request gets a unique preview URL

You can configure deployment settings in **Project Settings** → **Git**.

## Troubleshooting

### Common Issues

#### 1. "Cannot find module '@prisma/client'"

**Solution**: Ensure Prisma Client is generated during build. Add to `api/package.json`:

```json
{
  "scripts": {
    "postinstall": "prisma generate"
  }
}
```

Then redeploy.

#### 2. Database Connection Errors

**Solution**: 
- Verify `DATABASE_URL` is correct in Vercel environment variables
- Ensure database allows connections from anywhere (0.0.0.0/0)
- Check if database requires SSL: Add `?sslmode=require` to connection string

#### 3. CORS Errors

**Solution**:
- Ensure `CORS_ORIGIN` includes your Vercel URL
- Update `VITE_API_URL` to point to your Vercel URL
- Redeploy after changing environment variables

#### 4. API Returns 404

**Solution**:
- Check `vercel.json` routing configuration
- Ensure API routes start with `/api/`
- Check Vercel function logs: Dashboard → Deployments → Click deployment → Functions

#### 5. Build Fails

**Solution**:
- Check build logs in Vercel dashboard
- Ensure all dependencies are in `package.json` (not just `devDependencies`)
- Verify TypeScript compiles locally: `npm run build`

#### 6. Socket.io Not Working

**Important**: Vercel serverless functions don't support WebSocket connections (Socket.io). For real-time features:

**Options**:
1. Use Vercel's edge functions (limited support)
2. Deploy Socket.io server separately on a platform like Railway or Render
3. Use alternative real-time solutions like Pusher or Ably
4. Consider Vercel Edge Functions with Server-Sent Events (SSE)

For this deployment, Socket.io features will be disabled. The API routes will work, but real-time debate features won't function.

### View Logs

To debug issues:

1. Go to **Vercel Dashboard** → **Deployments**
2. Click on your deployment
3. Click on **"Functions"** tab to see serverless function logs
4. Click on **"Building"** tab to see build logs

### Test Locally Before Deploying

Always test locally before deploying:

```bash
# Terminal 1 - API
cd api
npm install
npm run dev

# Terminal 2 - Web
cd web
npm install
npm run dev
```

Visit `http://localhost:5173` and test functionality.

## Additional Resources

- [Vercel Documentation](https://vercel.com/docs)
- [Vercel Node.js Runtime](https://vercel.com/docs/runtimes#official-runtimes/node-js)
- [Prisma with Vercel](https://www.prisma.io/docs/guides/deployment/deployment-guides/deploying-to-vercel)
- [Vite Deployment](https://vitejs.dev/guide/static-deploy.html#vercel)

## Support

If you encounter issues not covered here:

1. Check [Vercel Documentation](https://vercel.com/docs)
2. Open an issue on the GitHub repository
3. Contact the maintainers

---

**Next Steps**:
- Set up continuous deployment from GitHub
- Configure custom domain
- Set up database backups
- Monitor application performance in Vercel Analytics
- Enable Vercel Web Analytics for the frontend

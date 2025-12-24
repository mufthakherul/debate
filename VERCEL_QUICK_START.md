# Vercel Deployment - Quick Reference

## 🚀 Quick Deploy Checklist

- [ ] Set up PostgreSQL database (Neon, Supabase, or Railway)
- [ ] Connect GitHub repository to Vercel
- [ ] Add environment variables in Vercel
- [ ] Deploy to Vercel
- [ ] Run database migrations
- [ ] Update VITE_API_URL with deployment URL
- [ ] Redeploy to apply API URL
- [ ] Test deployment

## 🔑 Required Environment Variables

```env
# Database
DATABASE_URL=postgresql://user:password@host:5432/database

# Authentication (generate with: node -e "console.log(require('crypto').randomBytes(32).toString('hex'))")
JWT_SECRET=your-secret-key-min-32-chars
REFRESH_TOKEN_SECRET=your-refresh-secret-min-32-chars

# Configuration
NODE_ENV=production
VITE_API_URL=https://your-project.vercel.app
CORS_ORIGIN=https://your-project.vercel.app
CORS_ALLOWED_ORIGINS=https://your-project.vercel.app
```

## 📋 Project URLs After Deployment

- **Web App**: `https://your-project.vercel.app`
- **API Health**: `https://your-project.vercel.app/api/health`
- **API Endpoints**: `https://your-project.vercel.app/api/*`

## 🛠️ Run Database Migrations

### Option 1: Vercel CLI
```bash
vercel env pull
cd api
npx prisma migrate deploy
```

### Option 2: Local with Production DB
```bash
cd api
export DATABASE_URL="your-production-database-url"
npx prisma migrate deploy
```

## 🧪 Test Your Deployment

### 1. Test API Health
```bash
curl https://your-project.vercel.app/api/health
```

Expected response:
```json
{"status":"ok","message":"Virtual Debating Club API is running"}
```

### 2. Test User Registration
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

### 3. Visit Web App
Open `https://your-project.vercel.app` in your browser

## 🔧 Common Commands

### Generate JWT Secret
```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

### View Vercel Logs
```bash
vercel logs
```

### Redeploy
```bash
vercel --prod
```

## 📚 Full Documentation

For complete deployment instructions, troubleshooting, and detailed explanations:

**→ [VERCEL_DEPLOYMENT.md](VERCEL_DEPLOYMENT.md)**

## ⚠️ Important Notes

1. **Socket.io Limitation**: Vercel serverless functions don't support WebSocket connections. Real-time features won't work in this deployment.

2. **Database Migrations**: Must be run manually before first deployment and after schema changes.

3. **Environment Variables**: Changes to environment variables require a redeploy to take effect.

4. **Cold Starts**: First request after inactivity may be slow (serverless function cold start).

## 🆘 Troubleshooting

| Issue | Solution |
|-------|----------|
| API returns 404 | Check routes start with `/api/` |
| CORS errors | Update `CORS_ORIGIN` with Vercel URL |
| Database errors | Verify `DATABASE_URL` and run migrations |
| Build fails | Check build logs in Vercel dashboard |
| Prisma errors | Ensure `postinstall` script runs `prisma generate` |

## 📞 Need Help?

- Read the [Full Deployment Guide](VERCEL_DEPLOYMENT.md)
- Check [Vercel Documentation](https://vercel.com/docs)
- Open an issue on GitHub

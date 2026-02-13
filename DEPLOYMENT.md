# Deployment Guide

This guide will help you deploy the GTM Email Enrichment Tool to production.

## Architecture

- **Frontend**: Vercel (React/Vite app)
- **Backend**: Railway (Node.js/Express API)

## Prerequisites

- GitHub account
- Vercel account (sign up at https://vercel.com)
- Railway account (sign up at https://railway.app)
- Your API keys for Prospeo and Icypeas

---

## Part 1: Deploy Backend to Railway

### Step 1: Push to GitHub

First, initialize git and push your code to GitHub:

```bash
cd /Users/lohitboruah/GTM

# Initialize git if not already done
git init
git add .
git commit -m "Initial commit - GTM Email Enrichment Tool"

# Create a new repository on GitHub, then:
git remote add origin https://github.com/YOUR_USERNAME/gtm-enrichment.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Railway

1. Go to https://railway.app
2. Click **"New Project"**
3. Select **"Deploy from GitHub repo"**
4. Choose your `gtm-enrichment` repository
5. Railway will detect it's a Node.js app and deploy automatically

### Step 3: Configure Backend Environment Variables

In Railway project settings, add these environment variables:

```
NODE_ENV=production
PORT=5001
CORS_ORIGIN=https://your-app.vercel.app
PROSPEO_API_KEY=pk_2de24175dee68027e7739a7f5e6a408278f260e091e5fb7c3cf95c10c6a16525
PROSPEO_API_URL=https://api.prospeo.io
ICYPEAS_API_KEY=b22c2d99b17244909fc22ea075633546a86497b28be0447188126b21d9cedcea
ICYPEAS_API_URL=https://api.icypeas.com
MAX_FILE_SIZE_MB=10
MAX_ROWS=1000
UPLOAD_DIR=./uploads
```

**Note**: Update `CORS_ORIGIN` after you deploy the frontend (Step 5).

### Step 4: Get Railway Backend URL

After deployment, Railway will provide a URL like:
```
https://gtm-enrichment-production.up.railway.app
```

Copy this URL - you'll need it for the frontend configuration.

---

## Part 2: Deploy Frontend to Vercel

### Step 1: Update Frontend Environment Variables

Update `client/.env` with your Railway backend URL:

```bash
cd client
nano .env  # or use any text editor
```

Change to:
```
VITE_API_URL=https://your-backend.railway.app/api
VITE_POLLING_INTERVAL_MS=2000
```

Commit this change:
```bash
git add client/.env
git commit -m "Update API URL for production"
git push
```

### Step 2: Deploy to Vercel

1. Go to https://vercel.com
2. Click **"Add New Project"**
3. Import your GitHub repository
4. Vercel will detect it's a monorepo
5. Configure the project:
   - **Framework Preset**: Vite
   - **Root Directory**: `client`
   - **Build Command**: `npm run build`
   - **Output Directory**: `dist`

6. Add Environment Variables in Vercel:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_POLLING_INTERVAL_MS=2000
   ```

7. Click **"Deploy"**

### Step 3: Update Backend CORS

After Vercel deployment, you'll get a URL like:
```
https://gtm-enrichment.vercel.app
```

Go back to Railway and update the `CORS_ORIGIN` environment variable:
```
CORS_ORIGIN=https://gtm-enrichment.vercel.app
```

Railway will automatically redeploy with the new settings.

---

## Verification

### Test Backend
Visit: `https://your-backend.railway.app/api/health`

You should see:
```json
{"status":"ok","timestamp":"2024-..."}
```

### Test Frontend
Visit: `https://your-app.vercel.app`

You should see the GTM Email Enrichment Tool interface.

---

## Alternative: Deploy Both to Vercel (Serverless)

If you prefer to deploy everything to Vercel, you can convert the backend to serverless functions. However, this requires significant refactoring of the Express app.

**Pros**: Single platform, simpler deployment
**Cons**: Cold starts, file upload limitations, requires code changes

For this app, we recommend the Railway + Vercel split approach.

---

## Troubleshooting

### CORS Errors
- Ensure `CORS_ORIGIN` in Railway matches your Vercel URL exactly
- Include protocol (`https://`) in the URL
- No trailing slash

### API Connection Failed
- Check that `VITE_API_URL` in Vercel points to Railway URL
- Verify Railway backend is running (check logs)
- Test the `/api/health` endpoint

### File Upload Fails
- Railway ephemeral storage: files uploaded are temporary
- For production, consider using S3 or similar for uploads
- Or keep files in memory if they're small and processed immediately

### Environment Variables Not Working
- Rebuild/redeploy after changing environment variables
- Ensure variables are set in the correct service (Railway vs Vercel)
- Check for typos in variable names

---

## Monitoring

### Railway
- View logs: Railway Dashboard → Your Project → Logs
- Monitor usage: Dashboard → Metrics

### Vercel
- View deployments: Vercel Dashboard → Your Project → Deployments
- Check logs: Select deployment → View Function Logs

---

## Cost Estimates

### Railway Free Tier
- $5 free credit per month
- After that: ~$5-10/month for small apps

### Vercel Free Tier
- 100 GB bandwidth/month
- Unlimited deployments
- Should be sufficient for most use cases

---

## Production Considerations

### Security
- ✅ API keys stored in environment variables (not in code)
- ✅ CORS configured properly
- ✅ File upload validation in place
- ⚠️ Consider adding rate limiting to API endpoints
- ⚠️ Add authentication if needed for production use

### File Storage
- Current: Ephemeral storage (files deleted on restart)
- Recommended for production: AWS S3, Cloudinary, or similar
- Update `csvService.ts` to use cloud storage

### Database
- Current: In-memory job storage
- Recommended for production: PostgreSQL or MongoDB
- Prevents data loss on server restart

### Email Validation
- Monitor API usage to avoid exceeding limits
- Consider implementing caching for previously validated emails
- Add retry logic with exponential backoff

---

## Need Help?

- **Railway Docs**: https://docs.railway.app
- **Vercel Docs**: https://vercel.com/docs
- **Issues**: Check GitHub repository issues

---

## Quick Deploy Script

Save time with this automated deploy script:

```bash
#!/bin/bash

echo "🚀 Deploying GTM Email Enrichment Tool"

# Deploy backend
echo "📦 Deploying backend to Railway..."
cd server
railway up
cd ..

# Deploy frontend
echo "📦 Deploying frontend to Vercel..."
cd client
vercel --prod
cd ..

echo "✅ Deployment complete!"
```

Make it executable:
```bash
chmod +x deploy.sh
./deploy.sh
```

---

**Last Updated**: February 2024

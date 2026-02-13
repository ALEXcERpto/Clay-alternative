# Quick Deployment Guide

Deploy your GTM Email Enrichment Tool in 3 steps!

## 🚀 Step 1: Push to GitHub

```bash
cd /Users/lohitboruah/GTM

# Initialize git (if not already done)
git init
git add .
git commit -m "Initial commit: GTM Email Enrichment Tool"

# Create a new repository on GitHub at https://github.com/new
# Then connect and push:
git remote add origin https://github.com/YOUR_USERNAME/gtm-enrichment.git
git branch -M main
git push -u origin main
```

## 🚂 Step 2: Deploy Backend to Railway

1. Go to **https://railway.app** and sign up/login
2. Click **"New Project"** → **"Deploy from GitHub repo"**
3. Select your `gtm-enrichment` repository
4. Railway will auto-detect Node.js and deploy

5. **Add Environment Variables** in Railway:
   - Click on your service → **Variables** tab
   - Add these variables:

   ```
   NODE_ENV=production
   CORS_ORIGIN=https://your-app.vercel.app
   PROSPEO_API_KEY=pk_2de24175dee68027e7739a7f5e6a408278f260e091e5fb7c3cf95c10c6a16525
   PROSPEO_API_URL=https://api.prospeo.io
   ICYPEAS_API_KEY=b22c2d99b17244909fc22ea075633546a86497b28be0447188126b21d9cedcea
   ICYPEAS_API_URL=https://api.icypeas.com
   MAX_FILE_SIZE_MB=10
   MAX_ROWS=1000
   UPLOAD_DIR=./uploads
   ```

6. **Get your Railway URL** (looks like `https://gtm-enrichment-production.up.railway.app`)

## ☁️ Step 3: Deploy Frontend to Vercel

1. Go to **https://vercel.com** and sign up/login
2. Click **"Add New Project"**
3. Import your GitHub repository
4. **Configure Project**:
   - Framework Preset: **Vite**
   - Root Directory: **`client`** ← Important!
   - Build Command: `npm run build`
   - Output Directory: `dist`

5. **Add Environment Variables**:
   ```
   VITE_API_URL=https://your-backend.railway.app/api
   VITE_POLLING_INTERVAL_MS=2000
   ```

   Replace `your-backend.railway.app` with your actual Railway URL from Step 2.

6. Click **Deploy**

7. **Update CORS** - After Vercel gives you a URL (like `https://gtm-enrichment.vercel.app`):
   - Go back to Railway
   - Update `CORS_ORIGIN` variable to your Vercel URL
   - Railway will auto-redeploy

## ✅ Done!

Your app is live!

- **Frontend**: https://your-app.vercel.app
- **Backend**: https://your-backend.railway.app

## 🧪 Test It

1. Visit your Vercel URL
2. Upload a CSV file
3. Map columns
4. Start validation
5. Export results

---

## 📝 Important Notes

### Update Backend URL
After deploying to Railway, update your local `.env` and commit:

```bash
cd client
# Edit .env to use Railway URL
echo "VITE_API_URL=https://your-backend.railway.app/api" > .env
echo "VITE_POLLING_INTERVAL_MS=2000" >> .env

git add .env
git commit -m "Update API URL for production"
git push
```

Then redeploy on Vercel (it will auto-deploy from the git push).

### Security Note
Your API keys are now stored securely in Railway's environment variables and never committed to git.

---

## 🆘 Troubleshooting

**Can't connect to API?**
- Check that `VITE_API_URL` in Vercel matches your Railway URL
- Verify `CORS_ORIGIN` in Railway matches your Vercel URL exactly

**Backend not starting?**
- Check Railway logs for errors
- Ensure all environment variables are set

**Need help?**
- Check the detailed [DEPLOYMENT.md](./DEPLOYMENT.md) guide
- View Railway logs: Railway Dashboard → Logs
- View Vercel logs: Vercel Dashboard → Deployments → Select deployment

---

**Estimated Time**: 15-20 minutes
**Cost**: Free tier available on both platforms!

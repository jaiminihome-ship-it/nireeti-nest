# 🏠 The Nireeti Nest - EASY Deployment Guide

## 🚀 Only 3 Steps - Super Simple!

---

## STEP 1: GitHub Upload (5 minutes)

1. **Download** ZIP file: `nireeti-nest-final.zip`
2. **Extract** ZIP file
3. Go to: **https://github.com/new**
4. Repository name: `nireeti-nest`
5. Click: **Create repository**
6. Click: **"uploading an existing file"**
7. **Drag & drop** all extracted files
8. Click: **Commit changes**

✅ Done! Code is on GitHub.

---

## STEP 2: Railway Deploy (3 minutes)

1. Go to: **https://railway.app**
2. Click: **"Login with GitHub"**
3. Click: **"New Project"**
4. Click: **"Deploy from GitHub repo"**
5. Select: `nireeti-nest` repository
6. Click: **"Deploy Now"**

✅ Railway will automatically:
- Install dependencies
- Setup database
- Deploy your website

---

## STEP 3: Add Environment Variables (2 minutes)

In Railway Dashboard:

1. Click your project
2. Click **"Variables"** tab
3. Click **"Raw Editor"**
4. Paste this:

```
NEXTAUTH_SECRET=nireeti-nest-secret-key-2024

EMAIL_HOST=smtp.zoho.com
EMAIL_PORT=587
EMAIL_USER=support@thenireetinest.com
EMAIL_PASSWORD=YOUR_ZOHO_PASSWORD_HERE

NEXT_PUBLIC_SITE_URL=https://nireeti-nest.up.railway.app
```

5. Click **"Update Variables"**
6. Railway will auto-redeploy

---

## 🎉 Done! Your Website is LIVE!

Railway will give you a URL like:
`https://nireeti-nest-production.up.railway.app`

---

## 📱 First Time Setup

1. Open your website
2. Go to: `/auth/register`
3. Create your account
4. **You are now the ADMIN!** 👑

---

## 🌐 Custom Domain (Optional)

1. Railway Dashboard → Settings → Domains
2. Add your domain
3. Update DNS records as shown

---

## ❓ Need Help?

- Railway logs check karo: Dashboard → Deployments → Logs
- Environment variables sahi dalo
- Zoho password sahi dalo

---

## ✅ Checklist

- [ ] GitHub account hai
- [ ] Repository create kiya
- [ ] Files upload kiye
- [ ] Railway account banaya
- [ ] Project deploy kiya
- [ ] Variables add kiye
- [ ] Website khul gayi! 🎉

---

Made with ❤️ for The Nireeti Nest

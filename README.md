# 🏠 The Nireeti Nest - eCommerce Website

A beautiful, fully-functional eCommerce website for home decor products built with Next.js 15, Prisma, and Tailwind CSS.

---

## 🚀 Quick Deployment Guide (FREE Hosting)

### Is Tutorial Ko Follow Karein - Step by Step

---

## STEP 1: Supabase Account Banao (FREE Database)

### 1.1 Supabase Website Kholo
- Jao: **https://supabase.com**
- Click karo: **"Start your project"**
- **GitHub se Sign Up** karo (sabse easy)

### 1.2 Naya Project Banao
- **Organization** select karo (ya new banao)
- **Project Name**: `nireeti-nest`
- **Database Password**: Koi bhi strong password dalo (yeh yaad rakho!)
- **Region**: `Southeast Asia (Singapore)` select karo
- Click karo: **"Create new project"**
- Wait karo 2-3 minutes (project setup hota hai)

### 1.3 Database Connection Details Copy Karo
- Left side mein **"Settings"** (gear icon) click karo
- **"Database"** click karo
- **"Connection string"** section mein:
  - **"URI"** copy karo (yeh DATABASE_URL hai)
  - **"JDBC"** se bhi copy kar sakte ho

Example:
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres
```

### 1.4 Direct Connection URL (Important!)
- Same page pe **"Connection string"** → **"JDBC"** ya **"ODBC"** section
- ya fir direct URL banao:
```
postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres
```

**Note:** 
- `6543` port → Connection Pooler (DATABASE_URL)
- `5432` port → Direct Connection (DIRECT_DATABASE_URL)

---

## STEP 2: GitHub Repository Setup

### 2.1 GitHub Login
- Jao: **https://github.com**
- Login karo ya Sign Up karo

### 2.2 New Repository Banao
- Top right mein **"+"** click karo → **"New repository"**
- **Repository name**: `nireeti-nest`
- **Description**: `The Nireeti Nest - Home Decor eCommerce`
- **Public** select karo (FREE hosting ke liye)
- **"Create repository"** click karo

### 2.3 Repository URL Note Karo
- URL kuch aisa hoga: `https://github.com/YOUR_USERNAME/nireeti-nest`

---

## STEP 3: Vercel Deployment (FREE Hosting)

### 3.1 Vercel Account Banao
- Jao: **https://vercel.com**
- **"Sign Up"** click karo
- **"Continue with GitHub"** select karo
- GitHub account authorize karo

### 3.2 New Project Import Karo
- **"Add New..."** → **"Project"** click karo
- **"Import Git Repository"** section mein
- Apna GitHub repository `nireeti-nest` find karo
- **"Import"** click karo

### 3.3 Environment Variables Add Karo
- **"Environment Variables"** section expand karo
- Yeh variables add karo:

```
DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:6543/postgres?pgbouncer=true&connection_limit=1

DIRECT_DATABASE_URL=postgresql://postgres.xxxxx:PASSWORD@aws-0-ap-southeast-1.pooler.supabase.com:5432/postgres

NEXTAUTH_SECRET=nireeti-nest-super-secret-key-2024-production

EMAIL_HOST=smtp.zoho.com

EMAIL_PORT=587

EMAIL_SECURE=false

EMAIL_USER=support@thenireetinest.com

EMAIL_PASSWORD=YOUR_ZOHO_PASSWORD

EMAIL_FROM=The Nireeti Nest <support@thenireetinest.com>

NEXT_PUBLIC_SITE_URL=https://your-site.vercel.app
```

### 3.4 Deploy Karo
- **"Deploy"** button click karo
- Wait karo 3-5 minutes
- **"Congratulations!"** screen aayega
- Website URL milega: `https://nireeti-nest-xyz.vercel.app`

---

## STEP 4: Database Setup

### 4.1 Supabase SQL Editor Kholo
- Supabase Dashboard mein jao
- Left side mein **"SQL Editor"** click karo
- **"New query"** click karo

### 4.2 Schema Paste Karo
- `prisma/schema.postgres.prisma` file ka content copy karo
- ya fir Prisma migration run karo

### 4.3 Alternative: Prisma Push
- Local machine pe:
```bash
npx prisma db push
```

---

## STEP 5: Custom Domain (Optional)

### 5.1 Vercel Mein Domain Add Karo
- Vercel Dashboard → Project → **"Settings"** → **"Domains"**
- Apna custom domain add karo
- DNS records update karo (instructions milenge)

---

## 📁 Project Structure

```
├── src/
│   ├── app/              # Next.js pages
│   │   ├── admin/        # Admin panel
│   │   ├── api/          # API routes
│   │   ├── auth/         # Authentication
│   │   ├── shop/         # Shop pages
│   │   └── ...
│   ├── components/       # React components
│   ├── lib/              # Utilities
│   └── store/            # State management
├── prisma/               # Database schema
├── public/               # Static files
└── .env                  # Environment variables
```

---

## 🔐 Admin Access

- **First registered user becomes Admin automatically!**
- Go to `/auth/register` and create your admin account
- Then access admin panel at `/admin`

---

## 📧 Email Setup (Zoho Mail)

Your Zoho Mail credentials needed for:
- ✅ OTP verification emails
- ✅ Contact form notifications
- ✅ Password reset emails
- ✅ Order confirmations

---

## 🛠️ Local Development

```bash
# Install dependencies
npm install

# Setup database
npx prisma generate
npx prisma db push

# Start development server
npm run dev

# Open http://localhost:3000
```

---

## 🆘 Help & Support

Agar koi problem aaye:
1. Vercel deployment logs check karo
2. Supabase logs check karo
3. Environment variables verify karo

---

## 📋 Checklist Before Deploy

- [ ] Supabase project created
- [ ] Database URLs copied
- [ ] GitHub repository created
- [ ] Vercel account created
- [ ] Environment variables added
- [ ] Zoho Mail password added
- [ ] Deployed successfully!

---

Made with ❤️ for The Nireeti Nest

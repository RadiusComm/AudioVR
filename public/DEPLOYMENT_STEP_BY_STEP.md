# 🚀 AudioVR Web Application - Complete Deployment Guide

This guide provides step-by-step instructions to deploy your AudioVR application from development to production using Vercel and Supabase.

## 📋 Prerequisites Checklist

Before starting, ensure you have:
- [ ] Node.js 18+ installed
- [ ] npm or yarn package manager
- [ ] Git installed and configured
- [ ] GitHub account
- [ ] Internet connection

## 📅 Deployment Timeline

**Estimated Total Time: 30-45 minutes**
- Supabase Setup: 15 minutes
- Vercel Setup: 10 minutes
- Environment Configuration: 10 minutes
- Final Deployment: 10 minutes

---

## 🗄️ PART 1: Supabase Backend Setup (15 minutes)

### Step 1.1: Create Supabase Account & Project (5 minutes)

1. **Go to Supabase Dashboard**
   ```
   Open browser: https://app.supabase.com
   ```

2. **Sign Up or Sign In**
   - Click "Start your project"
   - Sign up with GitHub (recommended) or email
   - Verify your email if required

3. **Create New Project**
   ```
   Click "New Project" button
   
   Organization: Select your organization
   Project Name: audiovr-web
   Database Password: [Generate Strong Password - SAVE THIS!]
   Region: Choose closest to your users (e.g., US East, Europe West)
   Pricing Plan: Free tier (sufficient for development)
   
   Click "Create new project"
   ```

4. **Wait for Project Creation**
   - This takes 2-3 minutes
   - You'll see "Setting up your project..." message
   - ☕ Perfect time for coffee!

### Step 1.2: Install Supabase CLI (2 minutes)

```bash
# Install Supabase CLI globally
npm install -g supabase

# Verify installation
supabase --version
# Should show: supabase 1.x.x
```

### Step 1.3: Configure Local Project (3 minutes)

```bash
# Navigate to your project
cd /home/user/webapp

# Login to Supabase
supabase login
# Opens browser - authorize the CLI application

# Link your project to Supabase
supabase link --project-ref YOUR_PROJECT_REF
```

**To find YOUR_PROJECT_REF:**
1. Go to Supabase Dashboard → Your Project
2. Click "Settings" → "General"
3. Copy the "Reference ID" (looks like: `abcdefghijklmnop`)

### Step 1.4: Deploy Database Schema (5 minutes)

```bash
# Push your database schema to Supabase
cd /home/user/webapp && supabase db push

# Expected output:
# Linking to remote database...
# Applying migration 001_initial_schema.sql...
# Finished supabase db push.

# Generate TypeScript types
cd /home/user/webapp && npm run supabase:generate-types

# Seed database with sample data
cd /home/user/webapp && supabase db reset --linked
```

**✅ Verification Step:**
```bash
# Check database status
cd /home/user/webapp && supabase status

# You should see:
# API URL: https://your-ref.supabase.co
# DB URL: postgresql://...
# Status: All services running
```

---

## 🌐 PART 2: Vercel Frontend Setup (10 minutes)

### Step 2.1: Create Vercel Account (2 minutes)

1. **Go to Vercel**
   ```
   Open browser: https://vercel.com
   ```

2. **Sign Up with GitHub**
   - Click "Continue with GitHub"
   - Authorize Vercel application
   - Choose personal account (not team for free tier)

### Step 2.2: Install Vercel CLI (1 minute)

```bash
# Install Vercel CLI globally
npm install -g vercel

# Verify installation
vercel --version
# Should show: Vercel CLI 32.x.x

# Login to Vercel
vercel login
# Follow prompts to authenticate
```

### Step 2.3: Connect GitHub Repository (3 minutes)

```bash
# Initialize git if not already done
cd /home/user/webapp && git init
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "Initial commit with Vercel/Supabase setup"

# Create GitHub repository (if you haven't already)
# Go to https://github.com/new
# Repository name: audiovr-web
# Description: Voice-driven detective mystery platform
# Public or Private: Your choice
# Don't initialize with README (we have files already)

# Add remote origin
cd /home/user/webapp && git remote add origin https://github.com/YOUR_USERNAME/audiovr-web.git

# Push to GitHub
cd /home/user/webapp && git branch -M main
cd /home/user/webapp && git push -u origin main
```

### Step 2.4: Link Vercel Project (4 minutes)

```bash
# Link project to Vercel
cd /home/user/webapp && vercel

# Follow the prompts:
? Set up and deploy "~/webapp"? [Y/n] Y
? Which scope do you want to deploy to? [Your Account]
? Link to existing project? [y/N] N
? What's your project's name? audiovr-web
? In which directory is your code located? ./

# Vercel will:
# 1. Create the project
# 2. Build your app
# 3. Deploy to a preview URL
# 4. Give you deployment URLs
```

**✅ You should see:**
```
🔗  Linked to your-username/audiovr-web (created .vercel and added it to .gitignore)
🔍  Inspect: https://vercel.com/your-username/audiovr-web/...
✅  Preview: https://audiovr-web-xxxxx.vercel.app
```

---

## 🔧 PART 3: Environment Configuration (10 minutes)

### Step 3.1: Collect Supabase Credentials (3 minutes)

1. **Go to Supabase Dashboard**
   - Navigate to your project
   - Click "Settings" → "API"

2. **Copy These Values:**
   ```
   Project URL: https://your-ref.supabase.co
   anon public key: eyJhbGciOiJIUzI1NiIs... (long string)
   service_role secret: eyJhbGciOiJIUzI1NiIs... (different long string)
   ```

### Step 3.2: Set Vercel Environment Variables (4 minutes)

```bash
# Set Supabase environment variables
cd /home/user/webapp && vercel env add NEXT_PUBLIC_SUPABASE_URL
# Paste: https://your-ref.supabase.co

cd /home/user/webapp && vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# Paste: your anon public key

cd /home/user/webapp && vercel env add SUPABASE_SERVICE_ROLE_KEY
# Paste: your service_role secret key

# Optional: Add API keys for third-party services
cd /home/user/webapp && vercel env add ELEVENLABS_API_KEY
# Enter your ElevenLabs API key (or press Enter to skip)

cd /home/user/webapp && vercel env add OPENAI_API_KEY
# Enter your OpenAI API key (or press Enter to skip)
```

**For each variable, choose:**
```
? What's the value of VARIABLE_NAME? [paste your value]
? Add VARIABLE_NAME to which Environments? Production, Preview, Development
```

### Step 3.3: Create Local Environment File (2 minutes)

```bash
# Copy environment template
cd /home/user/webapp && cp .env.example .env.local

# Edit the file with your actual values
cd /home/user/webapp && nano .env.local
```

**Update `.env.local` with your values:**
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=https://your-ref.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIs...
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...

# API Keys (optional for now)
ELEVENLABS_API_KEY=your-elevenlabs-key
OPENAI_API_KEY=your-openai-key

# Other settings
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-random-secret-string
```

Save and exit (Ctrl+X, then Y, then Enter)

### Step 3.4: Verify Local Setup (1 minute)

```bash
# Test local development
cd /home/user/webapp && npm run dev

# Open browser to http://localhost:3000
# You should see your AudioVR application running
# Press Ctrl+C to stop the dev server
```

---

## 🚀 PART 4: Production Deployment (10 minutes)

### Step 4.1: Build and Test (3 minutes)

```bash
# Clean any previous builds
cd /home/user/webapp && npm run clean

# Install dependencies (if needed)
cd /home/user/webapp && npm install

# Build for production
cd /home/user/webapp && npm run build

# Expected output:
# ✓ Creating an optimized production build
# ✓ Compiled successfully
```

**✅ Verification:**
- Build should complete without errors
- You should see "Compiled successfully" message

### Step 4.2: Deploy to Production (4 minutes)

```bash
# Deploy to production using our automated script
cd /home/user/webapp && chmod +x scripts/deploy-full.sh
cd /home/user/webapp && ./scripts/deploy-full.sh
```

**OR manually:**
```bash
# Push latest changes to GitHub
cd /home/user/webapp && git add .
cd /home/user/webapp && git commit -m "Add Vercel and Supabase configuration"
cd /home/user/webapp && git push origin main

# Deploy to Vercel production
cd /home/user/webapp && vercel --prod
```

### Step 4.3: Configure Supabase Authentication (2 minutes)

1. **Update Supabase Auth Settings**
   - Go to Supabase Dashboard → Authentication → Settings
   - **Site URL:** `https://your-app.vercel.app`
   - **Additional Redirect URLs:** 
     ```
     https://your-app.vercel.app/**
     http://localhost:3000/**
     ```

2. **Enable Auth Providers** (optional)
   - Go to Authentication → Providers
   - Enable desired providers (Email is enabled by default)
   - Configure OAuth if needed (Google, GitHub, etc.)

### Step 4.4: Final Verification (1 minute)

**Test Production Deployment:**
1. Open your production URL: `https://your-app.vercel.app`
2. Verify the app loads correctly
3. Test user registration/login
4. Check browser console for errors
5. Test API endpoints: `https://your-app.vercel.app/api/mysteries`

---

## ✅ DEPLOYMENT SUCCESS CHECKLIST

### 🎯 Frontend (Vercel)
- [ ] Application loads at production URL
- [ ] All pages render without errors
- [ ] Static assets (images, CSS) load correctly
- [ ] API routes respond correctly
- [ ] No console errors in browser

### 🗄️ Backend (Supabase)
- [ ] Database connection working
- [ ] User authentication functional
- [ ] API endpoints return data
- [ ] Real-time features working (if applicable)
- [ ] File uploads work (if applicable)

### 🔐 Security & Configuration
- [ ] Environment variables set correctly
- [ ] HTTPS enabled (automatic with Vercel)
- [ ] CORS configured properly
- [ ] Authentication redirects working
- [ ] Database Row Level Security enabled

---

## 🚨 Troubleshooting Common Issues

### Issue: Build Fails with Type Errors
```bash
# Regenerate Supabase types
cd /home/user/webapp && npm run supabase:generate-types
cd /home/user/webapp && npm run type-check
cd /home/user/webapp && npm run build
```

### Issue: Environment Variables Not Working
```bash
# Pull latest environment variables from Vercel
cd /home/user/webapp && vercel env pull .env.local

# Verify variables are set
cd /home/user/webapp && vercel env ls
```

### Issue: Database Connection Errors
1. Check Supabase project status in dashboard
2. Verify API URL and keys are correct
3. Check if project is paused (free tier limitation)
4. Restart Supabase project if needed

### Issue: Authentication Not Working
1. Verify Site URL in Supabase Auth settings
2. Check redirect URLs include production domain
3. Test with incognito/private browser window
4. Check browser console for CORS errors

### Issue: Vercel Deployment Fails
```bash
# Check deployment logs
cd /home/user/webapp && vercel logs

# Redeploy with verbose output
cd /home/user/webapp && vercel --prod --debug
```

---

## 🎉 Post-Deployment Tasks

### 1. Custom Domain (Optional)
```bash
# Add custom domain in Vercel dashboard
# Or via CLI:
cd /home/user/webapp && vercel domains add yourdomain.com
```

### 2. Set up Monitoring
- **Vercel Analytics**: Enable in Vercel dashboard
- **Supabase Monitoring**: Set up alerts in Supabase dashboard
- **Error Tracking**: Consider Sentry integration

### 3. Performance Optimization
- **Lighthouse Audit**: Run in Chrome DevTools
- **Core Web Vitals**: Monitor in Vercel Analytics
- **Database Optimization**: Add indexes for frequent queries

### 4. Backup & Recovery
```bash
# Backup database schema
cd /home/user/webapp && supabase db dump --schema-only > backup-schema.sql

# Backup database data
cd /home/user/webapp && supabase db dump --data-only > backup-data.sql
```

---

## 📞 Support & Resources

### Documentation
- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)

### Community Support
- [Vercel Community](https://github.com/vercel/vercel/discussions)
- [Supabase Discord](https://discord.supabase.com)
- [Next.js GitHub](https://github.com/vercel/next.js)

### Project-Specific Help
- Create issues in your GitHub repository
- Check deployment logs in Vercel dashboard
- Monitor database logs in Supabase dashboard

---

## 🎯 Quick Reference Commands

```bash
# Development
npm run dev                          # Start local development
npm run supabase:start              # Start local Supabase
npm run db:fresh                    # Reset local database

# Building & Testing
npm run build                       # Build for production
npm run type-check                  # Check TypeScript types
npm run lint                        # Check code quality

# Deployment
./scripts/deploy-full.sh            # Full automated deployment
vercel --prod                       # Deploy to Vercel production
supabase db push                    # Deploy database changes

# Environment
vercel env pull .env.local          # Pull environment variables
vercel env ls                       # List environment variables
supabase status                     # Check Supabase connection
```

---

**🎊 Congratulations! Your AudioVR application is now live and ready for users!**

Your app is accessible at: `https://your-app.vercel.app`

Remember to:
1. Monitor your application regularly
2. Keep dependencies updated
3. Back up your database periodically
4. Monitor usage limits on free tiers
5. Scale resources as your user base grows
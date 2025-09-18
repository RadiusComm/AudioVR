# 🗄️ AudioVR Supabase Setup Guide

## ✅ **Your Supabase Project Detected**

**Project Reference**: `flcoiwqwgsgwbbipstgt`  
**Project URL**: `https://flcoiwqwgsgwbbipstgt.supabase.co`  
**Status**: ✅ **Connection Verified**

---

## 📋 **What You Need to Complete Setup**

### **1. Get Your Service Role Key** 🔑

You provided the **anonymous key**, but you also need the **service role key** for full functionality:

1. **Go to Supabase Dashboard**: https://app.supabase.com/project/flcoiwqwgsgwbbipstgt
2. **Navigate**: Settings → API
3. **Copy the `service_role` secret key** (starts with `eyJhbGciOiJIUzI1NiIs...`)

⚠️ **Important**: Keep this key secret! Only use server-side.

### **2. Complete Environment Setup**

Your current `.env.local` is partially configured. Add your service role key:

```bash
# Edit your .env.local file
nano .env.local

# Add this line (replace with your actual service_role key):
SUPABASE_SERVICE_ROLE_KEY=eyJhbGciOiJIUzI1NiIs...your-service-role-key
```

---

## 🚀 **Quick Deployment Options**

### **Option 1: Skip Database Setup (Use Existing)**
If you already have data in your Supabase project:

```bash
# Just deploy to Vercel with current environment
cd /home/user/webapp
vercel --prod
```

### **Option 2: Deploy AudioVR Schema**
If you want to use AudioVR's database schema:

```bash
# Link to your Supabase project
cd /home/user/webapp
npx supabase link --project-ref flcoiwqwgsgwbbipstgt

# Deploy our AudioVR schema
npx supabase db push

# Generate TypeScript types
npm run supabase:generate-types
```

### **Option 3: Full Automated Setup**
Complete automated deployment:

```bash
# Run our setup script (will prompt for service role key)
cd /home/user/webapp
./scripts/setup-environment.sh

# Deploy everything
./scripts/deploy-full.sh
```

---

## 📊 **AudioVR Database Schema Preview**

Our schema includes tables for:

- **`user_profiles`** - User accounts and accessibility preferences
- **`mysteries`** - Detective mystery cases and metadata  
- **`worlds`** - Game world environments and settings
- **`mystery_elements`** - Scenes, evidence, characters, clues
- **`player_progress`** - Save game state and progress tracking
- **`analytics_events`** - User interaction and accessibility analytics
- **`creator_analytics`** - Content creator dashboard metrics

### **Sample Data Included**
- 🏠 2 complete game worlds (Victorian London, Modern Office)
- 🕵️ 2 full mystery cases with multi-chapter storylines  
- 👤 Test user account with accessibility preferences
- 📊 Sample analytics data for dashboard testing

---

## 🔧 **Vercel Environment Variables**

You'll need to set these in your Vercel project:

```bash
# Required for production deployment
NEXT_PUBLIC_SUPABASE_URL=https://flcoiwqwgsgwbbipstgt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY29pd3F3Z3Nnd2JiaXBzdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTI1MDksImV4cCI6MjA3MzQ2ODUwOX0.NvR8Y5Kcck5oRhHSywzTMsPnyTI8YhB-vU8Cvo2ko00
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
```

**Add these via Vercel CLI:**
```bash
# Set environment variables (you'll be prompted to enter values)
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

---

## 🎯 **Next Steps - Choose Your Path**

### **Path A: Quick Deploy (5 minutes)**
If you just want to get AudioVR running with your Supabase:

```bash
# 1. Get your service role key from Supabase dashboard
# 2. Add it to .env.local file
# 3. Deploy to Vercel
cd /home/user/webapp && vercel --prod
```

### **Path B: Complete Setup (15 minutes)**  
If you want the full AudioVR database and features:

```bash
# 1. Run automated setup
cd /home/user/webapp && ./scripts/setup-environment.sh

# 2. Deploy database schema  
npx supabase link --project-ref flcoiwqwgsgwbbipstgt
npx supabase db push

# 3. Deploy to production
./scripts/deploy-full.sh
```

### **Path C: Manual Configuration (30 minutes)**
If you prefer step-by-step control:

1. **Follow our complete guide**: [DEPLOYMENT_STEP_BY_STEP.md](/DEPLOYMENT_STEP_BY_STEP.md)
2. **Use your Supabase credentials** provided above
3. **Configure each service** manually with full control

---

## 🔍 **Current Status Check**

✅ **Supabase Project**: Connected and verified  
✅ **Anonymous Key**: Working  
⏳ **Service Role Key**: Needed from you  
✅ **Local Environment**: Partially configured  
⏳ **Database Schema**: Ready to deploy (optional)  
⏳ **Vercel Deployment**: Ready when you are  

---

## 🆘 **Need Help?**

### **Supabase Dashboard Access**
- **Your Project**: https://app.supabase.com/project/flcoiwqwgsgwbbipstgt
- **API Settings**: https://app.supabase.com/project/flcoiwqwgsgwbbipstgt/settings/api
- **Database Editor**: https://app.supabase.com/project/flcoiwqwgsgwbbipstgt/editor

### **Documentation**
- **Complete Setup Guide**: [DEPLOYMENT_STEP_BY_STEP.md](/DEPLOYMENT_STEP_BY_STEP.md)
- **Quick Reference**: [QUICK_DEPLOYMENT_REFERENCE.md](/QUICK_DEPLOYMENT_REFERENCE.md)
- **Troubleshooting**: [DEPLOYMENT_CHECKLIST.md](/DEPLOYMENT_CHECKLIST.md)

**🚀 You're 90% there! Just get that service role key and you can deploy AudioVR in minutes!**
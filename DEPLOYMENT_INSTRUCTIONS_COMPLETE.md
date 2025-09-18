# AudioVR Complete Deployment Instructions

This guide provides step-by-step instructions for deploying AudioVR on both **Vercel + Supabase** (recommended) and **Cloudflare Pages + D1** platforms.

## 🎯 Quick Decision Guide

### Choose Vercel + Supabase if:
- ✅ You want the **easiest setup** with modern tooling
- ✅ You need **PostgreSQL** with advanced queries and relations
- ✅ You want **real-time features** (live analytics, chat)
- ✅ You prefer **generous free tiers** and predictable pricing
- ✅ You want **better developer experience** and documentation

### Choose Cloudflare if:
- ✅ You need **global edge performance** (sub-100ms latency)
- ✅ You prefer **SQLite** for simpler data models
- ✅ You want **unlimited bandwidth** on free tier
- ✅ You're already using Cloudflare services

---

## 🚀 Option A: Vercel + Supabase (Recommended)

### Prerequisites
- GitHub account
- Vercel account (free)
- Supabase account (free)
- Node.js 18+ installed locally

### Step 1: Set Up Supabase Database

1. **Create Supabase Project**
   ```bash
   # Go to https://app.supabase.com
   # Click "New Project"
   # Choose your organization
   # Fill in project details:
   ```
   - **Name**: `audiovr-production`
   - **Database Password**: Generate secure password
   - **Region**: Choose closest to your users
   - **Pricing**: Start with Free tier

2. **Get Supabase Credentials**
   ```bash
   # In Supabase Dashboard:
   # Go to Settings → API
   # Copy these values:
   ```
   - **Project URL**: `https://your-project-id.supabase.co`
   - **Anon Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
   - **Service Role Key**: `eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...` (keep secret!)

3. **Set Up Database Schema**
   ```bash
   # Install Supabase CLI
   npm install -g supabase
   
   # Navigate to AudioVR project
   cd /home/user/webapp
   
   # Initialize Supabase
   supabase init
   
   # Link to your project
   supabase link --project-ref YOUR_PROJECT_REF
   
   # Apply database migrations
   supabase db push
   
   # Generate TypeScript types
   supabase gen types typescript --local > src/types/supabase.ts
   ```

4. **Create Storage Buckets**
   ```sql
   -- In Supabase SQL Editor, run:
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('audio-assets', 'audio-assets', true),
   ('avatars', 'avatars', true);
   
   -- Set up storage policies
   CREATE POLICY "Public Audio Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'audio-assets');
   
   CREATE POLICY "User Avatar Upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

### Step 2: Configure AudioVR Project

1. **Set Up Environment Variables**
   ```bash
   # Copy environment template
   cp .env.local.example .env.local
   
   # Edit .env.local with your values:
   ```
   ```env
   # Supabase Configuration
   NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
   
   # ElevenLabs (Optional - for voice synthesis)
   ELEVENLABS_API_KEY=your_elevenlabs_key
   
   # NextJS
   NEXTAUTH_SECRET=your_random_secret_32_chars_minimum
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

2. **Install Dependencies and Test Locally**
   ```bash
   # Install all dependencies
   npm install
   
   # Test the build
   npm run build
   
   # Start development server
   npm run dev
   
   # Test in browser
   open http://localhost:3000
   
   # Test API endpoints
   curl http://localhost:3000/api/analytics/dashboard
   ```

### Step 3: Deploy to Vercel

1. **Install Vercel CLI and Login**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Login to Vercel
   vercel login
   # Follow browser authentication flow
   ```

2. **Deploy to Vercel**
   ```bash
   # Deploy using our automated script
   ./deploy-vercel.sh
   
   # OR deploy manually:
   vercel --prod
   ```

3. **Set Environment Variables in Vercel**
   ```bash
   # Option 1: Using Vercel CLI
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY  
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   vercel env add ELEVENLABS_API_KEY
   vercel env add NEXTAUTH_SECRET
   
   # Option 2: Using Vercel Dashboard
   # Go to https://vercel.com/dashboard
   # Select your project → Settings → Environment Variables
   # Add each variable for Production environment
   ```

4. **Verify Deployment**
   ```bash
   # Get your Vercel URL
   vercel ls
   
   # Test deployment
   curl https://your-app.vercel.app
   curl https://your-app.vercel.app/api/analytics/dashboard
   curl https://your-app.vercel.app/demo
   
   # Check Vercel dashboard for any errors
   ```

### Step 4: Configure Custom Domain (Optional)

1. **Add Domain in Vercel**
   ```bash
   # In Vercel Dashboard:
   # Project Settings → Domains → Add Domain
   # Enter: audiovr.com (or your domain)
   ```

2. **Update DNS Records**
   ```bash
   # Add these DNS records in your domain provider:
   # A record: @ → 76.76.19.19
   # CNAME record: www → cname.vercel-dns.com
   ```

---

## ⚡ Option B: Cloudflare Pages + D1

### Prerequisites
- Cloudflare account
- GitHub account  
- Node.js 18+ installed locally
- Wrangler CLI

### Step 1: Set Up Cloudflare Account

1. **Create Cloudflare Account**
   ```bash
   # Go to https://dash.cloudflare.com
   # Sign up for free account
   # Verify email address
   ```

2. **Get API Token**
   ```bash
   # In Cloudflare Dashboard:
   # My Profile → API Tokens → Create Token
   # Use "Edit Cloudflare Workers" template
   # OR create custom token with permissions:
   ```
   - **Account**: `Cloudflare Pages:Edit`, `Account Settings:Read`
   - **Zone**: `Zone Settings:Read`, `Zone:Read`
   - **Include**: All accounts and zones

3. **Install and Configure Wrangler**
   ```bash
   # Install Wrangler CLI
   npm install -g wrangler
   
   # Login with your API token
   wrangler login
   # OR set token directly
   export CLOUDFLARE_API_TOKEN=your_api_token_here
   
   # Verify authentication
   wrangler whoami
   ```

### Step 2: Configure Cloudflare Services

1. **Create D1 Database**
   ```bash
   cd /home/user/webapp
   
   # Create production database
   wrangler d1 create audiovr-production
   
   # Copy the database ID from output and update wrangler.jsonc:
   ```
   ```jsonc
   {
     "name": "audiovr",
     "compatibility_date": "2024-01-01",
     "d1_databases": [
       {
         "binding": "DB",
         "database_name": "audiovr-production", 
         "database_id": "your-database-id-here"
       }
     ]
   }
   ```

2. **Apply Database Schema**
   ```bash
   # Apply migrations to production
   wrangler d1 migrations apply audiovr-production
   
   # Seed with initial data
   wrangler d1 execute audiovr-production --file=./seed.sql
   ```

3. **Create KV Namespace (Optional)**
   ```bash
   # Create KV for caching
   wrangler kv:namespace create audiovr_cache
   wrangler kv:namespace create audiovr_cache --preview
   
   # Add to wrangler.jsonc:
   ```
   ```jsonc
   {
     "kv_namespaces": [
       {
         "binding": "CACHE",
         "id": "your-kv-id",
         "preview_id": "your-preview-kv-id"
       }
     ]
   }
   ```

### Step 3: Configure Environment Variables

1. **Set Up Local Development**
   ```bash
   # Create .dev.vars file (for local development)
   cat > .dev.vars << EOF
   ELEVENLABS_API_KEY=your_elevenlabs_key
   JWT_SECRET=your_jwt_secret_here
   ENVIRONMENT=development
   EOF
   ```

2. **Set Production Secrets**
   ```bash
   # Set production secrets
   wrangler secret put ELEVENLABS_API_KEY
   # Enter your ElevenLabs API key when prompted
   
   wrangler secret put JWT_SECRET  
   # Enter a secure random string
   
   # List secrets to verify
   wrangler secret list
   ```

### Step 4: Build and Deploy

1. **Build the Project**
   ```bash
   # Clean and build
   npm run clean
   npm run build
   
   # Test locally with Wrangler
   wrangler pages dev dist --d1=audiovr-production --local
   ```

2. **Create Pages Project**
   ```bash
   # Create Cloudflare Pages project
   wrangler pages project create audiovr --production-branch main
   ```

3. **Deploy to Cloudflare Pages**
   ```bash
   # Deploy using our script
   ./deploy.sh
   
   # OR deploy manually
   wrangler pages deploy dist --project-name audiovr
   
   # You'll get URLs like:
   # https://audiovr.pages.dev (production)
   # https://main.audiovr.pages.dev (branch)
   ```

### Step 5: Configure Custom Domain (Optional)

1. **Add Domain to Cloudflare**
   ```bash
   # In Cloudflare Dashboard:
   # Add site → Enter your domain → Select plan
   # Update nameservers at your domain registrar
   ```

2. **Configure Pages Domain**
   ```bash
   # Add custom domain
   wrangler pages domain add audiovr.com --project-name audiovr
   
   # Verify DNS configuration
   dig audiovr.com
   ```

---

## 🔧 Common Troubleshooting

### Vercel Issues

**Build Failures:**
```bash
# Clear cache and reinstall
rm -rf .next node_modules
npm install
npm run build

# Check build logs in Vercel dashboard
```

**Environment Variable Issues:**
```bash
# Verify variables are set
vercel env ls

# Re-deploy after adding variables
vercel --prod
```

**API Route Errors:**
```bash
# Check function logs
vercel logs --function=api/analytics/dashboard

# Test API locally first
npm run dev
curl http://localhost:3000/api/analytics/dashboard
```

### Cloudflare Issues

**D1 Migration Errors:**
```bash
# Check database status
wrangler d1 list

# Reset and reapply migrations
wrangler d1 migrations list audiovr-production
wrangler d1 migrations apply audiovr-production --force
```

**Build/Deploy Errors:**
```bash
# Check wrangler configuration
wrangler pages project list

# Verify authentication
wrangler whoami

# Check build output
ls -la dist/
```

**Performance Issues:**
```bash
# Check Worker analytics in Cloudflare dashboard
# Monitor D1 query performance
# Review error logs in Workers & Pages section
```

### Database Issues

**Supabase Connection:**
```bash
# Test connection
supabase status
supabase db reset

# Check RLS policies
# Go to Supabase Dashboard → Authentication → Policies
```

**D1 Performance:**
```bash
# Monitor query performance
wrangler d1 execute audiovr-production --command="PRAGMA stats"

# Optimize with indexes
wrangler d1 execute audiovr-production --command="ANALYZE"
```

---

## 🎯 Final Verification Checklist

### ✅ Deployment Verification

**Test Core Features:**
- [ ] Home page loads: `https://your-app.domain`
- [ ] Demo works: `https://your-app.domain/demo`
- [ ] Analytics dashboard: `https://your-app.domain/analytics-dashboard.html`
- [ ] API endpoints respond: `https://your-app.domain/api/analytics/dashboard`
- [ ] Mobile prototypes: `https://your-app.domain/mobile-prototypes`

**Test Voice Features:**
- [ ] Voice recognition works in demo
- [ ] Spatial audio plays correctly
- [ ] Voice commands are processed
- [ ] Audio descriptions function

**Test Accessibility:**
- [ ] Screen reader navigation
- [ ] Keyboard-only navigation  
- [ ] High contrast mode
- [ ] Voice control functionality
- [ ] WCAG 2.1 AA compliance

**Test Database:**
- [ ] User registration/login
- [ ] Mystery data loads
- [ ] Progress tracking works
- [ ] Analytics data collection

### 📱 Mobile App Integration

**Update mobile app configuration:**
```typescript
// mobile-app/src/config/api.ts
export const API_CONFIG = {
  // For Vercel deployment
  baseURL: 'https://your-app.vercel.app/api',
  
  // For Cloudflare deployment  
  // baseURL: 'https://your-app.pages.dev/api',
  
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key'
}
```

**Deploy mobile app:**
```bash
cd mobile-app
eas build --platform all --profile production
eas submit --platform all --profile production
```

---

## 🎉 Success!

AudioVR is now deployed and ready for users! 

**Next Steps:**
1. ✅ Test all functionality thoroughly
2. ✅ Set up monitoring and analytics
3. ✅ Configure backup procedures
4. ✅ Plan content creation and community launch
5. ✅ Submit mobile apps to stores
6. ✅ Launch accessibility beta testing program

**Support Resources:**
- **Vercel Docs**: https://vercel.com/docs
- **Supabase Docs**: https://supabase.com/docs  
- **Cloudflare Docs**: https://developers.cloudflare.com
- **AudioVR GitHub**: Your repository URL
- **Community Discord**: Set up community support

**AudioVR is now live and transforming accessible gaming! 🎭🔍🎙️**
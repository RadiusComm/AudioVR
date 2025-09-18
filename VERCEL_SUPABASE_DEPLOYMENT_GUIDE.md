# AudioVR Vercel + Supabase Deployment Guide

This guide walks you through deploying AudioVR using Vercel for hosting and Supabase for the backend database and services.

## 🎯 Overview

**New Architecture:**
- **Frontend & API**: Next.js deployed on Vercel
- **Database**: Supabase PostgreSQL with real-time capabilities
- **Authentication**: Supabase Auth
- **File Storage**: Supabase Storage for audio assets
- **Edge Functions**: Vercel Edge Functions for performance

## 📋 Prerequisites

1. **Accounts Required:**
   - [Vercel Account](https://vercel.com) (free tier available)
   - [Supabase Account](https://supabase.com) (free tier available)
   - [GitHub Account](https://github.com) (for code repository)

2. **Tools to Install:**
   ```bash
   # Install Vercel CLI
   npm install -g vercel
   
   # Install Supabase CLI
   npm install -g supabase
   ```

## 🚀 Step-by-Step Deployment

### Step 1: Set Up Supabase Project

1. **Create New Supabase Project:**
   ```bash
   # Go to https://app.supabase.com
   # Click "New Project"
   # Choose organization and fill project details
   ```

2. **Initialize Supabase Locally:**
   ```bash
   cd /home/user/webapp
   supabase init
   supabase link --project-ref YOUR_PROJECT_REF
   ```

3. **Run Database Migrations:**
   ```bash
   supabase db push
   ```

4. **Generate TypeScript Types:**
   ```bash
   supabase gen types typescript --local > src/types/supabase.ts
   ```

### Step 2: Configure Environment Variables

1. **Create `.env.local`:**
   ```bash
   cp .env.local.example .env.local
   ```

2. **Fill in Supabase Credentials:**
   ```env
   # Get these from Supabase Dashboard -> Settings -> API
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
   SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
   
   # Optional: ElevenLabs for voice synthesis
   ELEVENLABS_API_KEY=your_elevenlabs_key
   
   # NextJS
   NEXTAUTH_SECRET=your_random_secret_here
   NEXT_PUBLIC_APP_URL=http://localhost:3000
   ```

### Step 3: Test Locally

1. **Install Dependencies:**
   ```bash
   npm install
   ```

2. **Run Development Server:**
   ```bash
   npm run dev
   ```

3. **Test Key Features:**
   - Visit: http://localhost:3000
   - Test: http://localhost:3000/demo
   - API: http://localhost:3000/api/analytics/dashboard

### Step 4: Deploy to Vercel

1. **Login to Vercel:**
   ```bash
   vercel login
   ```

2. **Run Deployment Script:**
   ```bash
   ./deploy-vercel.sh
   ```

   Or deploy manually:
   ```bash
   npm run build
   vercel --prod
   ```

3. **Configure Environment Variables in Vercel:**
   ```bash
   # Set environment variables in Vercel Dashboard
   # Or use Vercel CLI:
   vercel env add NEXT_PUBLIC_SUPABASE_URL
   vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
   vercel env add SUPABASE_SERVICE_ROLE_KEY
   ```

### Step 5: Set Up Supabase Storage

1. **Create Storage Buckets:**
   ```sql
   -- In Supabase SQL Editor
   INSERT INTO storage.buckets (id, name, public) VALUES 
   ('audio-assets', 'audio-assets', true),
   ('avatars', 'avatars', true);
   ```

2. **Configure Storage Policies:**
   ```sql
   -- Allow public read access to audio assets
   CREATE POLICY "Public Audio Access" ON storage.objects
   FOR SELECT USING (bucket_id = 'audio-assets');
   
   -- Allow authenticated users to upload avatars
   CREATE POLICY "User Avatar Upload" ON storage.objects
   FOR INSERT WITH CHECK (
     bucket_id = 'avatars' 
     AND auth.uid()::text = (storage.foldername(name))[1]
   );
   ```

## 🔧 Configuration Details

### Vercel Configuration (`vercel.json`)

```json
{
  "version": 2,
  "builds": [
    {
      "src": "package.json",
      "use": "@vercel/next"
    }
  ],
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@supabase_anon_key"
  }
}
```

### Next.js Configuration (`next.config.js`)

- Optimized for Vercel deployment
- Image optimization for audio thumbnails
- Security headers configured
- API routes properly set up

### Supabase Configuration

- PostgreSQL database with full AudioVR schema
- Row Level Security (RLS) enabled
- Real-time subscriptions for live features
- Storage buckets for audio files

## 📊 Post-Deployment Setup

### 1. Verify Deployment

Visit these URLs to confirm everything works:
- **Main Site**: `https://your-app.vercel.app`
- **Demo**: `https://your-app.vercel.app/demo`
- **Analytics**: `https://your-app.vercel.app/analytics-dashboard.html`
- **API Health**: `https://your-app.vercel.app/api/analytics/dashboard`

### 2. Populate Sample Data

```bash
# Insert sample worlds
INSERT INTO public.worlds (name, description, setting_period) VALUES
('Victorian London', 'Fog-shrouded streets of 19th century London', '1880s'),
('Modern Tokyo', 'Neon-lit cyberpunk cityscape', '2024'),
('Space Station Omega', 'Zero-gravity investigation environment', '2350');

# Insert sample mysteries (run the seed scripts)
```

### 3. Configure Analytics

```bash
# Enable Vercel Analytics (optional)
npm install @vercel/analytics
```

### 4. Set Up Monitoring

- **Vercel Dashboard**: Monitor deployment status and performance
- **Supabase Dashboard**: Monitor database queries and storage usage
- **Custom Analytics**: Use the built-in AudioVR analytics dashboard

## 🔄 Continuous Deployment

### GitHub Integration

1. **Push to GitHub:**
   ```bash
   git remote add origin https://github.com/your-org/audiovr-web.git
   git push -u origin main
   ```

2. **Connect Vercel to GitHub:**
   - Go to Vercel Dashboard
   - Import your GitHub repository
   - Enable auto-deployment on push

### Update Workflow

```bash
# Make changes locally
git add .
git commit -m "Update AudioVR features"
git push origin main

# Vercel automatically deploys
# Check deployment status in Vercel Dashboard
```

## 🎮 Mobile App Integration

Update your React Native app to use the new Vercel API:

```typescript
// mobile-app/src/config/api.ts
const API_BASE_URL = 'https://your-app.vercel.app/api'

export const apiConfig = {
  baseURL: API_BASE_URL,
  supabaseUrl: 'https://your-project.supabase.co',
  supabaseAnonKey: 'your_anon_key'
}
```

## 🔧 Troubleshooting

### Common Issues

1. **Environment Variables Not Working:**
   ```bash
   # Re-deploy after setting env vars
   vercel --prod
   ```

2. **Database Connection Issues:**
   ```bash
   # Check Supabase connection
   supabase status
   ```

3. **Build Failures:**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

### Performance Optimization

1. **Enable Vercel Analytics:**
   ```bash
   npm install @vercel/analytics
   ```

2. **Optimize Images:**
   ```javascript
   // next.config.js already configured for optimization
   ```

3. **Database Indexing:**
   ```sql
   -- Indexes already created in migration
   -- Monitor slow queries in Supabase Dashboard
   ```

## 📈 Scaling Considerations

### Supabase Limits (Free Tier)
- **Database**: 2 GB storage
- **Storage**: 1 GB file storage
- **Bandwidth**: 10 GB per month

### Vercel Limits (Free Tier)
- **Serverless Functions**: 100 GB-hours
- **Bandwidth**: 100 GB per month
- **Build Minutes**: 6,000 minutes/month

### Upgrade Path
1. **Supabase Pro**: $25/month for higher limits
2. **Vercel Pro**: $20/month per user
3. **Custom Domain**: Free on both platforms

## 🎉 Success!

AudioVR is now successfully deployed on Vercel + Supabase! 

**Key Benefits of This Stack:**
- ✅ **Scalable**: Auto-scaling serverless infrastructure
- ✅ **Fast**: Edge deployment and CDN
- ✅ **Reliable**: 99.9% uptime SLA
- ✅ **Developer-Friendly**: Great DX with instant deployments
- ✅ **Cost-Effective**: Generous free tiers

**Next Steps:**
1. Configure custom domain (optional)
2. Set up monitoring and alerts
3. Deploy mobile app updates
4. Launch accessibility testing
5. Go live with your voice-driven detective mysteries!

---

**Support:**
- Vercel Documentation: https://vercel.com/docs
- Supabase Documentation: https://supabase.com/docs
- AudioVR Issues: Create issues in your GitHub repository
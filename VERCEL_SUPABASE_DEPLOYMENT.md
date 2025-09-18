# AudioVR Deployment Guide: Vercel + Supabase

## 🚀 Complete Migration from Cloudflare to Vercel + Supabase

This guide walks you through deploying AudioVR using Vercel for the frontend/API and Supabase for the backend database and authentication.

---

## 📋 Prerequisites

- **Node.js 18+** installed locally
- **Git** repository set up
- **Vercel account** (free tier available)
- **Supabase account** (free tier available)

---

## 🗄️ Step 1: Set Up Supabase Backend

### 1.1 Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Click "Start your project" → "New project"
3. Choose organization and enter project details:
   - **Name**: `audiovr-backend`
   - **Database Password**: Generate a strong password
   - **Region**: Choose closest to your users
4. Click "Create new project" (takes ~2 minutes)

### 1.2 Configure Database Schema

1. In Supabase Dashboard, go to **SQL Editor**
2. Copy the contents from `supabase/migrations/001_initial_schema.sql`
3. Paste into SQL Editor and click "Run"
4. Verify tables were created in **Table Editor**

### 1.3 Set Up Storage Buckets

1. Go to **Storage** in Supabase Dashboard
2. Create buckets:
   ```
   Bucket Name: audio-assets
   Public: true
   File size limit: 50MB
   Allowed MIME types: audio/*, video/*
   
   Bucket Name: avatars  
   Public: true
   File size limit: 5MB
   Allowed MIME types: image/*
   ```

### 1.4 Configure Authentication

1. Go to **Authentication** → **Settings**
2. **Site URL**: `https://your-app.vercel.app` (update after deployment)
3. **Redirect URLs**: Add `https://your-app.vercel.app/auth/callback`
4. Enable providers you want (Email, Google, etc.)

### 1.5 Get API Keys

1. Go to **Settings** → **API**
2. Copy these values (you'll need them for Vercel):
   - **Project URL**: `https://xxx.supabase.co`
   - **anon/public key**: `eyJhbGc...`
   - **service_role key**: `eyJhbGc...` (keep secret!)

---

## 🌐 Step 2: Deploy to Vercel

### 2.1 Install Vercel CLI

```bash
npm install -g vercel
vercel login
```

### 2.2 Prepare Local Environment

```bash
# Navigate to project directory
cd /home/user/webapp

# Install dependencies
npm install

# Create environment file
cp .env.local.example .env.local

# Edit .env.local with your Supabase credentials
nano .env.local
```

**Update `.env.local` with your Supabase values:**
```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key-here
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
ELEVENLABS_API_KEY=your-elevenlabs-key-here
NEXTAUTH_SECRET=your-random-secret-here
NEXTAUTH_URL=http://localhost:3000
```

### 2.3 Test Locally

```bash
# Build and test the application
npm run build
npm run dev

# Open http://localhost:3000 and test functionality
```

### 2.4 Deploy to Vercel

```bash
# Initialize Vercel project
vercel

# Follow prompts:
# - Set up and deploy? Yes
# - Which scope? [Your account]
# - Link to existing project? No
# - Project name: audiovr-web
# - Directory: ./
# - Override settings? No

# Deploy to production
vercel --prod
```

### 2.5 Configure Environment Variables in Vercel

1. Go to [vercel.com/dashboard](https://vercel.com/dashboard)
2. Select your project → **Settings** → **Environment Variables**
3. Add these variables:

```
Name: NEXT_PUBLIC_SUPABASE_URL
Value: https://your-project-id.supabase.co
Environment: Production, Preview, Development

Name: NEXT_PUBLIC_SUPABASE_ANON_KEY  
Value: your-anon-key-here
Environment: Production, Preview, Development

Name: SUPABASE_SERVICE_ROLE_KEY
Value: your-service-role-key-here
Environment: Production, Preview

Name: ELEVENLABS_API_KEY
Value: your-elevenlabs-key-here
Environment: Production, Preview

Name: NEXTAUTH_SECRET
Value: your-random-secret-here
Environment: Production, Preview

Name: NEXTAUTH_URL
Value: https://your-app.vercel.app
Environment: Production
```

### 2.6 Redeploy with Environment Variables

```bash
# Trigger redeployment to use environment variables
vercel --prod
```

---

## 🔧 Step 3: Configure Custom Domain (Optional)

### 3.1 Add Domain in Vercel

1. In Vercel Dashboard → **Settings** → **Domains**
2. Add your domain: `audiovr.app`
3. Follow DNS configuration instructions

### 3.2 Update Supabase Settings

1. In Supabase → **Authentication** → **Settings**
2. Update **Site URL** to `https://audiovr.app`
3. Update **Redirect URLs** to include your custom domain

---

## 📊 Step 4: Seed Sample Data (Optional)

### 4.1 Add Sample Worlds and Mysteries

```sql
-- Run in Supabase SQL Editor
INSERT INTO public.worlds (id, name, description, setting_period, atmosphere_description) VALUES
(
    uuid_generate_v4(),
    'Victorian London',
    'Fog-shrouded streets of 1880s London with gaslit mysteries and cobblestone alleys.',
    '1880s',
    'Dark, mysterious atmosphere with thick fog, gaslight, and the sounds of horse-drawn carriages echoing through narrow streets.'
),
(
    uuid_generate_v4(),
    'Modern Tokyo',
    'Neon-lit cyberpunk investigations in contemporary Japan.',
    '2024',
    'High-tech urban environment with neon lights, electronic sounds, and the bustling energy of a modern metropolis.'
),
(
    uuid_generate_v4(),
    'Space Station Omega',
    'Zero-gravity crime scenes aboard a research station in deep space.',
    '2087',
    'Futuristic space environment with artificial gravity, computer systems humming, and the vast silence of space beyond.'
);
```

### 4.2 Create Sample User and Creator

```sql
-- Create sample creator (run after user signup)
INSERT INTO public.creators (user_id, verification_status) VALUES
(
    'your-user-id-here', -- Replace with actual user ID after signup
    'verified'
);
```

---

## ✅ Step 5: Verification and Testing

### 5.1 Test Core Features

Visit your deployed app and verify:

- ✅ **Homepage loads** with proper styling
- ✅ **Authentication works** (sign up/login)
- ✅ **Demo page functions** (`/demo`)
- ✅ **Voice recognition works** (requires HTTPS)
- ✅ **Database connections** work
- ✅ **Audio playback** functions
- ✅ **Accessibility features** work with screen readers

### 5.2 Performance Testing

```bash
# Test API endpoints
curl https://your-app.vercel.app/api/mysteries
curl https://your-app.vercel.app/api/worlds

# Check loading speeds
lighthouse https://your-app.vercel.app --view
```

### 5.3 Accessibility Testing

1. **Screen Reader Test**: Use VoiceOver (Mac) or NVDA (Windows)
2. **Keyboard Navigation**: Tab through all interactive elements
3. **Voice Commands**: Test in the demo section
4. **High Contrast**: Enable system high contrast mode

---

## 📈 Step 6: Monitoring and Analytics

### 6.1 Vercel Analytics

1. In Vercel Dashboard → **Analytics** 
2. Enable Web Analytics for usage insights
3. Monitor Core Web Vitals for performance

### 6.2 Supabase Monitoring

1. In Supabase → **Settings** → **Database**
2. Monitor connection counts and query performance
3. Set up alerts for high usage

### 6.3 Error Tracking (Optional)

Add Sentry for error monitoring:

```bash
npm install @sentry/nextjs
```

---

## 🔄 Step 7: Continuous Deployment

### 7.1 GitHub Integration

1. Push code to GitHub repository
2. In Vercel → **Settings** → **Git**
3. Connect repository for automatic deployments
4. Enable automatic deployments on push to main branch

### 7.2 Preview Deployments

- Every PR creates a preview deployment
- Test features before merging to main
- Automatic rollbacks if deployment fails

---

## 🛠️ Troubleshooting

### Common Issues

**1. Environment Variables Not Loading**
```bash
# Verify variables in Vercel dashboard
# Redeploy after adding variables
vercel --prod
```

**2. Database Connection Errors**
- Check Supabase project is running
- Verify API keys are correct
- Check RLS policies allow access

**3. Voice Recognition Not Working**
- Ensure HTTPS is enabled (required for Web Speech API)
- Check browser permissions for microphone access
- Verify on supported browsers (Chrome, Edge, Safari)

**4. Build Failures**
```bash
# Check build logs in Vercel dashboard
# Test locally first
npm run build
```

### Performance Optimization

**1. Enable Vercel Edge Functions**
```javascript
// For API routes that need global distribution
export const config = {
  runtime: 'edge',
}
```

**2. Optimize Images**
```javascript
// Use Next.js Image component
import Image from 'next/image'
```

**3. Database Query Optimization**
- Add indexes for frequently queried fields
- Use Supabase real-time subscriptions sparingly
- Implement proper caching strategies

---

## 🎯 Migration Benefits

### Advantages of Vercel + Supabase vs Cloudflare

**✅ Vercel Advantages:**
- Excellent Next.js integration and performance
- Automatic deployments and previews
- Built-in analytics and monitoring
- Edge functions for global distribution
- Easy environment variable management

**✅ Supabase Advantages:**
- Full PostgreSQL database with real-time features
- Built-in authentication with multiple providers
- File storage with CDN distribution
- Row Level Security for data protection
- Real-time subscriptions for live features
- Comprehensive admin dashboard

**✅ Combined Benefits:**
- Better developer experience
- More mature ecosystem
- Superior database capabilities
- Real-time features out of the box
- Easier scaling and maintenance

---

## 📚 Next Steps

1. **Custom Domain**: Set up your production domain
2. **Content Creation**: Use the CMS to add more mysteries
3. **Mobile Apps**: Deploy React Native apps using Expo EAS
4. **Analytics**: Set up comprehensive user analytics
5. **Community Features**: Implement user-generated content
6. **Monetization**: Add premium features and subscriptions

---

**Your AudioVR platform is now successfully deployed on Vercel + Supabase! 🎉**

The platform maintains all accessibility features, voice recognition capabilities, and spatial audio while gaining the benefits of a more robust and scalable architecture.
# AudioVR Web Application - Vercel + Supabase Deployment Guide

This guide covers the complete setup and deployment process for the AudioVR web application using Vercel for hosting and Supabase for backend services.

## 🏗️ Architecture Overview

```
┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase      │    │   Third Party   │
│                 │    │                 │    │                 │
│ ├─ Next.js App  │◄──►│ ├─ PostgreSQL   │    │ ├─ ElevenLabs   │
│ ├─ API Routes   │    │ ├─ Auth         │    │ ├─ OpenAI       │
│ ├─ Static Files │    │ ├─ Storage      │    │ └─ Analytics    │
│ └─ Edge Network │    │ └─ Realtime     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘
```

## 📋 Prerequisites

### Required Accounts
- [Vercel Account](https://vercel.com) (Free tier available)
- [Supabase Account](https://supabase.com) (Free tier available)
- [GitHub Account](https://github.com) (for source control)

### Required CLI Tools
```bash
# Install Vercel CLI
npm install -g vercel

# Install Supabase CLI
npm install -g supabase

# Verify installations
vercel --version
supabase --version
```

## 🗄️ Supabase Setup

### 1. Create New Supabase Project

1. Go to [Supabase Dashboard](https://app.supabase.com)
2. Click "New Project"
3. Choose organization and enter details:
   - **Name**: `audiovr-web`
   - **Database Password**: Generate a secure password
   - **Region**: Choose closest to your users

### 2. Configure Database

```bash
# Initialize Supabase in your project
cd /path/to/webapp
supabase init

# Link to your Supabase project
supabase link --project-ref your-project-ref

# Push database schema and migrations
supabase db push

# Seed the database with sample data
supabase db seed

# Generate TypeScript types
npm run supabase:generate-types
```

### 3. Configure Authentication

In your Supabase dashboard:

1. **Authentication → Settings → General**
   - Site URL: `https://your-app.vercel.app`
   - Redirect URLs: `https://your-app.vercel.app/**`

2. **Authentication → Providers**
   - Enable Email authentication
   - Configure OAuth providers (optional):
     - Google
     - GitHub
     - Discord

### 4. Set Row Level Security (RLS)

```sql
-- Enable RLS on all tables
ALTER TABLE user_profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE mysteries ENABLE ROW LEVEL SECURITY;
ALTER TABLE worlds ENABLE ROW LEVEL SECURITY;
ALTER TABLE mystery_elements ENABLE ROW LEVEL SECURITY;
ALTER TABLE player_progress ENABLE ROW LEVEL SECURITY;

-- Create policies for user_profiles
CREATE POLICY "Users can view own profile" ON user_profiles
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can update own profile" ON user_profiles
  FOR UPDATE USING (auth.uid() = user_id);

-- Create policies for mysteries
CREATE POLICY "Anyone can view published mysteries" ON mysteries
  FOR SELECT USING (status = 'published');

CREATE POLICY "Creators can manage own mysteries" ON mysteries
  FOR ALL USING (auth.uid() = creator_id);
```

## 🚀 Vercel Setup

### 1. Install and Login

```bash
# Login to Vercel
vercel login

# Verify login
vercel whoami
```

### 2. Project Configuration

Create or update `vercel.json`:

```json
{
  "version": 2,
  "name": "audiovr-web",
  "framework": "nextjs",
  "functions": {
    "pages/api/**/*.ts": {
      "maxDuration": 30,
      "memory": 1024
    }
  },
  "env": {
    "NEXT_PUBLIC_SUPABASE_URL": "@next_public_supabase_url",
    "NEXT_PUBLIC_SUPABASE_ANON_KEY": "@next_public_supabase_anon_key",
    "SUPABASE_SERVICE_ROLE_KEY": "@supabase_service_role_key"
  }
}
```

### 3. Environment Variables

Set up environment variables in Vercel Dashboard or CLI:

```bash
# Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
vercel env add ELEVENLABS_API_KEY
vercel env add OPENAI_API_KEY

# Pull environment variables to local
vercel env pull .env.local
```

Required environment variables:
- `NEXT_PUBLIC_SUPABASE_URL`: Your Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY`: Supabase anonymous key
- `SUPABASE_SERVICE_ROLE_KEY`: Supabase service role key (server-side only)
- `ELEVENLABS_API_KEY`: For AI voice generation
- `OPENAI_API_KEY`: For AI features (optional)

## 🔄 Deployment Workflow

### Automated Deployment

Use the provided deployment script:

```bash
# Run full deployment (Supabase + Vercel)
./scripts/deploy-full.sh

# Or use npm scripts
npm run deploy:full
```

### Manual Deployment Steps

1. **Prepare Database**
   ```bash
   npm run supabase:migrate
   npm run supabase:generate-types
   ```

2. **Build Application**
   ```bash
   npm run build
   ```

3. **Deploy to Vercel**
   ```bash
   npm run vercel:deploy
   ```

### GitHub Integration

For automatic deployments on git push:

1. **Connect Repository**
   - Go to Vercel Dashboard
   - Click "Import Project"
   - Connect your GitHub repository

2. **Configure Build Settings**
   - Build Command: `npm run build`
   - Output Directory: `.next`
   - Install Command: `npm install`

3. **Environment Variables**
   - Add all required environment variables in Vercel dashboard
   - Variables are automatically available to build and runtime

## 📊 Monitoring & Analytics

### Vercel Analytics
```bash
# Install Vercel Analytics
npm install @vercel/analytics

# Add to your app
import { Analytics } from '@vercel/analytics/react'

export default function App() {
  return (
    <>
      <YourApp />
      <Analytics />
    </>
  )
}
```

### Supabase Monitoring

1. **Database Logs**
   - Monitor in Supabase Dashboard → Logs
   - Set up log alerts for errors

2. **Performance Metrics**
   - Track API usage
   - Monitor connection pools
   - Database query performance

## 🔧 Development Workflow

### Local Development

```bash
# Start Supabase locally
npm run supabase:start

# Start Next.js development server
npm run dev

# In separate terminal, generate types on schema changes
npm run db:types
```

### Database Changes

```bash
# Create new migration
npm run supabase:migrate:new add_new_feature

# Apply migrations locally
npm run supabase:migrate

# Deploy migrations to production
supabase db push

# Generate updated types
npm run db:types
```

### Testing

```bash
# Run all tests
npm test

# Run tests with coverage
npm run test:coverage

# Type checking
npm run type-check

# Linting
npm run lint:fix
```

## 📱 API Routes

### Authentication Endpoints
- `POST /api/auth/login` - User login
- `POST /api/auth/register` - User registration
- `POST /api/auth/logout` - User logout

### Mystery Management
- `GET /api/mysteries` - List published mysteries
- `GET /api/mysteries/[id]` - Get mystery details
- `POST /api/mysteries` - Create new mystery (authenticated)
- `PUT /api/mysteries/[id]` - Update mystery (owner only)

### Player Progress
- `GET /api/progress/[mysteryId]` - Get player progress
- `POST /api/progress` - Save player progress
- `DELETE /api/progress/[mysteryId]` - Reset progress

### Analytics
- `POST /api/analytics/track` - Track user events
- `GET /api/analytics/dashboard` - Get analytics data (admin)

## 🔒 Security Best Practices

### Environment Variables
- Never commit sensitive keys to git
- Use different keys for development/production
- Rotate keys regularly

### Database Security
- Enable Row Level Security (RLS)
- Use service role key only server-side
- Validate all user inputs

### API Security
- Implement rate limiting
- Validate authentication tokens
- Sanitize user inputs

## 🚨 Troubleshooting

### Common Issues

1. **Build Failures**
   ```bash
   # Clear cache and rebuild
   npm run clean
   npm install
   npm run build
   ```

2. **Database Connection Issues**
   ```bash
   # Check Supabase status
   npm run supabase:status
   
   # Restart local Supabase
   npm run supabase:stop
   npm run supabase:start
   ```

3. **Environment Variable Issues**
   ```bash
   # Pull latest environment variables
   vercel env pull .env.local
   
   # Verify variables are set
   vercel env ls
   ```

4. **Type Generation Issues**
   ```bash
   # Force regenerate types
   rm src/types/supabase.ts
   npm run supabase:generate-types
   ```

### Getting Help

- [Vercel Documentation](https://vercel.com/docs)
- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Project Issues](https://github.com/username/audiovr-web/issues)

## 📈 Performance Optimization

### Vercel Optimizations
- Use Edge Functions for lightweight API routes
- Enable compression and caching
- Optimize images with Next.js Image component
- Use Vercel Analytics for performance monitoring

### Supabase Optimizations
- Use database indexes for frequently queried columns
- Implement connection pooling
- Use Supabase Edge Functions for compute-heavy tasks
- Enable real-time subscriptions only when needed

### Next.js Optimizations
- Use dynamic imports for code splitting
- Implement proper caching strategies
- Optimize bundle size with webpack analyzer
- Use middleware for authentication checks

---

## 🎯 Quick Start Checklist

- [ ] Create Supabase project and configure database
- [ ] Set up Vercel account and connect GitHub repository
- [ ] Configure environment variables in both platforms
- [ ] Run initial deployment with `./scripts/deploy-full.sh`
- [ ] Verify all features work in production
- [ ] Set up monitoring and analytics
- [ ] Configure custom domain (optional)

For more detailed information, refer to the individual platform documentation and the project's API documentation.
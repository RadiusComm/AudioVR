# 🚀 AudioVR - Quick Deployment Reference Card

**⏱️ Total Time: 30-45 minutes** | **💰 Cost: Free tiers available**

---

## 📋 Quick Setup Checklist

### Prerequisites (5 min)
- [ ] Node.js 18+ installed
- [ ] GitHub account created
- [ ] Stable internet connection

### Accounts Setup (10 min)
- [ ] **Supabase**: [app.supabase.com](https://app.supabase.com) - Sign up with GitHub
- [ ] **Vercel**: [vercel.com](https://vercel.com) - Sign up with GitHub

### CLI Installation (2 min)
```bash
npm install -g vercel supabase
```

---

## ⚡ One-Command Setup

```bash
# Run the automated setup script
cd /home/user/webapp
chmod +x scripts/setup-environment.sh
./scripts/setup-environment.sh
```

**This script will:**
- Guide you through Supabase credentials setup
- Configure Vercel environment variables
- Set up local development environment
- Test all connections

---

## 🎯 Manual Setup (If You Prefer Step-by-Step)

### 1. Supabase Setup (10 min)
```bash
# 1.1 Create project at https://app.supabase.com
# Project name: audiovr-web
# Save the database password!

# 1.2 Link local project
supabase login
supabase link --project-ref YOUR_PROJECT_REF

# 1.3 Deploy schema
supabase db push
npm run supabase:generate-types
```

### 2. Vercel Setup (10 min)
```bash
# 2.1 Login and link project
vercel login
vercel  # Follow prompts to create project

# 2.2 Set environment variables
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
vercel env add SUPABASE_SERVICE_ROLE_KEY
```

### 3. Deploy (5 min)
```bash
# One-command deployment
./scripts/deploy-full.sh

# Or manual steps
npm run build
vercel --prod
```

---

## 🔑 Required Credentials

### Supabase (from Dashboard → Settings → API)
- **Project URL**: `https://your-ref.supabase.co`
- **Anon Key**: `eyJhbGciOiJIUzI1NiIs...` (public)
- **Service Role**: `eyJhbGciOiJIUzI1NiIs...` (secret)

### Optional API Keys
- **ElevenLabs**: [elevenlabs.io/api](https://elevenlabs.io/api) (voice generation)
- **OpenAI**: [platform.openai.com](https://platform.openai.com/api-keys) (AI features)

---

## 🛠️ Useful Commands

### Development
```bash
npm run dev                    # Start local dev server
npm run supabase:start        # Start local Supabase
```

### Database
```bash
supabase db push              # Deploy schema changes
npm run db:fresh              # Reset local database
npm run db:types              # Generate TypeScript types
```

### Deployment
```bash
./scripts/deploy-full.sh      # Full automated deployment
vercel --prod                 # Deploy to Vercel only
./scripts/verify-deployment.sh # Test deployment
```

### Environment
```bash
vercel env pull .env.local    # Pull Vercel env vars
vercel env ls                 # List all env vars
supabase status               # Check Supabase connection
```

---

## 🚨 Common Issues & Quick Fixes

### Build Fails
```bash
npm run clean && npm install && npm run build
```

### Type Errors
```bash
npm run supabase:generate-types && npm run type-check
```

### Environment Issues
```bash
vercel env pull .env.local
./scripts/setup-environment.sh
```

### Database Connection
```bash
supabase status
supabase link --project-ref YOUR_REF
```

---

## 📱 URLs After Deployment

- **Production**: `https://your-app.vercel.app`
- **Supabase Dashboard**: `https://app.supabase.com`
- **Vercel Dashboard**: `https://vercel.com/dashboard`

---

## 🔗 Essential Links

| Resource | URL |
|----------|-----|
| **Detailed Guide** | [DEPLOYMENT_STEP_BY_STEP.md](./DEPLOYMENT_STEP_BY_STEP.md) |
| **Vercel+Supabase Setup** | [VERCEL_SUPABASE_SETUP.md](./VERCEL_SUPABASE_SETUP.md) |
| **Supabase Docs** | [supabase.com/docs](https://supabase.com/docs) |
| **Vercel Docs** | [vercel.com/docs](https://vercel.com/docs) |
| **Project Issues** | [GitHub Issues](https://github.com/username/audiovr-web/issues) |

---

## 📞 Need Help?

1. **Check logs**: `vercel logs` or Supabase Dashboard
2. **Run verification**: `./scripts/verify-deployment.sh`
3. **Review guides**: Start with `DEPLOYMENT_STEP_BY_STEP.md`
4. **Ask community**: Vercel Discord, Supabase Discord

---

**🎊 Happy Deploying! Your AudioVR app will be live in under 45 minutes!**
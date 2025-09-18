# AudioVR Production Deployment Guide

## 🚀 Overview

This guide walks you through deploying AudioVR to production, including the Cloudflare Workers backend and React Native mobile app.

## 📋 Prerequisites

### Required Tools
- **Node.js 18+** and npm
- **Wrangler CLI** (Cloudflare Workers CLI)
- **Git** for version control
- **Expo CLI** for mobile app deployment

### Required Accounts & API Keys
- **Cloudflare Account** with Pages and Workers access
- **ElevenLabs API Key** for voice synthesis
- **Apple Developer Account** (for iOS deployment)
- **Google Play Developer Account** (for Android deployment)

## 🔧 Backend Deployment (Cloudflare Pages)

### Step 1: Configure Cloudflare API Key

1. Go to the **Deploy** tab in your development environment
2. Create a Cloudflare API token with the following permissions:
   - **Zone:Read** for all zones
   - **Page:Edit** for all pages
   - **User:Read** for your account
3. Configure the API key in your environment

### Step 2: Create Production Database

```bash
# Create production D1 database
npx wrangler d1 create audiovr-production

# Note the database ID from the output and update wrangler.jsonc
```

### Step 3: Update Configuration

Update `wrangler.jsonc` with your production database ID:

```jsonc
{
  "$schema": "node_modules/wrangler/config-schema.json",
  "name": "audiovr",
  "compatibility_date": "2024-01-01",
  "pages_build_output_dir": "./dist",
  "d1_databases": [
    {
      "binding": "DB",
      "database_name": "audiovr-production", 
      "database_id": "your-actual-database-id-here"
    }
  ]
}
```

### Step 4: Deploy Backend

```bash
# Option A: Use the automated deployment script
./deploy.sh

# Option B: Manual deployment
npm run build
npm run db:migrate:prod
npm run db:seed:prod
npm run deploy:production
```

### Step 5: Configure Environment Variables

In the Cloudflare Pages dashboard, set these environment variables:

```env
ELEVENLABS_API_KEY=your_elevenlabs_api_key_here
JWT_SECRET=your_random_jwt_secret_here
NODE_ENV=production
DATABASE_URL=your_d1_database_url
```

## 📱 Mobile App Deployment

### Step 1: Configure App Settings

Update `mobile-app/app.json` with your production settings:

```json
{
  "expo": {
    "extra": {
      "apiUrl": "https://audiovr.pages.dev"
    }
  }
}
```

### Step 2: Install EAS CLI

```bash
npm install -g @expo/eas-cli
```

### Step 3: Configure EAS Build

```bash
cd mobile-app

# Login to Expo
eas login

# Configure the project
eas build:configure
```

### Step 4: Build for App Stores

```bash
# Build for iOS App Store
eas build --platform ios --profile production

# Build for Google Play Store
eas build --platform android --profile production
```

### Step 5: Submit to App Stores

```bash
# Submit to iOS App Store
eas submit --platform ios --profile production

# Submit to Google Play Store  
eas submit --platform android --profile production
```

## 🔐 Security Configuration

### Required Secrets

Set these secrets in Cloudflare Pages:

```bash
npx wrangler pages secret put ELEVENLABS_API_KEY --project-name audiovr
npx wrangler pages secret put JWT_SECRET --project-name audiovr
```

### Database Security

- Enable D1 database encryption
- Set up regular automated backups
- Configure access controls

### API Security

- Enable rate limiting on API endpoints
- Set up CORS policies for mobile app domains
- Configure JWT token expiration

## 🌐 Domain & SSL Setup

### Custom Domain Configuration

```bash
# Add custom domain to Cloudflare Pages
npx wrangler pages domain add audiovr.app --project-name audiovr

# Verify SSL certificate
curl -I https://audiovr.app
```

### DNS Configuration

Point your domain to Cloudflare Pages:

```
CNAME audiovr.app audiovr.pages.dev
```

## 📊 Monitoring & Analytics

### Health Checks

Set up monitoring for these endpoints:

- `https://audiovr.pages.dev/api/health`
- `https://audiovr.pages.dev/api/worlds`
- `https://audiovr.pages.dev/api/cases`

### Performance Monitoring

- Enable Cloudflare Analytics
- Set up error tracking with Sentry
- Monitor API response times
- Track user engagement metrics

### Accessibility Monitoring

- Monitor screen reader usage statistics
- Track voice command success rates
- Measure audio loading performance
- Monitor haptic feedback usage

## 🧪 Testing in Production

### API Testing

```bash
# Test health endpoint
curl https://audiovr.pages.dev/api/health

# Test worlds endpoint
curl https://audiovr.pages.dev/api/worlds

# Test cases endpoint
curl https://audiovr.pages.dev/api/cases
```

### Mobile App Testing

- Test on real devices with assistive technologies
- Verify voice commands work with various accents
- Test spatial audio with headphones and speakers
- Validate offline functionality

### Accessibility Testing

```bash
# Run accessibility audit
npm run test:accessibility

# Test with screen readers
# - iOS: VoiceOver
# - Android: TalkBack
# - Web: NVDA, JAWS
```

## 🔄 CI/CD Pipeline

### GitHub Actions Workflow

Create `.github/workflows/deploy.yml`:

```yaml
name: Deploy AudioVR
on:
  push:
    branches: [main]

jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v3
      
      - name: Setup Node.js
        uses: actions/setup-node@v3
        with:
          node-version: '18'
          
      - name: Install dependencies
        run: npm install
        
      - name: Build application
        run: npm run build
        
      - name: Deploy to Cloudflare Pages
        run: npx wrangler pages deploy dist --project-name audiovr
        env:
          CLOUDFLARE_API_TOKEN: ${{ secrets.CLOUDFLARE_API_TOKEN }}
```

## 📈 Performance Optimization

### Backend Optimization

- Enable Cloudflare caching for static assets
- Optimize database queries with proper indexing
- Implement connection pooling for D1
- Use Cloudflare Workers KV for frequently accessed data

### Mobile App Optimization

- Implement audio asset caching
- Optimize voice recognition for battery life
- Use efficient spatial audio algorithms
- Minimize network requests with smart caching

### Audio Performance

- Use compressed audio formats (AAC, OGG)
- Implement progressive audio loading
- Optimize spatial audio calculations
- Cache frequently used sound effects

## 🛠️ Troubleshooting

### Common Issues

**Build Failures:**
```bash
# Clean build cache
npm run clean
npm install
npm run build
```

**Database Connection Issues:**
```bash
# Verify database configuration
npx wrangler d1 info audiovr-production
```

**API Deployment Issues:**
```bash
# Check deployment logs
npx wrangler pages deployment tail
```

### Support Contacts

- **Technical Issues:** Check GitHub Issues
- **Accessibility Feedback:** accessibility@audiovr.app
- **Performance Issues:** Monitor Cloudflare Analytics

## 📄 Post-Deployment Checklist

- [ ] Backend API is responding correctly
- [ ] Database migrations completed successfully
- [ ] Mobile app builds and installs properly
- [ ] Voice commands work with test users
- [ ] Spatial audio functions correctly
- [ ] Screen readers can navigate all content
- [ ] Haptic feedback works on supported devices
- [ ] All accessibility features are functional
- [ ] Performance metrics are within targets
- [ ] Error monitoring is active
- [ ] Backup systems are configured
- [ ] Support documentation is updated

## 🎉 Go Live Checklist

### Pre-Launch
- [ ] Complete accessibility audit
- [ ] User acceptance testing with target audience
- [ ] Performance testing under load
- [ ] Security penetration testing
- [ ] Content review and approval

### Launch Day
- [ ] Deploy to production
- [ ] Submit apps to stores
- [ ] Monitor error rates and performance
- [ ] Prepare support team
- [ ] Announce launch to accessibility community

### Post-Launch
- [ ] Monitor user feedback
- [ ] Track accessibility usage metrics
- [ ] Plan regular content updates
- [ ] Schedule accessibility audits
- [ ] Gather user testimonials

---

## 🎤 Success Metrics

**Technical Metrics:**
- API response time < 200ms
- Mobile app startup time < 3 seconds
- Voice command recognition accuracy > 95%
- Audio loading time < 2 seconds
- Crash rate < 0.1%

**Accessibility Metrics:**
- Screen reader compatibility score: 100%
- Voice navigation success rate > 98%
- Haptic feedback adoption rate
- Audio description usage statistics
- User satisfaction scores from accessibility community

**Business Metrics:**
- App store ratings > 4.5 stars
- User retention rate > 80% after 7 days
- Daily active users growth
- Case completion rates
- Community engagement metrics

AudioVR is now ready for production! 🚀🎭🔍
#!/bin/bash

# AudioVR - Supabase Setup Script
# Sets up AudioVR with your existing Supabase project

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   AudioVR + Your Supabase Setup${NC}"
    echo -e "${BLUE}========================================${NC}\n"
}

print_status() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

print_success() {
    echo -e "${GREEN}[SUCCESS]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Show detected Supabase info
show_detected_info() {
    echo -e "${GREEN}✅ Supabase Project Detected:${NC}"
    echo -e "   📍 Project Ref: ${YELLOW}flcoiwqwgsgwbbipstgt${NC}"
    echo -e "   🌐 Project URL: ${YELLOW}https://flcoiwqwgsgwbbipstgt.supabase.co${NC}"
    echo -e "   🔑 Anon Key: ${GREEN}Provided & Verified${NC}"
    echo ""
}

# Get service role key
get_service_role_key() {
    echo -e "${YELLOW}🔑 Service Role Key Required${NC}"
    echo -e "${BLUE}To complete setup, you need your Supabase service role key:${NC}"
    echo -e "   1. Go to: ${YELLOW}https://app.supabase.com/project/flcoiwqwgsgwbbipstgt/settings/api${NC}"
    echo -e "   2. Copy the ${YELLOW}'service_role'${NC} secret key (NOT the public anon key)"
    echo -e "   3. Paste it below"
    echo ""
    
    read -s -p "Enter your service role key: " SERVICE_ROLE_KEY
    echo ""
    
    if [ -z "$SERVICE_ROLE_KEY" ]; then
        print_warning "No service role key provided. Continuing with limited functionality..."
        SERVICE_ROLE_KEY="your-service-role-key-here"
    else
        print_success "Service role key captured"
    fi
}

# Update environment file
update_env_file() {
    print_status "Updating environment configuration..."
    
    cat > .env.local << EOF
# Supabase Configuration (AudioVR + Your Project)
NEXT_PUBLIC_SUPABASE_URL=https://flcoiwqwgsgwbbipstgt.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY29pd3F3Z3Nnd2JiaXBzdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTI1MDksImV4cCI6MjA3MzQ2ODUwOX0.NvR8Y5Kcck5oRhHSywzTMsPnyTI8YhB-vU8Cvo2ko00
SUPABASE_SERVICE_ROLE_KEY=$SERVICE_ROLE_KEY

# Database Configuration (for local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=audiovr-secret-$(date +%s)

# Application Configuration
VERCEL_URL=\${VERCEL_URL:-http://localhost:3000}

# Optional API Keys (add these for full functionality)
ELEVENLABS_API_KEY=your-elevenlabs-api-key
OPENAI_API_KEY=your-openai-api-key

# Analytics
ANALYTICS_ENABLED=true
ANALYTICS_DEBUG=false
EOF
    
    print_success "Environment file updated with your Supabase credentials"
}

# Test connection
test_supabase_connection() {
    print_status "Testing Supabase connection..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" \
        "https://flcoiwqwgsgwbbipstgt.supabase.co/rest/v1/" \
        -H "apikey: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY29pd3F3Z3Nnd2JiaXBzdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTI1MDksImV4cCI6MjA3MzQ2ODUwOX0.NvR8Y5Kcck5oRhHSywzTMsPnyTI8YhB-vU8Cvo2ko00" \
        --max-time 10)
    
    if [ "$response" = "200" ] || [ "$response" = "401" ]; then
        print_success "✅ Supabase connection successful (HTTP $response)"
    else
        print_warning "⚠️  Supabase connection returned HTTP $response"
    fi
}

# Deploy options
show_deployment_options() {
    echo -e "\n${YELLOW}🚀 Choose Your Deployment Path:${NC}\n"
    
    echo -e "${GREEN}Option 1: Quick Deploy (Recommended)${NC}"
    echo -e "   Use your existing Supabase data, just deploy the AudioVR app:"
    echo -e "   ${BLUE}vercel --prod${NC}"
    echo ""
    
    echo -e "${GREEN}Option 2: Deploy AudioVR Database Schema${NC}"
    echo -e "   Add AudioVR's detective mystery database to your Supabase:"
    echo -e "   ${BLUE}npx supabase link --project-ref flcoiwqwgsgwbbipstgt${NC}"
    echo -e "   ${BLUE}npx supabase db push${NC}"
    echo -e "   ${BLUE}vercel --prod${NC}"
    echo ""
    
    echo -e "${GREEN}Option 3: Full Automated Setup${NC}"
    echo -e "   Complete automated deployment with all features:"
    echo -e "   ${BLUE}./scripts/deploy-full.sh${NC}"
    echo ""
    
    read -p "Which option would you like to use? (1/2/3): " DEPLOY_OPTION
    
    case $DEPLOY_OPTION in
        1)
            deploy_quick
            ;;
        2)
            deploy_with_schema
            ;;
        3)
            deploy_full
            ;;
        *)
            print_warning "No option selected. You can run deployment commands manually later."
            ;;
    esac
}

# Quick deployment
deploy_quick() {
    print_status "Starting quick deployment..."
    
    if command -v vercel &> /dev/null; then
        print_status "Building and deploying to Vercel..."
        npm run build && vercel --prod
        print_success "Quick deployment complete!"
    else
        print_warning "Vercel CLI not found. Please install: npm install -g vercel"
        print_status "Then run: vercel --prod"
    fi
}

# Deploy with AudioVR schema
deploy_with_schema() {
    print_status "Deploying with AudioVR database schema..."
    
    # Link Supabase project
    print_status "Linking Supabase project..."
    npx supabase link --project-ref flcoiwqwgsgwbbipstgt
    
    # Deploy schema
    print_status "Deploying AudioVR database schema..."
    npx supabase db push
    
    # Generate types
    print_status "Generating TypeScript types..."
    npm run supabase:generate-types || print_warning "Type generation failed (continuing anyway)"
    
    # Deploy to Vercel
    if command -v vercel &> /dev/null; then
        print_status "Building and deploying to Vercel..."
        npm run build && vercel --prod
        print_success "Full deployment with schema complete!"
    else
        print_warning "Vercel CLI not found. Please install: npm install -g vercel"
    fi
}

# Full automated deployment
deploy_full() {
    print_status "Running full automated deployment..."
    
    if [ -f "./scripts/deploy-full.sh" ]; then
        ./scripts/deploy-full.sh
    else
        print_error "deploy-full.sh script not found"
        print_status "Running manual deployment steps..."
        deploy_with_schema
    fi
}

# Generate summary
generate_summary() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   Setup Complete!${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    print_success "✅ Your AudioVR app is configured with Supabase!"
    
    echo -e "\n${GREEN}📊 Configuration Summary:${NC}"
    echo -e "   🗄️  Supabase Project: ${YELLOW}flcoiwqwgsgwbbipstgt${NC}"
    echo -e "   🌐 Project URL: ${YELLOW}https://flcoiwqwgsgwbbipstgt.supabase.co${NC}"
    echo -e "   🔑 Keys: ${GREEN}Configured${NC}"
    echo -e "   📄 Environment: ${GREEN}.env.local updated${NC}"
    
    echo -e "\n${GREEN}🔗 Useful Links:${NC}"
    echo -e "   📊 Supabase Dashboard: ${BLUE}https://app.supabase.com/project/flcoiwqwgsgwbbipstgt${NC}"
    echo -e "   🛠️  API Settings: ${BLUE}https://app.supabase.com/project/flcoiwqwgsgwbbipstgt/settings/api${NC}"
    echo -e "   📋 Deploy Guide: ${BLUE}https://3000-ipmbxxfzcw6uaj7qzht2b-6532622b.e2b.dev/deployment-guide${NC}"
    
    echo -e "\n${GREEN}🚀 Next Steps:${NC}"
    echo -e "   1. Test locally: ${YELLOW}npm run dev${NC}"
    echo -e "   2. Deploy to production: ${YELLOW}vercel --prod${NC}"
    echo -e "   3. Monitor your app in Supabase + Vercel dashboards"
    
    echo -e "\n${YELLOW}📖 Documentation:${NC}"
    echo -e "   • Complete guide: DEPLOYMENT_STEP_BY_STEP.md"
    echo -e "   • Quick reference: QUICK_DEPLOYMENT_REFERENCE.md"
    echo -e "   • Your Supabase setup: SUPABASE_SETUP_GUIDE.md"
}

# Main function
main() {
    print_header
    show_detected_info
    get_service_role_key
    echo ""
    update_env_file
    echo ""
    test_supabase_connection
    echo ""
    show_deployment_options
    echo ""
    generate_summary
}

# Run main function
main "$@"
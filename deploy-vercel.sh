#!/bin/bash

# AudioVR Vercel + Supabase Deployment Script
# This script handles the complete deployment process for AudioVR

set -e  # Exit on any error

echo "🚀 AudioVR Deployment Script - Vercel + Supabase"
echo "================================================"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Function to print colored output
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

# Check if required tools are installed
check_requirements() {
    print_status "Checking deployment requirements..."
    
    # Check Node.js
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed. Please install Node.js 18+ and try again."
        exit 1
    fi
    
    # Check npm
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed. Please install npm and try again."
        exit 1
    fi
    
    # Check Vercel CLI
    if ! command -v vercel &> /dev/null; then
        print_warning "Vercel CLI not found. Installing globally..."
        npm install -g vercel
    fi
    
    # Check Supabase CLI
    if ! command -v supabase &> /dev/null; then
        print_warning "Supabase CLI not found. Installing globally..."
        npm install -g supabase
    fi
    
    print_success "All requirements satisfied"
}

# Install dependencies
install_dependencies() {
    print_status "Installing project dependencies..."
    
    if [ ! -f "package.json" ]; then
        print_error "package.json not found. Are you in the correct directory?"
        exit 1
    fi
    
    npm install
    print_success "Dependencies installed successfully"
}

# Build the project
build_project() {
    print_status "Building AudioVR project..."
    
    # Clean previous builds
    npm run clean 2>/dev/null || true
    
    # Run the build
    npm run build
    
    print_success "Project built successfully"
}

# Set up Supabase
setup_supabase() {
    print_status "Setting up Supabase..."
    
    # Check if Supabase project is initialized
    if [ ! -f "supabase/config.toml" ]; then
        print_warning "Supabase not initialized. Please set up your Supabase project first."
        print_status "Run: supabase init"
        print_status "Then: supabase link --project-ref your-project-ref"
        return 1
    fi
    
    # Run migrations
    print_status "Applying database migrations..."
    supabase db push
    
    # Generate TypeScript types
    print_status "Generating TypeScript types..."
    supabase gen types typescript --local > src/types/supabase.ts
    
    print_success "Supabase setup completed"
}

# Deploy to Vercel
deploy_to_vercel() {
    print_status "Deploying to Vercel..."
    
    # Check if user is logged in to Vercel
    if ! vercel whoami &> /dev/null; then
        print_status "Please log in to Vercel:"
        vercel login
    fi
    
    # Deploy to production
    print_status "Deploying to production..."
    vercel --prod
    
    print_success "Deployment to Vercel completed!"
}

# Set up environment variables
setup_env_vars() {
    print_status "Setting up environment variables..."
    
    if [ ! -f ".env.local" ]; then
        print_warning ".env.local not found. Creating from example..."
        if [ -f ".env.local.example" ]; then
            cp .env.local.example .env.local
            print_warning "Please edit .env.local with your actual values before proceeding."
            print_warning "Required variables:"
            echo "  - NEXT_PUBLIC_SUPABASE_URL"
            echo "  - NEXT_PUBLIC_SUPABASE_ANON_KEY"
            echo "  - SUPABASE_SERVICE_ROLE_KEY"
            echo "  - ELEVENLABS_API_KEY (optional)"
            read -p "Press enter when you've configured .env.local..."
        else
            print_error ".env.local.example not found. Please create environment configuration."
            exit 1
        fi
    fi
    
    print_success "Environment variables configured"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Get the deployment URL from Vercel
    DEPLOY_URL=$(vercel ls | grep "audiovr-web" | head -1 | awk '{print $2}')
    
    if [ -z "$DEPLOY_URL" ]; then
        print_warning "Could not determine deployment URL automatically"
        return 0
    fi
    
    print_status "Testing deployment at: https://$DEPLOY_URL"
    
    # Test the main page
    if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL" | grep -q "200"; then
        print_success "Main page is accessible"
    else
        print_warning "Main page test failed"
    fi
    
    # Test API endpoint
    if curl -s -o /dev/null -w "%{http_code}" "https://$DEPLOY_URL/api/analytics/dashboard" | grep -q "200\|401"; then
        print_success "API endpoints are accessible"
    else
        print_warning "API endpoint test failed"
    fi
    
    print_success "Deployment verification completed"
    print_success "🎉 AudioVR is live at: https://$DEPLOY_URL"
}

# Main deployment flow
main() {
    echo
    print_status "Starting AudioVR deployment process..."
    echo
    
    # Step 1: Check requirements
    check_requirements
    echo
    
    # Step 2: Set up environment
    setup_env_vars
    echo
    
    # Step 3: Install dependencies
    install_dependencies
    echo
    
    # Step 4: Set up Supabase (optional, may already be done)
    setup_supabase || print_warning "Supabase setup skipped - please ensure it's configured"
    echo
    
    # Step 5: Build project
    build_project
    echo
    
    # Step 6: Deploy to Vercel
    deploy_to_vercel
    echo
    
    # Step 7: Verify deployment
    verify_deployment
    echo
    
    print_success "🎉 AudioVR deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "  1. Update your mobile app API endpoints to use the new Vercel URL"
    echo "  2. Configure custom domain in Vercel dashboard (if desired)"
    echo "  3. Set up monitoring and analytics"
    echo "  4. Run accessibility tests on the live site"
    echo
    print_status "Documentation: https://github.com/your-org/audiovr-web"
    print_status "Dashboard: https://$DEPLOY_URL/analytics-dashboard.html"
    print_status "Demo: https://$DEPLOY_URL/demo"
}

# Handle script interruption
trap 'print_error "Deployment interrupted"; exit 1' INT TERM

# Run main function
main "$@"
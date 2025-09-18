#!/bin/bash

# Full deployment script for AudioVR Web Application
# This script handles both Supabase and Vercel deployment

set -e  # Exit on any error

echo "🚀 Starting full deployment for AudioVR Web Application..."

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
check_dependencies() {
    print_status "Checking dependencies..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please run: npm install -g vercel"
        exit 1
    fi
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please run: npm install -g supabase"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Check environment variables
check_env_vars() {
    print_status "Checking environment variables..."
    
    required_vars=(
        "NEXT_PUBLIC_SUPABASE_URL"
        "NEXT_PUBLIC_SUPABASE_ANON_KEY"
        "SUPABASE_SERVICE_ROLE_KEY"
    )
    
    missing_vars=()
    
    for var in "${required_vars[@]}"; do
        if [ -z "${!var}" ]; then
            missing_vars+=("$var")
        fi
    done
    
    if [ ${#missing_vars[@]} -ne 0 ]; then
        print_error "Missing required environment variables:"
        for var in "${missing_vars[@]}"; do
            echo "  - $var"
        done
        print_warning "Please set these variables in your .env.local file or Vercel dashboard"
        exit 1
    fi
    
    print_success "Environment variables are configured"
}

# Build the application
build_app() {
    print_status "Building Next.js application..."
    
    if ! npm run build; then
        print_error "Build failed"
        exit 1
    fi
    
    print_success "Application built successfully"
}

# Deploy database migrations
deploy_database() {
    print_status "Deploying Supabase migrations..."
    
    # Check if linked to a project
    if ! supabase status &> /dev/null; then
        print_warning "Not linked to a Supabase project. Please run: supabase link"
        return 1
    fi
    
    # Run migrations
    if ! supabase db push; then
        print_error "Database migration failed"
        exit 1
    fi
    
    # Generate types
    if ! npm run supabase:generate-types; then
        print_warning "Failed to generate TypeScript types"
    fi
    
    print_success "Database migrations deployed"
}

# Deploy to Vercel
deploy_vercel() {
    print_status "Deploying to Vercel..."
    
    # Deploy to production
    if ! vercel --prod --yes; then
        print_error "Vercel deployment failed"
        exit 1
    fi
    
    print_success "Deployed to Vercel successfully"
}

# Main deployment function
main() {
    echo "============================================"
    echo "   AudioVR Web Application Deployment"
    echo "============================================"
    echo ""
    
    check_dependencies
    echo ""
    
    check_env_vars
    echo ""
    
    build_app
    echo ""
    
    if deploy_database; then
        echo ""
    else
        print_warning "Skipping database deployment"
        echo ""
    fi
    
    deploy_vercel
    echo ""
    
    print_success "🎉 Deployment completed successfully!"
    echo ""
    echo "Your application is now live at:"
    vercel ls | grep "audiovr-web" | head -1 | awk '{print "https://" $2}'
    echo ""
    echo "Next steps:"
    echo "1. Verify the deployment is working correctly"
    echo "2. Check Supabase dashboard for database status"
    echo "3. Test accessibility features"
    echo "4. Monitor application logs"
}

# Run main function
main "$@"
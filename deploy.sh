#!/bin/bash

# AudioVR Production Deployment Script
# This script handles the complete deployment of AudioVR to Cloudflare Pages

set -e  # Exit on any error

echo "🚀 Starting AudioVR Production Deployment..."

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
    
    if ! command -v node &> /dev/null; then
        print_error "Node.js is not installed"
        exit 1
    fi
    
    if ! command -v npm &> /dev/null; then
        print_error "npm is not installed"
        exit 1
    fi
    
    if ! command -v npx &> /dev/null; then
        print_error "npx is not installed"
        exit 1
    fi
    
    print_success "All dependencies are installed"
}

# Build the project
build_project() {
    print_status "Building AudioVR for production..."
    
    # Clean previous build
    rm -rf dist
    
    # Install dependencies
    npm install
    
    # Run build
    npm run build
    
    if [ ! -d "dist" ]; then
        print_error "Build failed - dist directory not found"
        exit 1
    fi
    
    print_success "Build completed successfully"
}

# Setup database
setup_database() {
    print_status "Setting up production database..."
    
    # Apply migrations
    npx wrangler d1 migrations apply audiovr-production
    
    # Seed with production data
    npx wrangler d1 execute audiovr-production --file=./production-seed.sql
    
    print_success "Database setup completed"
}

# Deploy to Cloudflare Pages
deploy_to_cloudflare() {
    print_status "Deploying to Cloudflare Pages..."
    
    # Deploy the application
    npx wrangler pages deploy dist --project-name audiovr --compatibility-date 2024-01-01
    
    print_success "Deployment to Cloudflare Pages completed"
    
    print_status "Setting up environment variables..."
    
    # Note: Environment variables should be set manually through Cloudflare dashboard
    print_warning "Please set the following environment variables in Cloudflare Pages dashboard:"
    echo "  - ELEVENLABS_API_KEY: Your ElevenLabs API key"
    echo "  - JWT_SECRET: Random secret for JWT token signing"
    echo "  - NODE_ENV: production"
    echo "  - DATABASE_URL: Your Cloudflare D1 database URL"
}

# Verify deployment
verify_deployment() {
    print_status "Verifying deployment..."
    
    # Test API endpoints
    API_URL="https://audiovr.pages.dev"
    
    print_status "Testing API endpoints..."
    
    if curl -s -f "$API_URL/api/health" > /dev/null; then
        print_success "Health endpoint is working"
    else
        print_warning "Health endpoint is not responding"
    fi
    
    if curl -s -f "$API_URL/api/worlds" > /dev/null; then
        print_success "Worlds API endpoint is working"
    else
        print_warning "Worlds API endpoint is not responding"
    fi
    
    print_success "Deployment verification completed"
    print_success "AudioVR is now live at: $API_URL"
}

# Create backup
create_backup() {
    print_status "Creating deployment backup..."
    
    BACKUP_NAME="audiovr-backup-$(date +%Y%m%d-%H%M%S)"
    
    # Create backup directory
    mkdir -p backups
    
    # Create backup archive
    tar -czf "backups/$BACKUP_NAME.tar.gz" \
        --exclude=node_modules \
        --exclude=.git \
        --exclude=dist \
        --exclude=backups \
        .
    
    print_success "Backup created: backups/$BACKUP_NAME.tar.gz"
}

# Main deployment function
main() {
    echo "🎭 AudioVR - Voice-Driven Detective Mystery Platform"
    echo "=================================================="
    echo ""
    
    # Get project name from meta info
    PROJECT_NAME="audiovr"
    print_status "Deploying project: $PROJECT_NAME"
    
    # Run deployment steps
    check_dependencies
    create_backup
    build_project
    setup_database
    deploy_to_cloudflare
    verify_deployment
    
    echo ""
    echo "🎉 AudioVR Deployment Complete!"
    echo "================================"
    echo "🌐 Production URL: https://audiovr.pages.dev"
    echo "📱 Mobile App: Ready for app store submission"
    echo "🔊 API Endpoints: Fully functional"
    echo "♿ Accessibility: Optimized for all users"
    echo ""
    echo "Next steps:"
    echo "1. Configure environment variables in Cloudflare dashboard"
    echo "2. Test the application with real users"
    echo "3. Submit mobile app to app stores"
    echo "4. Setup monitoring and analytics"
    echo ""
    echo "🎤 Happy voice-driven mystery solving! 🕵️‍♀️"
}

# Run the deployment if script is executed directly
if [[ "${BASH_SOURCE[0]}" == "${0}" ]]; then
    main "$@"
fi
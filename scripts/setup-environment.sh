#!/bin/bash

# AudioVR Web Application - Environment Setup Script
# This script helps set up all required environment variables

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   AudioVR Environment Setup${NC}"
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

# Check if required tools are available
check_prerequisites() {
    print_status "Checking prerequisites..."
    
    if ! command -v vercel &> /dev/null; then
        print_error "Vercel CLI is not installed. Please run: npm install -g vercel"
        exit 1
    fi
    
    if ! command -v supabase &> /dev/null; then
        print_error "Supabase CLI is not installed. Please run: npm install -g supabase"
        exit 1
    fi
    
    print_success "All prerequisites are installed"
}

# Collect Supabase credentials
setup_supabase_env() {
    echo -e "\n${YELLOW}========== Supabase Setup ==========${NC}\n"
    
    print_status "Setting up Supabase environment variables..."
    
    echo -e "${YELLOW}Please provide your Supabase project details:${NC}"
    echo -e "${BLUE}You can find these in: Supabase Dashboard → Your Project → Settings → API${NC}\n"
    
    # Project URL
    echo -e "${YELLOW}1. Supabase Project URL${NC}"
    echo -e "   Format: https://your-project-ref.supabase.co"
    read -p "   Enter your Supabase URL: " SUPABASE_URL
    
    # Validate URL format
    if [[ ! "$SUPABASE_URL" =~ ^https://.*\.supabase\.co$ ]]; then
        print_error "Invalid Supabase URL format. Should be: https://your-ref.supabase.co"
        exit 1
    fi
    
    # Anonymous Key
    echo -e "\n${YELLOW}2. Anonymous Public Key${NC}"
    echo -e "   This key is safe to use in client-side code"
    read -p "   Enter your anon key: " SUPABASE_ANON_KEY
    
    # Service Role Key
    echo -e "\n${YELLOW}3. Service Role Key${NC}"
    echo -e "   ${RED}⚠️  This key should be kept secret!${NC}"
    read -s -p "   Enter your service role key: " SUPABASE_SERVICE_KEY
    echo ""
    
    # Store in local env file
    cat > .env.local << EOF
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=$SUPABASE_URL
NEXT_PUBLIC_SUPABASE_ANON_KEY=$SUPABASE_ANON_KEY
SUPABASE_SERVICE_ROLE_KEY=$SUPABASE_SERVICE_KEY

# Database Configuration (for local development)
DATABASE_URL=postgresql://postgres:postgres@localhost:54322/postgres

# Auth Configuration
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=$(openssl rand -base64 32 2>/dev/null || echo "your-random-secret-$(date +%s)")

# Application Configuration
VERCEL_URL=\${VERCEL_URL:-http://localhost:3000}
EOF
    
    print_success "Supabase environment variables saved to .env.local"
}

# Setup Vercel environment variables
setup_vercel_env() {
    echo -e "\n${YELLOW}========== Vercel Setup ==========${NC}\n"
    
    print_status "Setting up Vercel environment variables..."
    
    echo -e "${YELLOW}This will add environment variables to your Vercel project.${NC}"
    echo -e "${YELLOW}Make sure you're logged in to Vercel CLI.${NC}\n"
    
    # Check if logged in
    if ! vercel whoami &> /dev/null; then
        print_warning "Not logged in to Vercel. Logging in now..."
        vercel login
    fi
    
    print_status "Adding Supabase variables to Vercel..."
    
    # Add Supabase URL
    echo "$SUPABASE_URL" | vercel env add NEXT_PUBLIC_SUPABASE_URL production preview development --force
    print_success "Added NEXT_PUBLIC_SUPABASE_URL"
    
    # Add Supabase Anon Key
    echo "$SUPABASE_ANON_KEY" | vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY production preview development --force
    print_success "Added NEXT_PUBLIC_SUPABASE_ANON_KEY"
    
    # Add Supabase Service Role Key
    echo "$SUPABASE_SERVICE_KEY" | vercel env add SUPABASE_SERVICE_ROLE_KEY production preview development --force
    print_success "Added SUPABASE_SERVICE_ROLE_KEY"
}

# Setup optional API keys
setup_optional_apis() {
    echo -e "\n${YELLOW}========== Optional API Keys ==========${NC}\n"
    
    print_status "Setting up optional third-party API keys..."
    
    echo -e "${YELLOW}These are optional but recommended for full functionality:${NC}\n"
    
    # ElevenLabs API Key
    echo -e "${YELLOW}1. ElevenLabs API Key (for AI voice generation)${NC}"
    echo -e "   Get your key from: https://elevenlabs.io/api"
    read -p "   Enter your ElevenLabs API key (or press Enter to skip): " ELEVENLABS_KEY
    
    if [ -n "$ELEVENLABS_KEY" ]; then
        echo "ELEVENLABS_API_KEY=$ELEVENLABS_KEY" >> .env.local
        echo "$ELEVENLABS_KEY" | vercel env add ELEVENLABS_API_KEY production preview development --force
        print_success "Added ElevenLabs API key"
    else
        print_warning "Skipped ElevenLabs API key"
    fi
    
    # OpenAI API Key
    echo -e "\n${YELLOW}2. OpenAI API Key (for AI features)${NC}"
    echo -e "   Get your key from: https://platform.openai.com/api-keys"
    read -p "   Enter your OpenAI API key (or press Enter to skip): " OPENAI_KEY
    
    if [ -n "$OPENAI_KEY" ]; then
        echo "OPENAI_API_KEY=$OPENAI_KEY" >> .env.local
        echo "$OPENAI_KEY" | vercel env add OPENAI_API_KEY production preview development --force
        print_success "Added OpenAI API key"
    else
        print_warning "Skipped OpenAI API key"
    fi
}

# Test environment setup
test_environment() {
    echo -e "\n${YELLOW}========== Testing Environment ==========${NC}\n"
    
    print_status "Testing environment configuration..."
    
    # Test Supabase connection
    if command -v supabase &> /dev/null && [ -n "$SUPABASE_URL" ]; then
        print_status "Testing Supabase connection..."
        
        local test_response=$(curl -s -o /dev/null -w "%{http_code}" "$SUPABASE_URL/rest/v1/" \
            -H "apikey: $SUPABASE_ANON_KEY" \
            --max-time 10 2>/dev/null || echo "000")
        
        if [ "$test_response" = "200" ] || [ "$test_response" = "401" ]; then
            print_success "Supabase connection successful"
        else
            print_warning "Supabase connection test failed (HTTP $test_response)"
        fi
    fi
    
    # Test local build
    print_status "Testing local build..."
    
    if npm run type-check &> /dev/null; then
        print_success "TypeScript compilation successful"
    else
        print_warning "TypeScript compilation has issues"
    fi
    
    # Generate Supabase types
    print_status "Generating Supabase types..."
    
    if npm run supabase:generate-types &> /dev/null; then
        print_success "Supabase types generated successfully"
    else
        print_warning "Failed to generate Supabase types (this is normal if not linked to project yet)"
    fi
}

# Generate summary report
generate_summary() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   Environment Setup Complete${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    print_success "Environment variables configured successfully!"
    
    echo -e "\n${GREEN}✅ Local Environment:${NC}"
    echo "   • .env.local file created with all necessary variables"
    echo "   • Supabase configuration ready"
    echo "   • Authentication secrets generated"
    
    echo -e "\n${GREEN}✅ Vercel Environment:${NC}"
    echo "   • Production environment variables set"
    echo "   • Preview environment variables set"
    echo "   • Development environment variables set"
    
    echo -e "\n${YELLOW}📋 Next Steps:${NC}"
    echo "1. Link your Supabase project:"
    echo "   supabase link --project-ref YOUR_PROJECT_REF"
    echo ""
    echo "2. Deploy your database schema:"
    echo "   supabase db push"
    echo ""
    echo "3. Test local development:"
    echo "   npm run dev"
    echo ""
    echo "4. Deploy to production:"
    echo "   ./scripts/deploy-full.sh"
    
    echo -e "\n${YELLOW}🔐 Security Reminder:${NC}"
    echo "• Never commit .env.local to git (it's in .gitignore)"
    echo "• Keep your service role key secret"
    echo "• Rotate API keys regularly"
    echo "• Monitor usage in respective dashboards"
    
    echo -e "\n${YELLOW}📖 Documentation:${NC}"
    echo "• Full deployment guide: DEPLOYMENT_STEP_BY_STEP.md"
    echo "• Vercel + Supabase setup: VERCEL_SUPABASE_SETUP.md"
    echo "• Troubleshooting: Check the docs above"
}

# Main setup function
main() {
    print_header
    
    check_prerequisites
    echo ""
    
    setup_supabase_env
    echo ""
    
    setup_vercel_env
    echo ""
    
    setup_optional_apis
    echo ""
    
    test_environment
    echo ""
    
    generate_summary
}

# Run main function
main "$@"
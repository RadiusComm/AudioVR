#!/bin/bash

# AudioVR Web Application - Deployment Verification Script
# This script verifies that your deployment is working correctly

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

print_header() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   AudioVR Deployment Verification${NC}"
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
check_tools() {
    print_status "Checking required tools..."
    
    if ! command -v curl &> /dev/null; then
        print_error "curl is required but not installed"
        exit 1
    fi
    
    if ! command -v jq &> /dev/null; then
        print_warning "jq not found - JSON response formatting will be limited"
    fi
    
    print_success "Required tools are available"
}

# Get deployment URL from Vercel
get_deployment_url() {
    print_status "Getting deployment URL..."
    
    if [ -f ".vercel/project.json" ]; then
        local project_name=$(jq -r '.name' .vercel/project.json 2>/dev/null || echo "")
        if [ -n "$project_name" ]; then
            # Try to get the production URL
            DEPLOYMENT_URL=$(vercel ls --scope="$(vercel whoami 2>/dev/null)" 2>/dev/null | grep "$project_name" | grep -E "https://[^[:space:]]+" -o | head -1 || echo "")
        fi
    fi
    
    # Fallback: ask user for URL
    if [ -z "$DEPLOYMENT_URL" ]; then
        echo -e "${YELLOW}Please enter your deployment URL:${NC}"
        read -p "URL (e.g., https://audiovr-web.vercel.app): " DEPLOYMENT_URL
    fi
    
    # Validate URL format
    if [[ ! "$DEPLOYMENT_URL" =~ ^https?:// ]]; then
        print_error "Invalid URL format: $DEPLOYMENT_URL"
        exit 1
    fi
    
    print_success "Deployment URL: $DEPLOYMENT_URL"
}

# Test basic connectivity
test_basic_connectivity() {
    print_status "Testing basic connectivity..."
    
    local response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL" --max-time 10)
    
    if [ "$response" = "200" ]; then
        print_success "Website is accessible (HTTP $response)"
    elif [ "$response" = "404" ]; then
        print_error "Website returned 404 - check if deployment is complete"
        return 1
    else
        print_error "Website returned HTTP $response - there may be an issue"
        return 1
    fi
}

# Test API endpoints
test_api_endpoints() {
    print_status "Testing API endpoints..."
    
    # Test analytics dashboard endpoint
    local analytics_response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/analytics/dashboard" --max-time 10)
    
    if [ "$analytics_response" = "200" ]; then
        print_success "Analytics API endpoint is working (HTTP $analytics_response)"
    else
        print_warning "Analytics API returned HTTP $analytics_response"
    fi
    
    # Test mysteries endpoint with sample ID
    local mysteries_response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/api/mysteries/test-id" --max-time 10)
    
    if [ "$mysteries_response" = "200" ]; then
        print_success "Mysteries API endpoint is working (HTTP $mysteries_response)"
    else
        print_warning "Mysteries API returned HTTP $mysteries_response (this may be expected if no test data exists)"
    fi
}

# Test static assets
test_static_assets() {
    print_status "Testing static assets..."
    
    # Test favicon
    local favicon_response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/favicon.ico" --max-time 10)
    
    if [ "$favicon_response" = "200" ]; then
        print_success "Favicon is accessible (HTTP $favicon_response)"
    else
        print_warning "Favicon returned HTTP $favicon_response"
    fi
    
    # Test if _next static files are accessible (Next.js build assets)
    local next_response=$(curl -s -o /dev/null -w "%{http_code}" "$DEPLOYMENT_URL/_next/static/" --max-time 10)
    
    if [ "$next_response" = "200" ] || [ "$next_response" = "403" ]; then
        print_success "Next.js static assets are configured"
    else
        print_warning "Next.js static assets may have issues (HTTP $next_response)"
    fi
}

# Test security headers
test_security_headers() {
    print_status "Testing security headers..."
    
    local headers=$(curl -s -I "$DEPLOYMENT_URL" --max-time 10)
    
    if echo "$headers" | grep -i "x-frame-options" > /dev/null; then
        print_success "X-Frame-Options header is set"
    else
        print_warning "X-Frame-Options header is missing"
    fi
    
    if echo "$headers" | grep -i "x-content-type-options" > /dev/null; then
        print_success "X-Content-Type-Options header is set"
    else
        print_warning "X-Content-Type-Options header is missing"
    fi
    
    if echo "$headers" | grep -i "strict-transport-security" > /dev/null; then
        print_success "Strict-Transport-Security header is set"
    else
        print_warning "HSTS header is missing (normal for non-HTTPS)"
    fi
}

# Test performance
test_performance() {
    print_status "Testing performance..."
    
    local start_time=$(date +%s%3N)
    local response=$(curl -s -o /dev/null -w "%{time_total}" "$DEPLOYMENT_URL" --max-time 30)
    local end_time=$(date +%s%3N)
    
    local response_time=$(echo "$response * 1000" | bc 2>/dev/null || echo "$response")
    
    if (( $(echo "$response < 2.0" | bc -l 2>/dev/null || echo "0") )); then
        print_success "Response time: ${response}s (Good)"
    elif (( $(echo "$response < 5.0" | bc -l 2>/dev/null || echo "0") )); then
        print_warning "Response time: ${response}s (Acceptable)"
    else
        print_warning "Response time: ${response}s (Slow)"
    fi
}

# Check Supabase connection (if URL is available)
test_supabase_connection() {
    print_status "Testing Supabase connection..."
    
    if [ -f ".env.local" ] && grep -q "NEXT_PUBLIC_SUPABASE_URL" .env.local; then
        local supabase_url=$(grep "NEXT_PUBLIC_SUPABASE_URL" .env.local | cut -d'=' -f2)
        
        if [ -n "$supabase_url" ] && [[ "$supabase_url" =~ ^https?:// ]]; then
            local supabase_response=$(curl -s -o /dev/null -w "%{http_code}" "$supabase_url/rest/v1/" --max-time 10)
            
            if [ "$supabase_response" = "200" ] || [ "$supabase_response" = "401" ]; then
                print_success "Supabase API is accessible (HTTP $supabase_response)"
            else
                print_warning "Supabase API returned HTTP $supabase_response"
            fi
        else
            print_warning "Supabase URL not found or invalid in .env.local"
        fi
    else
        print_warning "Cannot test Supabase connection - .env.local not found"
    fi
}

# Generate verification report
generate_report() {
    echo -e "\n${BLUE}========================================${NC}"
    echo -e "${BLUE}   Verification Complete${NC}"
    echo -e "${BLUE}========================================${NC}\n"
    
    echo -e "${GREEN}✅ Deployment URL:${NC} $DEPLOYMENT_URL"
    echo -e "${GREEN}✅ Timestamp:${NC} $(date)"
    
    echo -e "\n${YELLOW}Next Steps:${NC}"
    echo "1. Test user registration and login"
    echo "2. Verify all features work as expected"
    echo "3. Check browser console for any JavaScript errors"
    echo "4. Test accessibility features"
    echo "5. Monitor application performance"
    
    echo -e "\n${YELLOW}Monitoring Resources:${NC}"
    echo "• Vercel Dashboard: https://vercel.com/dashboard"
    echo "• Supabase Dashboard: https://app.supabase.com"
    echo "• Application URL: $DEPLOYMENT_URL"
    
    echo -e "\n${YELLOW}Troubleshooting:${NC}"
    echo "• Check deployment logs: vercel logs"
    echo "• View build logs in Vercel dashboard"
    echo "• Monitor Supabase logs in dashboard"
    echo "• Review DEPLOYMENT_STEP_BY_STEP.md for issues"
}

# Main verification function
main() {
    print_header
    
    check_tools
    echo ""
    
    get_deployment_url
    echo ""
    
    test_basic_connectivity || exit 1
    echo ""
    
    test_api_endpoints
    echo ""
    
    test_static_assets
    echo ""
    
    test_security_headers
    echo ""
    
    test_performance
    echo ""
    
    test_supabase_connection
    echo ""
    
    generate_report
}

# Run main function
main "$@"
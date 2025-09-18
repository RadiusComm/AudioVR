#!/bin/bash

# Test script to verify all deployment documentation is accessible

echo "🔍 Testing AudioVR Deployment Documentation Access..."
echo "=================================================="

BASE_URL="http://localhost:3000"

# Test endpoints
endpoints=(
    "/ (Main Page)"
    "/deployment-guide (Interactive Guide)"
    "/deployment.html (Static Guide)" 
    "/DEPLOYMENT_STEP_BY_STEP.md (Step-by-Step)"
    "/QUICK_DEPLOYMENT_REFERENCE.md (Quick Reference)"
    "/VERCEL_SUPABASE_SETUP.md (Vercel+Supabase)"
    "/DEPLOYMENT_CHECKLIST.md (Checklist)"
)

echo "Testing endpoints:"
echo ""

success_count=0
total_count=${#endpoints[@]}

for endpoint_info in "${endpoints[@]}"; do
    IFS=' (' read -r endpoint description <<< "$endpoint_info"
    
    # Remove trailing parenthesis
    description=${description%)}
    
    response=$(curl -s -o /dev/null -w "%{http_code}" "$BASE_URL$endpoint" --max-time 5)
    
    if [ "$response" = "200" ]; then
        echo "✅ $endpoint - $description (HTTP $response)"
        ((success_count++))
    else
        echo "❌ $endpoint - $description (HTTP $response)"
    fi
done

echo ""
echo "=================================================="
echo "Results: $success_count/$total_count endpoints working"

if [ "$success_count" = "$total_count" ]; then
    echo "🎉 All deployment documentation is accessible!"
    echo ""
    echo "📖 Available documentation:"
    echo "   • Interactive Guide: $BASE_URL/deployment-guide"
    echo "   • Static HTML Page: $BASE_URL/deployment.html"
    echo "   • Step-by-Step Guide: $BASE_URL/DEPLOYMENT_STEP_BY_STEP.md"
    echo "   • Quick Reference: $BASE_URL/QUICK_DEPLOYMENT_REFERENCE.md"
    echo "   • Vercel+Supabase Setup: $BASE_URL/VERCEL_SUPABASE_SETUP.md"
    echo "   • Deployment Checklist: $BASE_URL/DEPLOYMENT_CHECKLIST.md"
    echo ""
    echo "🚀 Your AudioVR deployment documentation is ready!"
else
    echo "⚠️  Some endpoints are not working. Check the server status."
fi
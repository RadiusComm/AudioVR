#!/bin/bash

echo "🚀 Deploying AudioVR to Vercel..."

# Clean build directory
rm -rf .next
rm -rf out

# Build for production
echo "Building for production..."
npm run build

echo "✅ Build complete!"
echo ""
echo "📋 Next steps:"
echo "1. Go to https://vercel.com/new"
echo "2. Click 'Upload' tab (not GitHub import)"
echo "3. Upload your project folder"
echo "4. Use project name: audiovr-mystery-2024"
echo "5. Add your environment variables"
echo "6. Click Deploy"
echo ""
echo "🔑 Environment Variables to add:"
echo "NEXT_PUBLIC_SUPABASE_URL = https://flcoiwqwgsgwbbipstgt.supabase.co"
echo "NEXT_PUBLIC_SUPABASE_ANON_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY29pd3F3Z3Nnd2JiaXBzdGd0Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTc4OTI1MDksImV4cCI6MjA3MzQ2ODUwOX0.NvR8Y5Kcck5oRhHSywzTMsPnyTI8YhB-vU8Cvo2ko00"
echo "SUPABASE_SERVICE_ROLE_KEY = eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZsY29pd3F3Z3Nnd2JiaXBzdGd0Iiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1Nzg5MjUwOSwiZXhwIjoyMDczNDY4NTA5fQ.Ate6JbsLraw7L-c0Ra7hNyPazeI8eyqpOZMxxgKPw3Y"
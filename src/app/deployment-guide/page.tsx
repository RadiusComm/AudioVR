'use client';

import { useState } from 'react';

export default function DeploymentGuidePage() {
  const [activeGuide, setActiveGuide] = useState('step-by-step');

  const guides = {
    'step-by-step': {
      title: 'Step-by-Step Deployment Guide',
      description: 'Complete walkthrough for deploying AudioVR with Vercel and Supabase',
      file: 'DEPLOYMENT_STEP_BY_STEP.md'
    },
    'quick-reference': {
      title: 'Quick Reference',
      description: 'Quick commands and reference for experienced developers',
      file: 'QUICK_DEPLOYMENT_REFERENCE.md'
    },
    'vercel-supabase': {
      title: 'Vercel + Supabase Setup',
      description: 'Detailed configuration guide for Vercel and Supabase integration',
      file: 'VERCEL_SUPABASE_SETUP.md'
    },
    'checklist': {
      title: 'Deployment Checklist',
      description: 'Comprehensive checklist to ensure successful deployment',
      file: 'DEPLOYMENT_CHECKLIST.md'
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto py-12 px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-gray-900 mb-4">
            🚀 AudioVR Deployment Guides
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Complete documentation for deploying your AudioVR detective mystery platform 
            using Vercel and Supabase. Choose your preferred guide below.
          </p>
        </div>

        {/* Navigation */}
        <div className="flex flex-wrap justify-center gap-4 mb-8">
          {Object.entries(guides).map(([key, guide]) => (
            <button
              key={key}
              onClick={() => setActiveGuide(key)}
              className={`px-6 py-3 rounded-lg font-medium transition-colors ${
                activeGuide === key
                  ? 'bg-blue-600 text-white'
                  : 'bg-white text-gray-700 border border-gray-300 hover:bg-gray-50'
              }`}
            >
              {guide.title}
            </button>
          ))}
        </div>

        {/* Guide Content */}
        <div className="bg-white rounded-lg shadow-lg overflow-hidden">
          <div className="p-8">
            <div className="mb-6">
              <h2 className="text-2xl font-bold text-gray-900 mb-2">
                {guides[activeGuide as keyof typeof guides].title}
              </h2>
              <p className="text-gray-600">
                {guides[activeGuide as keyof typeof guides].description}
              </p>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <div className="bg-blue-50 p-6 rounded-lg">
                <h3 className="font-semibold text-blue-900 mb-2">🚀 Quick Start</h3>
                <p className="text-blue-700 text-sm mb-4">
                  Deploy in 30 minutes with automated scripts
                </p>
                <code className="text-xs bg-blue-100 p-2 rounded block">
                  ./scripts/setup-environment.sh
                </code>
              </div>
              
              <div className="bg-green-50 p-6 rounded-lg">
                <h3 className="font-semibold text-green-900 mb-2">📋 Checklist</h3>
                <p className="text-green-700 text-sm mb-4">
                  Verify your deployment step by step
                </p>
                <code className="text-xs bg-green-100 p-2 rounded block">
                  ./scripts/verify-deployment.sh
                </code>
              </div>
              
              <div className="bg-yellow-50 p-6 rounded-lg">
                <h3 className="font-semibold text-yellow-900 mb-2">📖 Docs</h3>
                <p className="text-yellow-700 text-sm mb-4">
                  Access complete documentation files
                </p>
                <a 
                  href={`/${guides[activeGuide as keyof typeof guides].file}`}
                  target="_blank"
                  className="text-xs bg-yellow-100 p-2 rounded block text-center hover:bg-yellow-200 transition-colors"
                >
                  Open {guides[activeGuide as keyof typeof guides].file}
                </a>
              </div>
            </div>

            {/* Guide Selection */}
            <div className="space-y-4">
              {activeGuide === 'step-by-step' && (
                <div className="prose max-w-none">
                  <h3>Complete Step-by-Step Deployment (30-45 minutes)</h3>
                  <p>This comprehensive guide walks you through:</p>
                  <ul>
                    <li><strong>Part 1:</strong> Supabase Backend Setup (15 min)</li>
                    <li><strong>Part 2:</strong> Vercel Frontend Setup (10 min)</li>
                    <li><strong>Part 3:</strong> Environment Configuration (10 min)</li>
                    <li><strong>Part 4:</strong> Production Deployment (10 min)</li>
                  </ul>
                  
                  <div className="bg-blue-50 p-4 rounded-lg my-6">
                    <h4 className="text-blue-900 font-semibold mb-2">Prerequisites</h4>
                    <ul className="text-blue-800 text-sm">
                      <li>✅ Node.js 18+ installed</li>
                      <li>✅ GitHub account</li>
                      <li>✅ Stable internet connection</li>
                    </ul>
                  </div>
                  
                  <div className="bg-gray-100 p-4 rounded-lg">
                    <h4 className="font-semibold mb-2">Quick Commands</h4>
                    <pre className="text-sm"><code>{`# 1. Setup environment (interactive)
./scripts/setup-environment.sh

# 2. Deploy to production
./scripts/deploy-full.sh

# 3. Verify deployment
./scripts/verify-deployment.sh`}</code></pre>
                  </div>
                </div>
              )}

              {activeGuide === 'quick-reference' && (
                <div className="prose max-w-none">
                  <h3>Quick Reference for Experienced Developers</h3>
                  <p>Fast deployment reference with essential commands and credentials.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">Required Accounts</h4>
                      <ul className="text-sm space-y-1">
                        <li>🗄️ <a href="https://app.supabase.com" target="_blank" className="text-blue-600 hover:underline">Supabase</a> - Database & Auth</li>
                        <li>🌐 <a href="https://vercel.com" target="_blank" className="text-blue-600 hover:underline">Vercel</a> - Hosting & Deployment</li>
                        <li>🐙 <a href="https://github.com" target="_blank" className="text-blue-600 hover:underline">GitHub</a> - Source Control</li>
                      </ul>
                    </div>
                    
                    <div className="bg-gray-50 p-4 rounded-lg">
                      <h4 className="font-semibold mb-2">CLI Installation</h4>
                      <pre className="text-sm"><code>npm install -g vercel supabase</code></pre>
                    </div>
                  </div>
                </div>
              )}

              {activeGuide === 'vercel-supabase' && (
                <div className="prose max-w-none">
                  <h3>Vercel + Supabase Integration Guide</h3>
                  <p>Detailed technical configuration for production-ready deployment.</p>
                  
                  <div className="bg-yellow-50 p-4 rounded-lg my-6">
                    <h4 className="text-yellow-900 font-semibold mb-2">Architecture Overview</h4>
                    <div className="text-sm text-yellow-800">
                      <pre>{`┌─────────────────┐    ┌─────────────────┐    ┌─────────────────┐
│   Vercel        │    │   Supabase      │    │   Third Party   │
│                 │    │                 │    │                 │
│ ├─ Next.js App  │◄──►│ ├─ PostgreSQL   │    │ ├─ ElevenLabs   │
│ ├─ API Routes   │    │ ├─ Auth         │    │ ├─ OpenAI       │
│ ├─ Static Files │    │ ├─ Storage      │    │ └─ Analytics    │
│ └─ Edge Network │    │ └─ Realtime     │    │                 │
└─────────────────┘    └─────────────────┘    └─────────────────┘`}</pre>
                    </div>
                  </div>
                </div>
              )}

              {activeGuide === 'checklist' && (
                <div className="prose max-w-none">
                  <h3>Comprehensive Deployment Checklist</h3>
                  <p>Use this checklist to ensure every aspect of your deployment is correct.</p>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-6">
                    <div className="bg-green-50 p-4 rounded-lg">
                      <h4 className="text-green-900 font-semibold mb-2">✅ Pre-Deployment</h4>
                      <ul className="text-sm text-green-800 space-y-1">
                        <li>□ Node.js 18+ installed</li>
                        <li>□ Dependencies installed</li>
                        <li>□ Project builds successfully</li>
                        <li>□ No TypeScript errors</li>
                      </ul>
                    </div>
                    
                    <div className="bg-blue-50 p-4 rounded-lg">
                      <h4 className="text-blue-900 font-semibold mb-2">🗄️ Supabase Setup</h4>
                      <ul className="text-sm text-blue-800 space-y-1">
                        <li>□ Account created</li>
                        <li>□ Project configured</li>
                        <li>□ Database schema deployed</li>
                        <li>□ Environment variables set</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Download Links */}
            <div className="mt-8 pt-8 border-t border-gray-200">
              <h3 className="text-lg font-semibold mb-4">📄 Documentation Files</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Object.entries(guides).map(([key, guide]) => (
                  <a
                    key={key}
                    href={`/${guide.file}`}
                    target="_blank"
                    className="block p-4 border border-gray-200 rounded-lg hover:border-blue-300 hover:shadow-md transition-all"
                  >
                    <div className="font-medium text-gray-900">{guide.title}</div>
                    <div className="text-sm text-gray-500 mt-1">{guide.file}</div>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-12 text-gray-500">
          <p>
            Need help? Check our{' '}
            <a href="https://github.com/username/audiovr-web/issues" className="text-blue-600 hover:underline">
              GitHub Issues
            </a>{' '}
            or review the troubleshooting sections in each guide.
          </p>
        </div>
      </div>
    </div>
  );
}
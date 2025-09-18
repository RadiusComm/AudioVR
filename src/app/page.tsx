import Link from 'next/link'
import { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'AudioVR - Home',
  description: 'Welcome to AudioVR, the world\'s first voice-driven detective mystery platform designed for accessibility.',
}

export default function HomePage() {
  return (
    <main className="min-h-screen">
      {/* Skip to main content link for accessibility */}
      <Link href="#main-content" className="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 bg-purple-600 text-white px-4 py-2 rounded-lg z-50">
        Skip to main content
      </Link>

      {/* Hero Section */}
      <section id="main-content" className="relative overflow-hidden">
        <div className="container mx-auto px-4 py-20 text-center">
          <div className="max-w-4xl mx-auto">
            {/* Main heading */}
            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
              AudioVR
            </h1>
            
            {/* Tagline */}
            <p className="text-xl md:text-2xl text-gray-300 mb-4 font-medium">
              Where Mystery Meets Accessibility
            </p>
            
            {/* Description */}
            <p className="text-lg md:text-xl text-gray-400 mb-12 max-w-3xl mx-auto leading-relaxed">
              Experience the world's first voice-driven detective mystery platform. 
              Immersive storytelling, spatial audio, and accessibility-first design 
              bring detective gaming to everyone.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-6 justify-center items-center">
              <Link 
                href="/demo"
                className="bg-purple-600 hover:bg-purple-700 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all transform hover:scale-105 focus:ring-4 focus:ring-purple-300"
                aria-label="Try AudioVR demo - interactive detective mystery"
              >
                🎮 Try Demo
              </Link>
              
              <Link 
                href="/mobile-prototypes"
                className="border-2 border-purple-600 hover:bg-purple-600/20 text-white px-8 py-4 rounded-lg font-semibold text-lg transition-all"
                aria-label="View mobile app prototypes"
              >
                📱 View Prototypes
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Deployment Section */}
      <section className="py-16 bg-gradient-to-r from-blue-900/30 to-purple-900/30">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
              🚀 Deploy AudioVR in 30 Minutes
            </h2>
            <p className="text-xl text-gray-300 max-w-3xl mx-auto">
              Get your own AudioVR detective mystery platform live with Vercel and Supabase. 
              Complete step-by-step guides and automated scripts included.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-6xl mx-auto mb-8">
            {/* Step-by-Step Guide */}
            <Link 
              href="/deployment-guide"
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📋</div>
              <h3 className="text-lg font-bold text-white mb-2">Interactive Guide</h3>
              <p className="text-gray-300 text-sm">Complete walkthrough with automated scripts</p>
            </Link>

            {/* Quick Reference */}
            <Link 
              href="/QUICK_DEPLOYMENT_REFERENCE.md"
              target="_blank"
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-4">⚡</div>
              <h3 className="text-lg font-bold text-white mb-2">Quick Reference</h3>
              <p className="text-gray-300 text-sm">Essential commands and credentials</p>
            </Link>

            {/* Deployment Checklist */}
            <Link 
              href="/DEPLOYMENT_CHECKLIST.md"
              target="_blank"
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-4">✅</div>
              <h3 className="text-lg font-bold text-white mb-2">Checklist</h3>
              <p className="text-gray-300 text-sm">Verify every deployment step</p>
            </Link>

            {/* Static Deployment Page */}
            <Link 
              href="/deployment.html"
              className="glass rounded-xl p-6 text-center hover:bg-white/10 transition-all transform hover:scale-105"
            >
              <div className="text-4xl mb-4">📄</div>
              <h3 className="text-lg font-bold text-white mb-2">Simple Guide</h3>
              <p className="text-gray-300 text-sm">Single-page deployment instructions</p>
            </Link>
          </div>

          {/* Quick Start Commands */}
          <div className="glass rounded-2xl p-8 max-w-4xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-6 text-center">
              🛠️ One-Command Deployment
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-center">
              <div className="bg-black/30 rounded-lg p-4">
                <div className="font-mono text-green-400 text-sm mb-2">
                  ./scripts/setup-environment.sh
                </div>
                <div className="text-gray-300 text-xs">Interactive setup</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="font-mono text-blue-400 text-sm mb-2">
                  ./scripts/deploy-full.sh
                </div>
                <div className="text-gray-300 text-xs">Automated deployment</div>
              </div>
              <div className="bg-black/30 rounded-lg p-4">
                <div className="font-mono text-purple-400 text-sm mb-2">
                  ./scripts/verify-deployment.sh
                </div>
                <div className="text-gray-300 text-xs">Verify everything works</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-black/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-6">
              Revolutionary Gaming Experience
            </h2>
            <p className="text-xl text-gray-300 max-w-2xl mx-auto">
              Built from the ground up for accessibility, powered by cutting-edge voice recognition and spatial audio technology.
            </p>
          </div>

          {/* Feature Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {/* Voice Control */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all">
              <div className="text-5xl mb-6">🎙️</div>
              <h3 className="text-2xl font-bold text-white mb-4">Voice-First Design</h3>
              <p className="text-gray-300 leading-relaxed">
                Every interaction is accessible via voice commands with 95%+ accuracy. 
                Natural language processing understands context and intent.
              </p>
            </div>

            {/* Spatial Audio */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all">
              <div className="text-5xl mb-6">🔊</div>
              <h3 className="text-2xl font-bold text-white mb-4">Immersive Spatial Audio</h3>
              <p className="text-gray-300 leading-relaxed">
                3D positioned sounds create realistic environments. 
                Characters and objects have precise spatial locations for navigation.
              </p>
            </div>

            {/* Accessibility */}
            <div className="glass rounded-2xl p-8 text-center hover:bg-white/10 transition-all">
              <div className="text-5xl mb-6">♿</div>
              <h3 className="text-2xl font-bold text-white mb-4">WCAG 2.1 AA Compliant</h3>
              <p className="text-gray-300 leading-relaxed">
                Fully compliant with web accessibility guidelines. 
                Screen reader optimized with comprehensive keyboard navigation.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-3xl md:text-4xl font-bold text-white mb-8">
              Experience AudioVR Now
            </h2>
            <p className="text-xl text-gray-300 mb-12">
              Try our interactive demo featuring "The Whitechapel Mystery" - 
              a fully voice-controlled detective investigation in Victorian London.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Web Demo */}
              <Link 
                href="/demo"
                className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group"
                aria-label="Launch web demo of AudioVR detective mystery"
              >
                <div className="text-4xl mb-4">🌐</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  Web Demo
                </h3>
                <p className="text-gray-300">
                  Experience AudioVR directly in your browser. 
                  Full voice control and spatial audio support.
                </p>
              </Link>

              {/* Mobile Prototypes */}
              <Link 
                href="/mobile-prototypes"
                className="glass rounded-2xl p-8 hover:bg-white/10 transition-all group"
                aria-label="View interactive mobile app prototypes"
              >
                <div className="text-4xl mb-4">📱</div>
                <h3 className="text-2xl font-bold text-white mb-4 group-hover:text-purple-400 transition-colors">
                  Mobile Prototypes
                </h3>
                <p className="text-gray-300">
                  Explore interactive mockups of the mobile app 
                  with complete user interface walkthroughs.
                </p>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Analytics Dashboard Link */}
      <section className="py-16 bg-black/30">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h2 className="text-2xl md:text-3xl font-bold text-white mb-6">
              Real-Time Analytics
            </h2>
            <p className="text-gray-300 mb-8">
              Monitor user engagement, accessibility metrics, and voice recognition performance 
              with our comprehensive analytics dashboard.
            </p>
            <Link 
              href="/analytics-dashboard.html"
              className="inline-flex items-center bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-semibold transition-all"
              aria-label="View AudioVR analytics dashboard"
            >
              📊 View Dashboard
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 bg-black/50">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-2xl mx-auto">
            <h3 className="text-2xl font-bold text-white mb-4">AudioVR</h3>
            <p className="text-gray-400 mb-6">
              Transforming detective gaming through accessibility-first design and voice technology.
            </p>
            <p className="text-sm text-gray-500">
              Built with Next.js, Supabase, and cutting-edge voice recognition technology.
            </p>
          </div>
        </div>
      </footer>
    </main>
  )
}
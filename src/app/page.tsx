'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'
import CaseLibrary from '@/components/CaseLibrary'
import VoiceInterface from '@/components/VoiceInterface'
import GameInterface from '@/components/GameInterface'

export default function AudioVRHome() {
  const [currentView, setCurrentView] = useState<'home' | 'cases' | 'game'>('home')
  const [selectedCase, setSelectedCase] = useState<any>(null)
  const [isVoiceActive, setIsVoiceActive] = useState(false)

  const handleCaseSelect = (caseData: any) => {
    setSelectedCase(caseData)
    setCurrentView('game')
    toast.success(`Starting: ${caseData.title}`)
  }

  const handleBackToHome = () => {
    setCurrentView('home')
    setSelectedCase(null)
  }

  const handleBackToCases = () => {
    setCurrentView('cases')
    setSelectedCase(null)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-audio-primary via-audio-secondary to-slate-900">
      {/* Navigation Header */}
      <nav className="fixed top-0 w-full z-50 glass-morphism">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <motion.div 
              className="flex items-center space-x-4"
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
            >
              <div className="text-2xl font-bold text-glow">🎧 AudioVR</div>
              {currentView !== 'home' && (
                <button
                  onClick={handleBackToHome}
                  className="text-blue-400 hover:text-blue-300 transition-colors"
                >
                  ← Home
                </button>
              )}
            </motion.div>
            
            <div className="flex items-center space-x-4">
              <VoiceInterface 
                isActive={isVoiceActive}
                onToggle={setIsVoiceActive}
              />
              <div className="text-sm text-gray-400">
                {currentView === 'home' && 'Select a Mystery'}
                {currentView === 'cases' && 'Choose Your Case'}
                {currentView === 'game' && selectedCase?.title}
              </div>
            </div>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="pt-16">
        {currentView === 'home' && (
          <HomeView onViewCases={() => setCurrentView('cases')} />
        )}
        
        {currentView === 'cases' && (
          <CaseLibrary 
            onCaseSelect={handleCaseSelect}
            onBack={handleBackToHome}
          />
        )}
        
        {currentView === 'game' && selectedCase && (
          <GameInterface 
            caseData={selectedCase}
            onBack={handleBackToCases}
            isVoiceActive={isVoiceActive}
          />
        )}
      </div>
    </div>
  )
}

// Home View Component
function HomeView({ onViewCases }: { onViewCases: () => void }) {
  return (
    <div className="min-h-screen flex items-center justify-center p-8">
      <div className="max-w-4xl mx-auto text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
        >
          <h1 className="text-6xl font-bold mb-6 text-glow">
            🕵️ AudioVR Detective
          </h1>
          <p className="text-xl text-gray-300 mb-8 max-w-2xl mx-auto">
            Solve immersive detective mysteries through voice interaction with AI-powered characters. 
            Experience crime scenes, interrogate suspects, and uncover the truth.
          </p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.2 }}
          className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8"
        >
          <div className="mystery-card">
            <div className="text-4xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">Interactive Investigation</h3>
            <p className="text-gray-400">Use your voice to question witnesses and examine evidence</p>
          </div>
          
          <div className="mystery-card">
            <div className="text-4xl mb-4">🎭</div>
            <h3 className="text-xl font-semibold mb-2">AI Characters</h3>
            <p className="text-gray-400">Powered by ElevenLabs for realistic voice conversations</p>
          </div>
          
          <div className="mystery-card">
            <div className="text-4xl mb-4">🏆</div>
            <h3 className="text-xl font-semibold mb-2">Multiple Outcomes</h3>
            <p className="text-gray-400">Your decisions shape the story and determine the ending</p>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.4 }}
        >
          <button
            onClick={onViewCases}
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-4 rounded-xl text-lg font-semibold transition-all duration-300 transform hover:scale-105 shadow-lg hover:shadow-blue-500/25"
          >
            Start Investigation →
          </button>
        </motion.div>

        {/* Features Grid */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 1, delay: 0.6 }}
          className="mt-16 grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-500"
        >
          <div>🎧 Spatial Audio</div>
          <div>🤖 AI Detective</div>
          <div>📱 Voice Controls</div>
          <div>🌍 Multiple Cases</div>
        </motion.div>
      </div>
    </div>
  )
}
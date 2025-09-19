'use client'

import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface GameInterfaceProps {
  caseData: any
  onBack: () => void
  isVoiceActive: boolean
}

interface GameState {
  currentScene: string
  inventory: string[]
  notes: string[]
  progress: number
  character: string | null
  dialogue: string[]
}

export default function GameInterface({ caseData, onBack, isVoiceActive }: GameInterfaceProps) {
  const [gameState, setGameState] = useState<GameState>({
    currentScene: 'intro',
    inventory: [],
    notes: [],
    progress: 0,
    character: null,
    dialogue: []
  })
  
  const [isPlaying, setIsPlaying] = useState(false)
  const [currentAudio, setCurrentAudio] = useState<string | null>(null)
  const [showEvidence, setShowEvidence] = useState(false)
  const [showNotes, setShowNotes] = useState(false)

  // Initialize game state
  useEffect(() => {
    startCase()
  }, [caseData])

  const startCase = () => {
    setGameState({
      currentScene: 'intro',
      inventory: ['magnifying_glass', 'notepad'],
      notes: [`Investigation started: ${caseData.title}`],
      progress: 0,
      character: 'detective',
      dialogue: [
        `Welcome to ${caseData.title}`,
        caseData.description,
        'What would you like to do first?'
      ]
    })
    
    // Simulate ElevenLabs audio playback
    playAudio('case_intro')
  }

  const playAudio = (audioId: string) => {
    setCurrentAudio(audioId)
    setIsPlaying(true)
    
    // Simulate audio playback
    setTimeout(() => {
      setIsPlaying(false)
      setCurrentAudio(null)
    }, 3000)
    
    toast.success('🎵 Playing audio...')
  }

  const handleAction = (action: string, target?: string) => {
    const newNote = `${action}${target ? ` - ${target}` : ''} at ${new Date().toLocaleTimeString()}`
    
    setGameState(prev => ({
      ...prev,
      notes: [...prev.notes, newNote],
      progress: Math.min(prev.progress + 10, 100)
    }))

    // Simulate different actions
    switch (action) {
      case 'examine':
        toast.success(`🔍 Examining ${target || 'area'}...`)
        if (target === 'desk') {
          setGameState(prev => ({
            ...prev,
            inventory: [...prev.inventory, 'letter']
          }))
          toast.success('📄 Found a suspicious letter!')
        }
        break
        
      case 'question':
        toast.success(`💭 Questioning ${target || 'witness'}...`)
        playAudio(`question_${target || 'default'}`)
        break
        
      case 'move':
        toast.success(`🚶 Moving to ${target || 'new location'}...`)
        setGameState(prev => ({
          ...prev,
          currentScene: target || 'new_scene'
        }))
        break
        
      default:
        toast.success(`🎯 ${action} completed`)
    }
  }

  const getSceneDescription = (scene: string) => {
    const scenes: { [key: string]: string } = {
      intro: `You arrive at the scene of ${caseData.title}. The atmosphere is tense, and clues await your discovery.`,
      office: 'A cluttered office with papers scattered across an old wooden desk. A peculiar smell lingers in the air.',
      library: 'Towering bookshelves surround you. Dust particles dance in the dim light filtering through stained glass windows.',
      basement: 'The basement is dark and damp. Strange symbols are carved into the stone walls.',
      conclusion: 'All the pieces of the puzzle are coming together. Time to solve the mystery!'
    }
    return scenes[scene] || 'You find yourself in an unfamiliar location.'
  }

  const getCurrentCharacter = () => {
    const characters: { [key: string]: any } = {
      detective: { name: 'Detective Holmes', emoji: '🕵️', voice: 'british_male' },
      witness: { name: 'Mary Watson', emoji: '👩', voice: 'british_female' },
      suspect: { name: 'Professor Moriarty', emoji: '🎭', voice: 'deep_male' },
      expert: { name: 'Dr. Forensics', emoji: '👨‍🔬', voice: 'scientific' }
    }
    return characters[gameState.character || 'detective']
  }

  return (
    <div className="min-h-screen p-4 md:p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-6"
        >
          <div>
            <h1 className="text-2xl md:text-3xl font-bold text-glow">{caseData.title}</h1>
            <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
              <span>Progress: {gameState.progress}%</span>
              <span>Scene: {gameState.currentScene}</span>
              <span>Items: {gameState.inventory.length}</span>
            </div>
          </div>
          
          <button
            onClick={onBack}
            className="bg-gray-600 hover:bg-gray-700 text-white px-4 py-2 rounded-lg transition-colors"
          >
            ← Back to Cases
          </button>
        </motion.div>

        {/* Progress Bar */}
        <div className="w-full bg-gray-700 rounded-full h-2 mb-6">
          <motion.div
            className="bg-blue-500 h-2 rounded-full"
            initial={{ width: 0 }}
            animate={{ width: `${gameState.progress}%` }}
            transition={{ duration: 0.5 }}
          />
        </div>

        {/* Main Game Area */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Scene & Dialogue */}
          <div className="lg:col-span-2 space-y-6">
            {/* Scene Description */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-morphism p-6 rounded-xl"
            >
              <h3 className="text-xl font-semibold mb-4 flex items-center">
                🎬 Current Scene: {gameState.currentScene}
              </h3>
              <p className="text-gray-300 leading-relaxed">
                {getSceneDescription(gameState.currentScene)}
              </p>
            </motion.div>

            {/* Character Dialogue */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              className="glass-morphism p-6 rounded-xl"
            >
              <div className="flex items-center mb-4">
                <span className="text-2xl mr-3">{getCurrentCharacter().emoji}</span>
                <div>
                  <h3 className="font-semibold">{getCurrentCharacter().name}</h3>
                  <div className="flex items-center space-x-2 text-sm text-gray-400">
                    {isPlaying ? (
                      <>
                        <div className="audio-wave">
                          <span></span>
                          <span></span>
                          <span></span>
                        </div>
                        <span>Speaking...</span>
                      </>
                    ) : (
                      <span>Ready to interact</span>
                    )}
                  </div>
                </div>
              </div>

              <div className="space-y-2 max-h-40 overflow-y-auto">
                {gameState.dialogue.map((line, index) => (
                  <motion.div
                    key={index}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.3 }}
                    className="bg-white/5 p-3 rounded-lg"
                  >
                    {line}
                  </motion.div>
                ))}
              </div>
            </motion.div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="grid grid-cols-2 md:grid-cols-4 gap-4"
            >
              <button
                onClick={() => handleAction('examine', 'desk')}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                🔍 Examine
              </button>
              <button
                onClick={() => handleAction('question', 'witness')}
                className="bg-green-600 hover:bg-green-700 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                💭 Question
              </button>
              <button
                onClick={() => handleAction('move', 'library')}
                className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                🚶 Move
              </button>
              <button
                onClick={() => playAudio('ambient')}
                className="bg-orange-600 hover:bg-orange-700 text-white px-4 py-3 rounded-lg transition-colors text-sm font-medium"
              >
                🎵 Listen
              </button>
            </motion.div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Inventory */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              className="glass-morphism p-4 rounded-xl"
            >
              <button
                onClick={() => setShowEvidence(!showEvidence)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="font-semibold">🎒 Evidence ({gameState.inventory.length})</h3>
                <span>{showEvidence ? '▼' : '▶'}</span>
              </button>
              
              <AnimatePresence>
                {showEvidence && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    {gameState.inventory.map((item, index) => (
                      <div key={index} className="bg-white/5 p-2 rounded text-sm">
                        📦 {item.replace('_', ' ')}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Notes */}
            <motion.div
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-morphism p-4 rounded-xl"
            >
              <button
                onClick={() => setShowNotes(!showNotes)}
                className="w-full flex items-center justify-between mb-4"
              >
                <h3 className="font-semibold">📝 Notes ({gameState.notes.length})</h3>
                <span>{showNotes ? '▼' : '▶'}</span>
              </button>
              
              <AnimatePresence>
                {showNotes && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2 max-h-60 overflow-y-auto"
                  >
                    {gameState.notes.map((note, index) => (
                      <div key={index} className="bg-white/5 p-2 rounded text-xs text-gray-300">
                        {note}
                      </div>
                    ))}
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>

            {/* Voice Status */}
            {isVoiceActive && (
              <motion.div
                initial={{ opacity: 0, x: 20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                className="glass-morphism p-4 rounded-xl"
              >
                <h3 className="font-semibold mb-2 flex items-center">
                  🎤 Voice Assistant
                  <div className="ml-2 w-2 h-2 bg-green-400 rounded-full animate-pulse" />
                </h3>
                <p className="text-sm text-gray-400">
                  Voice commands are active. Try saying "examine desk" or "question witness".
                </p>
              </motion.div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
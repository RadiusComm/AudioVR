'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'

interface Case {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'mystery' | 'detective' | 'horror'
  duration: string
  completed: boolean
  backgroundImage?: string
}

const SAMPLE_CASES: Case[] = [
  {
    id: 'whitechapel-mystery',
    title: 'The Whitechapel Conspiracy',
    description: 'A series of mysterious disappearances in London\'s East End. Work with Inspector Lestrade to uncover a sinister plot.',
    difficulty: 'hard',
    category: 'mystery',
    duration: '45-60 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1513475382585-d06e58bcb0e0?w=500'
  },
  {
    id: 'midnight-caller',
    title: 'The Midnight Caller',
    description: 'Strange phone calls have been terrorizing a small town. Investigate the source before the caller strikes again.',
    difficulty: 'medium',
    category: 'horror',
    duration: '30-40 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500'
  },
  {
    id: 'missing-professor',
    title: 'The Missing Professor',
    description: 'A renowned archaeologist has vanished from his locked office. Search for clues in this classic locked-room mystery.',
    difficulty: 'easy',
    category: 'detective',
    duration: '20-30 min',
    completed: true,
    backgroundImage: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=500'
  },
  {
    id: 'phantom-orchestra',
    title: 'The Phantom Orchestra',
    description: 'Musicians at the Grand Theater report hearing ghostly music at night. Uncover the truth behind the phantom melodies.',
    difficulty: 'medium',
    category: 'mystery',
    duration: '35-45 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=500'
  },
  {
    id: 'digital-ghost',
    title: 'The Digital Ghost',
    description: 'A deceased programmer\'s code is still being updated. Investigate this supernatural cyber mystery.',
    difficulty: 'hard',
    category: 'horror',
    duration: '50-65 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1518709268805-4e9042af2176?w=500'
  },
  {
    id: 'stolen-diamond',
    title: 'The Stolen Diamond',
    description: 'A priceless diamond has been stolen from a high-security vault. Interview suspects and gather evidence.',
    difficulty: 'easy',
    category: 'detective',
    duration: '25-35 min',
    completed: false,
    backgroundImage: 'https://images.unsplash.com/photo-1606107557195-0e29a4b5b4aa?w=500'
  }
]

interface CaseLibraryProps {
  onCaseSelect: (caseData: Case) => void
  onBack: () => void
}

export default function CaseLibrary({ onCaseSelect, onBack }: CaseLibraryProps) {
  const [cases, setCases] = useState<Case[]>(SAMPLE_CASES)
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [selectedDifficulty, setSelectedDifficulty] = useState<string>('all')

  const filteredCases = cases.filter(case_ => {
    const categoryMatch = selectedCategory === 'all' || case_.category === selectedCategory
    const difficultyMatch = selectedDifficulty === 'all' || case_.difficulty === selectedDifficulty
    return categoryMatch && difficultyMatch
  })

  const getDifficultyColor = (difficulty: string) => {
    switch (difficulty) {
      case 'easy': return 'case-difficulty-easy'
      case 'medium': return 'case-difficulty-medium'
      case 'hard': return 'case-difficulty-hard'
      default: return 'case-difficulty-medium'
    }
  }

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'mystery': return '🔍'
      case 'detective': return '🕵️'
      case 'horror': return '👻'
      default: return '🎭'
    }
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h1 className="text-4xl font-bold mb-4 text-glow">🗂️ Case Library</h1>
          <p className="text-gray-300 text-lg">Choose your mystery and begin the investigation</p>
        </motion.div>

        {/* Filters */}
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="flex flex-wrap gap-4 mb-8 glass-morphism p-4 rounded-xl"
        >
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Category:</span>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Categories</option>
              <option value="mystery">Mystery</option>
              <option value="detective">Detective</option>
              <option value="horror">Horror</option>
            </select>
          </div>

          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-400">Difficulty:</span>
            <select
              value={selectedDifficulty}
              onChange={(e) => setSelectedDifficulty(e.target.value)}
              className="bg-white/10 border border-white/20 rounded-lg px-3 py-1 text-sm focus:outline-none focus:border-blue-400"
            >
              <option value="all">All Levels</option>
              <option value="easy">Easy</option>
              <option value="medium">Medium</option>
              <option value="hard">Hard</option>
            </select>
          </div>

          <div className="ml-auto text-sm text-gray-400">
            {filteredCases.length} case{filteredCases.length !== 1 ? 's' : ''} found
          </div>
        </motion.div>

        {/* Cases Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCases.map((case_, index) => (
            <motion.div
              key={case_.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
              className="mystery-card relative overflow-hidden"
              onClick={() => onCaseSelect(case_)}
            >
              {/* Background Image */}
              {case_.backgroundImage && (
                <div 
                  className="absolute inset-0 opacity-20 bg-cover bg-center"
                  style={{ backgroundImage: `url(${case_.backgroundImage})` }}
                />
              )}

              {/* Content */}
              <div className="relative z-10">
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex items-center space-x-2">
                    <span className="text-2xl">{getCategoryIcon(case_.category)}</span>
                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getDifficultyColor(case_.difficulty)}`}>
                      {case_.difficulty.toUpperCase()}
                    </span>
                  </div>
                  {case_.completed && (
                    <div className="bg-green-500/20 text-green-400 px-2 py-1 rounded-full text-xs">
                      ✓ Completed
                    </div>
                  )}
                </div>

                {/* Title */}
                <h3 className="text-xl font-bold mb-3 text-white">{case_.title}</h3>

                {/* Description */}
                <p className="text-gray-300 text-sm mb-4 line-clamp-3">{case_.description}</p>

                {/* Footer */}
                <div className="flex items-center justify-between text-sm">
                  <span className="text-gray-400">⏱️ {case_.duration}</span>
                  <span className="text-blue-400 font-medium">Start Case →</span>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {/* Empty State */}
        {filteredCases.length === 0 && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="text-center py-16"
          >
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No Cases Found</h3>
            <p className="text-gray-400">Try adjusting your filters to see more cases</p>
          </motion.div>
        )}
      </div>
    </div>
  )
}
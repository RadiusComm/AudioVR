'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import toast from 'react-hot-toast'

interface Case {
  id: string
  title: string
  description: string
  difficulty: 'easy' | 'medium' | 'hard'
  category: 'mystery' | 'detective' | 'horror'
  duration: string
  plays: number
  completions: number
  status: 'draft' | 'published'
  createdAt: string
}

export default function AdminPanel() {
  const [cases, setCases] = useState<Case[]>([])
  const [isLoggedIn, setIsLoggedIn] = useState(false)
  const [credentials, setCredentials] = useState({ username: '', password: '' })
  const [showAddCase, setShowAddCase] = useState(false)
  const [newCase, setNewCase] = useState({
    title: '',
    description: '',
    difficulty: 'medium' as const,
    category: 'mystery' as const,
    duration: '30-40 min'
  })

  // Mock login - replace with real authentication
  const handleLogin = () => {
    if (credentials.username === 'admin' && credentials.password === 'audiovr2025') {
      setIsLoggedIn(true)
      toast.success('Welcome to AudioVR Admin!')
      loadCases()
    } else {
      toast.error('Invalid credentials')
    }
  }

  const loadCases = () => {
    // Mock data - replace with API call
    const mockCases: Case[] = [
      {
        id: '1',
        title: 'The Whitechapel Conspiracy',
        description: 'A series of mysterious disappearances in London\'s East End.',
        difficulty: 'hard',
        category: 'mystery',
        duration: '45-60 min',
        plays: 1247,
        completions: 892,
        status: 'published',
        createdAt: '2024-01-15'
      },
      {
        id: '2',
        title: 'The Midnight Caller',
        description: 'Strange phone calls terrorizing a small town.',
        difficulty: 'medium',
        category: 'horror',
        duration: '30-40 min',
        plays: 856,
        completions: 634,
        status: 'published',
        createdAt: '2024-02-03'
      },
      {
        id: '3',
        title: 'The Digital Ghost',
        description: 'A programmer\'s code continues updating after their death.',
        difficulty: 'hard',
        category: 'horror',
        duration: '50-65 min',
        plays: 423,
        completions: 201,
        status: 'draft',
        createdAt: '2024-03-10'
      }
    ]
    setCases(mockCases)
  }

  const handleAddCase = () => {
    if (!newCase.title.trim() || !newCase.description.trim()) {
      toast.error('Please fill in all required fields')
      return
    }

    const case_: Case = {
      id: Date.now().toString(),
      ...newCase,
      plays: 0,
      completions: 0,
      status: 'draft',
      createdAt: new Date().toISOString().split('T')[0]
    }

    setCases(prev => [case_, ...prev])
    setNewCase({
      title: '',
      description: '',
      difficulty: 'medium',
      category: 'mystery',
      duration: '30-40 min'
    })
    setShowAddCase(false)
    toast.success('Case added successfully!')
  }

  const toggleCaseStatus = (id: string) => {
    setCases(prev => prev.map(case_ => 
      case_.id === id 
        ? { ...case_, status: case_.status === 'draft' ? 'published' : 'draft' }
        : case_
    ))
    toast.success('Case status updated!')
  }

  const deleteCase = (id: string) => {
    setCases(prev => prev.filter(case_ => case_.id !== id))
    toast.success('Case deleted!')
  }

  if (!isLoggedIn) {
    return (
      <div className="min-h-screen flex items-center justify-center p-8">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="glass-morphism p-8 rounded-xl max-w-md w-full"
        >
          <h1 className="text-3xl font-bold text-center mb-8 text-glow">
            🔐 AudioVR Admin
          </h1>
          
          <div className="space-y-4">
            <input
              type="text"
              placeholder="Username"
              value={credentials.username}
              onChange={(e) => setCredentials(prev => ({ ...prev, username: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400"
            />
            <input
              type="password"
              placeholder="Password"
              value={credentials.password}
              onChange={(e) => setCredentials(prev => ({ ...prev, password: e.target.value }))}
              className="w-full bg-white/10 border border-white/20 rounded-lg px-4 py-3 focus:outline-none focus:border-blue-400"
              onKeyPress={(e) => e.key === 'Enter' && handleLogin()}
            />
            <button
              onClick={handleLogin}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white py-3 rounded-lg font-medium transition-colors"
            >
              Login
            </button>
          </div>
          
          <div className="mt-6 text-center text-sm text-gray-400">
            Demo credentials: admin / audiovr2025
          </div>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="min-h-screen p-8">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center justify-between mb-8"
        >
          <div>
            <h1 className="text-4xl font-bold text-glow">⚙️ AudioVR Admin</h1>
            <p className="text-gray-300 mt-2">Manage detective mystery cases</p>
          </div>
          
          <div className="flex items-center space-x-4">
            <button
              onClick={() => setShowAddCase(true)}
              className="bg-green-600 hover:bg-green-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              + Add Case
            </button>
            <button
              onClick={() => setIsLoggedIn(false)}
              className="bg-red-600 hover:bg-red-700 text-white px-6 py-2 rounded-lg font-medium transition-colors"
            >
              Logout
            </button>
          </div>
        </motion.div>

        {/* Stats Dashboard */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-morphism p-6 rounded-xl"
          >
            <div className="text-3xl font-bold text-blue-400">{cases.length}</div>
            <div className="text-gray-300">Total Cases</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-morphism p-6 rounded-xl"
          >
            <div className="text-3xl font-bold text-green-400">
              {cases.filter(c => c.status === 'published').length}
            </div>
            <div className="text-gray-300">Published</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-morphism p-6 rounded-xl"
          >
            <div className="text-3xl font-bold text-yellow-400">
              {cases.reduce((sum, c) => sum + c.plays, 0)}
            </div>
            <div className="text-gray-300">Total Plays</div>
          </motion.div>
          
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="glass-morphism p-6 rounded-xl"
          >
            <div className="text-3xl font-bold text-purple-400">
              {Math.round((cases.reduce((sum, c) => sum + c.completions, 0) / cases.reduce((sum, c) => sum + c.plays, 0)) * 100) || 0}%
            </div>
            <div className="text-gray-300">Completion Rate</div>
          </motion.div>
        </div>

        {/* Cases Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="glass-morphism rounded-xl overflow-hidden"
        >
          <div className="p-6 border-b border-white/10">
            <h2 className="text-2xl font-semibold">📚 Case Management</h2>
          </div>
          
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-white/5">
                <tr>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Case</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Category</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Difficulty</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Stats</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Status</th>
                  <th className="px-6 py-4 text-left text-sm font-medium text-gray-300">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/10">
                {cases.map((case_, index) => (
                  <motion.tr
                    key={case_.id}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="hover:bg-white/5"
                  >
                    <td className="px-6 py-4">
                      <div>
                        <div className="font-medium text-white">{case_.title}</div>
                        <div className="text-sm text-gray-400 truncate max-w-xs">
                          {case_.description}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="capitalize text-sm">{case_.category}</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                        case_.difficulty === 'easy' ? 'case-difficulty-easy' :
                        case_.difficulty === 'medium' ? 'case-difficulty-medium' :
                        'case-difficulty-hard'
                      }`}>
                        {case_.difficulty.toUpperCase()}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm">
                      <div>{case_.plays} plays</div>
                      <div className="text-gray-400">{case_.completions} completed</div>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => toggleCaseStatus(case_.id)}
                        className={`px-3 py-1 rounded-full text-xs font-medium ${
                          case_.status === 'published' 
                            ? 'bg-green-500/20 text-green-400' 
                            : 'bg-yellow-500/20 text-yellow-400'
                        }`}
                      >
                        {case_.status}
                      </button>
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => deleteCase(case_.id)}
                        className="text-red-400 hover:text-red-300 text-sm"
                      >
                        Delete
                      </button>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.div>

        {/* Add Case Modal */}
        {showAddCase && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <motion.div
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              className="glass-morphism p-6 rounded-xl max-w-md w-full"
            >
              <h3 className="text-xl font-bold mb-4">➕ Add New Case</h3>
              
              <div className="space-y-4">
                <input
                  type="text"
                  placeholder="Case Title"
                  value={newCase.title}
                  onChange={(e) => setNewCase(prev => ({ ...prev, title: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                />
                
                <textarea
                  placeholder="Case Description"
                  value={newCase.description}
                  onChange={(e) => setNewCase(prev => ({ ...prev, description: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400 h-20 resize-none"
                />
                
                <div className="grid grid-cols-2 gap-4">
                  <select
                    value={newCase.difficulty}
                    onChange={(e) => setNewCase(prev => ({ ...prev, difficulty: e.target.value as any }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                  >
                    <option value="easy">Easy</option>
                    <option value="medium">Medium</option>
                    <option value="hard">Hard</option>
                  </select>
                  
                  <select
                    value={newCase.category}
                    onChange={(e) => setNewCase(prev => ({ ...prev, category: e.target.value as any }))}
                    className="bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                  >
                    <option value="mystery">Mystery</option>
                    <option value="detective">Detective</option>
                    <option value="horror">Horror</option>
                  </select>
                </div>
                
                <input
                  type="text"
                  placeholder="Duration (e.g., 30-40 min)"
                  value={newCase.duration}
                  onChange={(e) => setNewCase(prev => ({ ...prev, duration: e.target.value }))}
                  className="w-full bg-white/10 border border-white/20 rounded-lg px-3 py-2 focus:outline-none focus:border-blue-400"
                />
              </div>
              
              <div className="flex space-x-4 mt-6">
                <button
                  onClick={handleAddCase}
                  className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Add Case
                </button>
                <button
                  onClick={() => setShowAddCase(false)}
                  className="flex-1 bg-gray-600 hover:bg-gray-700 text-white py-2 rounded-lg font-medium transition-colors"
                >
                  Cancel
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </div>
    </div>
  )
}
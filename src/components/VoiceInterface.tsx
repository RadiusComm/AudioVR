'use client'

import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import toast from 'react-hot-toast'

interface VoiceInterfaceProps {
  isActive: boolean
  onToggle: (active: boolean) => void
  onTranscription?: (text: string) => void
}

export default function VoiceInterface({ isActive, onToggle, onTranscription }: VoiceInterfaceProps) {
  const [isListening, setIsListening] = useState(false)
  const [transcript, setTranscript] = useState('')
  const [isProcessing, setIsProcessing] = useState(false)
  const recognitionRef = useRef<any>(null)

  // Initialize speech recognition
  useEffect(() => {
    if (typeof window !== 'undefined' && 'webkitSpeechRecognition' in window) {
      const SpeechRecognition = (window as any).webkitSpeechRecognition
      recognitionRef.current = new SpeechRecognition()
      
      recognitionRef.current.continuous = true
      recognitionRef.current.interimResults = true
      recognitionRef.current.lang = 'en-US'

      recognitionRef.current.onresult = (event: any) => {
        let finalTranscript = ''
        let interimTranscript = ''

        for (let i = event.resultIndex; i < event.results.length; i++) {
          const transcriptSegment = event.results[i][0].transcript
          if (event.results[i].isFinal) {
            finalTranscript += transcriptSegment
          } else {
            interimTranscript += transcriptSegment
          }
        }

        setTranscript(finalTranscript + interimTranscript)

        if (finalTranscript) {
          onTranscription?.(finalTranscript)
          handleVoiceCommand(finalTranscript)
        }
      }

      recognitionRef.current.onerror = (event: any) => {
        console.error('Speech recognition error:', event.error)
        if (event.error === 'not-allowed') {
          toast.error('Microphone access denied. Please allow microphone access.')
        } else {
          toast.error('Speech recognition error. Please try again.')
        }
        setIsListening(false)
      }

      recognitionRef.current.onend = () => {
        setIsListening(false)
      }
    }

    return () => {
      if (recognitionRef.current) {
        recognitionRef.current.stop()
      }
    }
  }, [onTranscription])

  const startListening = () => {
    if (recognitionRef.current) {
      setTranscript('')
      setIsListening(true)
      recognitionRef.current.start()
      toast.success('🎤 Listening... Speak now!')
    } else {
      toast.error('Speech recognition not supported in this browser')
    }
  }

  const stopListening = () => {
    if (recognitionRef.current) {
      recognitionRef.current.stop()
      setIsListening(false)
    }
  }

  const toggleListening = () => {
    if (isListening) {
      stopListening()
    } else {
      startListening()
    }
  }

  const handleVoiceCommand = async (command: string) => {
    setIsProcessing(true)
    
    // Simulate AI processing delay
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    // Basic voice command processing
    const lowerCommand = command.toLowerCase()
    
    if (lowerCommand.includes('start case') || lowerCommand.includes('begin investigation')) {
      toast.success('🕵️ Starting investigation...')
    } else if (lowerCommand.includes('examine') || lowerCommand.includes('look at')) {
      toast.success('🔍 Examining evidence...')
    } else if (lowerCommand.includes('question') || lowerCommand.includes('ask')) {
      toast.success('💭 Questioning witness...')
    } else if (lowerCommand.includes('help') || lowerCommand.includes('what can i do')) {
      toast.success('📖 Available commands: "start case", "examine evidence", "question witness"')
    } else {
      toast.success(`🤖 Processing: "${command}"`)
    }
    
    setIsProcessing(false)
    setTimeout(() => setTranscript(''), 3000) // Clear transcript after 3 seconds
  }

  return (
    <div className="relative">
      {/* Voice Toggle Button */}
      <motion.button
        onClick={() => onToggle(!isActive)}
        className={`voice-button ${isActive ? 'bg-blue-600' : 'bg-gray-600'}`}
        whileHover={{ scale: 1.05 }}
        whileTap={{ scale: 0.95 }}
      >
        {isActive && isListening && (
          <span className="pulse-ring" />
        )}
        
        <motion.div
          animate={{ rotate: isActive ? 0 : 180 }}
          transition={{ duration: 0.3 }}
        >
          {isActive ? '🎤' : '🔇'}
        </motion.div>
      </motion.button>

      {/* Voice Controls Panel */}
      <AnimatePresence>
        {isActive && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 10, scale: 0.9 }}
            className="absolute top-full right-0 mt-2 w-80 glass-morphism p-4 rounded-xl shadow-xl z-50"
          >
            {/* Header */}
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-white">🎙️ Voice Assistant</h3>
              <div className="flex items-center space-x-2">
                {isProcessing && <div className="spinner" />}
                <div className={`w-2 h-2 rounded-full ${isListening ? 'bg-green-400' : 'bg-gray-400'}`} />
              </div>
            </div>

            {/* Voice Controls */}
            <div className="space-y-3">
              {/* Listen Button */}
              <button
                onClick={toggleListening}
                disabled={isProcessing}
                className={`w-full py-2 px-4 rounded-lg font-medium transition-colors ${
                  isListening 
                    ? 'bg-red-600 hover:bg-red-700 text-white' 
                    : 'bg-green-600 hover:bg-green-700 text-white'
                } disabled:opacity-50`}
              >
                {isListening ? '⏹️ Stop Listening' : '🎤 Start Listening'}
              </button>

              {/* Transcript Display */}
              {transcript && (
                <motion.div
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  className="bg-white/5 border border-white/10 rounded-lg p-3"
                >
                  <div className="text-xs text-gray-400 mb-1">Transcript:</div>
                  <div className="text-sm text-white">{transcript}</div>
                </motion.div>
              )}

              {/* Voice Commands Help */}
              <details className="text-sm">
                <summary className="cursor-pointer text-gray-400 hover:text-white">
                  📋 Voice Commands
                </summary>
                <div className="mt-2 space-y-1 text-xs text-gray-500">
                  <div>• "Start case" - Begin investigation</div>
                  <div>• "Examine [item]" - Look at evidence</div>
                  <div>• "Question [person]" - Interview witness</div>
                  <div>• "Help" - Show available commands</div>
                </div>
              </details>

              {/* Audio Visualizer */}
              {isListening && (
                <div className="flex justify-center">
                  <div className="audio-wave">
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                    <span></span>
                  </div>
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
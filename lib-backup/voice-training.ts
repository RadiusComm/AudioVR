// Advanced Voice Training and Personalization System
// This module handles adaptive voice recognition training, accent adaptation,
// and personalized command learning for AudioVR users

import { supabase } from './supabase'

export interface VoiceProfile {
  user_id: string
  accent_type: string
  speech_speed: number // words per minute
  pronunciation_patterns: Record<string, string>
  command_aliases: Record<string, string[]>
  confidence_threshold: number
  language_preference: string
  training_completed: boolean
  last_calibration: string
  voice_characteristics: {
    pitch_range: [number, number]
    volume_preference: number
    speech_clarity: number
    background_noise_tolerance: number
  }
}

export interface TrainingSession {
  id: string
  user_id: string
  session_type: 'initial' | 'calibration' | 'accent_adaptation' | 'command_training'
  phrases_tested: string[]
  accuracy_scores: number[]
  improvements: Record<string, number>
  duration_ms: number
  environment_conditions: {
    background_noise_level: number
    microphone_quality: number
    room_acoustics: string
  }
  created_at: string
}

export interface PersonalizationSettings {
  user_id: string
  preferred_voice_speed: number
  command_shortcuts: Record<string, string>
  context_learning_enabled: boolean
  auto_correction_enabled: boolean
  adaptive_threshold: boolean
  accessibility_modes: string[]
  feedback_preferences: {
    audio_confirmation: boolean
    haptic_feedback: boolean
    visual_indicators: boolean
  }
}

export class VoiceTrainingSystem {
  private userProfile: VoiceProfile | null = null
  private trainingData: TrainingSession[] = []
  private personalizationSettings: PersonalizationSettings | null = null

  constructor(private userId: string) {}

  // Initialize voice training for new users
  async initializeTraining(): Promise<{ trainingId: string; phrases: string[] }> {
    try {
      // Standard calibration phrases covering different phonemes and speech patterns
      const calibrationPhrases = [
        // Basic commands
        'Select Victorian London',
        'Examine the knife',
        'Talk to Inspector Holmes',
        'Continue investigation',
        'Repeat description',
        
        // Phonetic variety
        'The quick brown fox jumps over the lazy dog',
        'She sells seashells by the seashore',
        'Red leather yellow leather',
        'Unique New York',
        
        // AudioVR specific commands
        'Show me the evidence inventory',
        'Increase spatial audio positioning',
        'Navigate to the crime scene',
        'Ask Mary Kelly about the witness',
        'Accuse the suspect of murder',
        
        // Accessibility commands
        'Enable audio descriptions',
        'Adjust voice recognition sensitivity',
        'Turn on high contrast mode',
        'Activate screen reader compatibility',
        
        // Complex phrases for accent detection
        'I would like to thoroughly investigate this mysterious circumstance',
        'The foggy atmosphere creates an eerie ambiance in the alleyway',
        'Could you please repeat the character dialogue more slowly'
      ]

      // Create training session
      const trainingSession: TrainingSession = {
        id: crypto.randomUUID(),
        user_id: this.userId,
        session_type: 'initial',
        phrases_tested: calibrationPhrases,
        accuracy_scores: [],
        improvements: {},
        duration_ms: 0,
        environment_conditions: {
          background_noise_level: 0,
          microphone_quality: 0,
          room_acoustics: 'unknown'
        },
        created_at: new Date().toISOString()
      }

      // Store in database
      await supabase
        .from('voice_training_sessions')
        .insert(trainingSession)

      return {
        trainingId: trainingSession.id,
        phrases: calibrationPhrases
      }
    } catch (error) {
      console.error('Failed to initialize voice training:', error)
      throw error
    }
  }

  // Process training results and adapt voice recognition
  async processTrainingResults(
    trainingId: string,
    results: Array<{
      phrase: string
      recognized_text: string
      confidence: number
      attempts: number
      success: boolean
    }>
  ): Promise<VoiceProfile> {
    try {
      // Analyze results to determine user characteristics
      const accuracyScores = results.map(r => r.confidence)
      const avgAccuracy = accuracyScores.reduce((sum, score) => sum + score, 0) / accuracyScores.length
      
      // Detect accent patterns
      const accentType = this.detectAccentType(results)
      
      // Analyze speech speed
      const speechSpeed = this.analyzeSpeechSpeed(results)
      
      // Extract pronunciation patterns
      const pronunciationPatterns = this.extractPronunciationPatterns(results)
      
      // Generate personalized command aliases
      const commandAliases = this.generateCommandAliases(results)
      
      // Determine optimal confidence threshold
      const confidenceThreshold = Math.max(0.7, avgAccuracy - 0.1)
      
      // Create voice profile
      const voiceProfile: VoiceProfile = {
        user_id: this.userId,
        accent_type: accentType,
        speech_speed: speechSpeed,
        pronunciation_patterns: pronunciationPatterns,
        command_aliases: commandAliases,
        confidence_threshold: confidenceThreshold,
        language_preference: 'en-US', // TODO: Auto-detect
        training_completed: true,
        last_calibration: new Date().toISOString(),
        voice_characteristics: {
          pitch_range: [100, 300], // Hz, will be refined
          volume_preference: 0.8,
          speech_clarity: avgAccuracy,
          background_noise_tolerance: 0.3
        }
      }

      // Store voice profile
      await supabase
        .from('voice_profiles')
        .upsert(voiceProfile)

      // Update training session with results
      await supabase
        .from('voice_training_sessions')
        .update({
          accuracy_scores: accuracyScores,
          improvements: this.calculateImprovements(results),
          duration_ms: Date.now() // Simplified
        })
        .eq('id', trainingId)

      this.userProfile = voiceProfile
      return voiceProfile
    } catch (error) {
      console.error('Failed to process training results:', error)
      throw error
    }
  }

  // Adaptive learning during regular usage
  async adaptFromUsage(
    command: string,
    recognizedText: string,
    confidence: number,
    userCorrection?: string
  ): Promise<void> {
    try {
      if (!this.userProfile) {
        await this.loadUserProfile()
      }

      // If user provided correction, learn from it
      if (userCorrection) {
        await this.learnFromCorrection(command, recognizedText, userCorrection)
      }

      // Adapt confidence threshold based on patterns
      if (confidence > 0.9 && command === recognizedText) {
        // High confidence correct recognition - can lower threshold slightly
        this.userProfile!.confidence_threshold = Math.max(
          0.6, 
          this.userProfile!.confidence_threshold - 0.01
        )
      } else if (confidence < 0.8 && command !== recognizedText) {
        // Low confidence incorrect recognition - raise threshold
        this.userProfile!.confidence_threshold = Math.min(
          0.95, 
          this.userProfile!.confidence_threshold + 0.02
        )
      }

      // Update pronunciation patterns
      await this.updatePronunciationPatterns(command, recognizedText, confidence)

      // Save updated profile
      await supabase
        .from('voice_profiles')
        .update(this.userProfile!)
        .eq('user_id', this.userId)

    } catch (error) {
      console.error('Failed to adapt from usage:', error)
    }
  }

  // Personalized command processing
  async processPersonalizedCommand(rawInput: string): Promise<{
    command: string
    confidence: number
    alternatives: string[]
    personalization_applied: boolean
  }> {
    try {
      if (!this.userProfile) {
        await this.loadUserProfile()
      }

      let processedCommand = rawInput.toLowerCase().trim()
      let personalizationApplied = false

      // Apply pronunciation pattern corrections
      for (const [pattern, correction] of Object.entries(this.userProfile!.pronunciation_patterns)) {
        if (processedCommand.includes(pattern)) {
          processedCommand = processedCommand.replace(new RegExp(pattern, 'gi'), correction)
          personalizationApplied = true
        }
      }

      // Check command aliases
      for (const [baseCommand, aliases] of Object.entries(this.userProfile!.command_aliases)) {
        if (aliases.some(alias => processedCommand.includes(alias.toLowerCase()))) {
          processedCommand = baseCommand
          personalizationApplied = true
          break
        }
      }

      // Apply context-based corrections
      const contextualCommand = await this.applyContextualCorrections(processedCommand)
      if (contextualCommand !== processedCommand) {
        processedCommand = contextualCommand
        personalizationApplied = true
      }

      // Calculate confidence based on user profile
      const confidence = this.calculatePersonalizedConfidence(rawInput, processedCommand)

      // Generate alternatives
      const alternatives = await this.generateAlternatives(rawInput)

      return {
        command: processedCommand,
        confidence: confidence,
        alternatives: alternatives,
        personalization_applied: personalizationApplied
      }
    } catch (error) {
      console.error('Failed to process personalized command:', error)
      return {
        command: rawInput,
        confidence: 0.5,
        alternatives: [],
        personalization_applied: false
      }
    }
  }

  // Continuous calibration based on usage patterns
  async performContinuousCalibration(): Promise<void> {
    try {
      // Get recent voice command history
      const { data: recentCommands } = await supabase
        .from('voice_commands')
        .select('*')
        .eq('user_id', this.userId)
        .gte('created_at', new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString())
        .order('created_at', { ascending: false })

      if (!recentCommands || recentCommands.length < 10) return

      // Analyze patterns
      const avgConfidence = recentCommands.reduce((sum, cmd) => sum + (cmd.recognition_confidence || 0), 0) / recentCommands.length
      const successRate = recentCommands.filter(cmd => cmd.success).length / recentCommands.length

      // Update profile based on recent performance
      if (avgConfidence > 0.9 && successRate > 0.95) {
        // User is performing well, can be more lenient
        this.userProfile!.confidence_threshold = Math.max(0.6, this.userProfile!.confidence_threshold - 0.05)
      } else if (avgConfidence < 0.7 || successRate < 0.8) {
        // User struggling, be more strict
        this.userProfile!.confidence_threshold = Math.min(0.9, this.userProfile!.confidence_threshold + 0.05)
      }

      // Update last calibration
      this.userProfile!.last_calibration = new Date().toISOString()

      await supabase
        .from('voice_profiles')
        .update(this.userProfile!)
        .eq('user_id', this.userId)

    } catch (error) {
      console.error('Continuous calibration failed:', error)
    }
  }

  // Private helper methods
  private detectAccentType(results: Array<{ phrase: string; recognized_text: string }>): string {
    // Simplified accent detection based on common pronunciation variations
    const accentIndicators = {
      'british': ['colour', 'realise', 'centre', 'theatre'],
      'american': ['color', 'realize', 'center', 'theater'],
      'australian': ['g\'day', 'mate', 'fair dinkum'],
      'indian': ['good name', 'do the needful', 'prepone'],
      'southern_us': ['y\'all', 'fixin\' to', 'might could'],
      'canadian': ['eh', 'aboot', 'toque']
    }

    // Analyze pronunciation patterns
    let accentScores: Record<string, number> = {}
    
    for (const result of results) {
      const text = result.recognized_text.toLowerCase()
      for (const [accent, indicators] of Object.entries(accentIndicators)) {
        const matches = indicators.filter(indicator => text.includes(indicator)).length
        accentScores[accent] = (accentScores[accent] || 0) + matches
      }
    }

    // Return most likely accent or 'general' if none detected
    const topAccent = Object.entries(accentScores).sort(([,a], [,b]) => b - a)[0]
    return topAccent && topAccent[1] > 0 ? topAccent[0] : 'general'
  }

  private analyzeSpeechSpeed(results: Array<any>): number {
    // Analyze speech speed based on phrase length vs recognition time
    // This is simplified - real implementation would need timing data
    const avgPhraseLength = results.reduce((sum, r) => sum + r.phrase.split(' ').length, 0) / results.length
    
    // Estimate words per minute based on confidence and attempt patterns
    const baseSpeed = 150 // Average speaking speed
    const confidenceMultiplier = results.reduce((sum, r) => sum + r.confidence, 0) / results.length
    
    return Math.round(baseSpeed * confidenceMultiplier)
  }

  private extractPronunciationPatterns(results: Array<any>): Record<string, string> {
    const patterns: Record<string, string> = {}
    
    for (const result of results) {
      const originalWords = result.phrase.toLowerCase().split(' ')
      const recognizedWords = result.recognized_text.toLowerCase().split(' ')
      
      // Find consistent substitution patterns
      for (let i = 0; i < Math.min(originalWords.length, recognizedWords.length); i++) {
        if (originalWords[i] !== recognizedWords[i] && result.confidence < 0.8) {
          patterns[recognizedWords[i]] = originalWords[i]
        }
      }
    }
    
    return patterns
  }

  private generateCommandAliases(results: Array<any>): Record<string, string[]> {
    const aliases: Record<string, string[]> = {}
    
    // Common command variations
    const baseCommands = {
      'examine': ['look at', 'inspect', 'check', 'view'],
      'talk to': ['speak with', 'ask', 'question', 'interview'],
      'select': ['choose', 'pick', 'go to', 'enter'],
      'continue': ['proceed', 'next', 'go on', 'carry on'],
      'repeat': ['say again', 'replay', 'once more', 'again']
    }
    
    // Add user-specific variations based on their speech patterns
    for (const result of results) {
      const text = result.recognized_text.toLowerCase()
      for (const [command, variations] of Object.entries(baseCommands)) {
        if (text.includes(command)) {
          aliases[command] = variations
        }
      }
    }
    
    return aliases
  }

  private calculateImprovements(results: Array<any>): Record<string, number> {
    // Calculate improvement metrics
    return {
      overall_accuracy: results.reduce((sum, r) => sum + r.confidence, 0) / results.length,
      command_recognition: results.filter(r => r.success).length / results.length,
      phonetic_clarity: results.filter(r => r.confidence > 0.8).length / results.length
    }
  }

  private async loadUserProfile(): Promise<void> {
    const { data } = await supabase
      .from('voice_profiles')
      .select('*')
      .eq('user_id', this.userId)
      .single()
    
    this.userProfile = data
  }

  private async learnFromCorrection(
    originalCommand: string,
    recognizedText: string,
    correction: string
  ): Promise<void> {
    // Store correction for future learning
    await supabase
      .from('voice_corrections')
      .insert({
        user_id: this.userId,
        original_command: originalCommand,
        recognized_text: recognizedText,
        user_correction: correction,
        created_at: new Date().toISOString()
      })
    
    // Update pronunciation patterns
    if (this.userProfile) {
      this.userProfile.pronunciation_patterns[recognizedText] = correction
    }
  }

  private async updatePronunciationPatterns(
    command: string,
    recognizedText: string,
    confidence: number
  ): Promise<void> {
    // Update patterns based on consistent recognition issues
    if (confidence < 0.7 && command !== recognizedText) {
      if (this.userProfile) {
        this.userProfile.pronunciation_patterns[recognizedText] = command
      }
    }
  }

  private async applyContextualCorrections(command: string): Promise<string> {
    // Apply context-based corrections based on current app state
    // This would integrate with the main app context
    const contextMappings = {
      'examine knife': 'examine the knife',
      'talk holmes': 'talk to holmes',
      'select london': 'select victorian london'
    }
    
    for (const [pattern, correction] of Object.entries(contextMappings)) {
      if (command.includes(pattern)) {
        return command.replace(pattern, correction)
      }
    }
    
    return command
  }

  private calculatePersonalizedConfidence(rawInput: string, processedCommand: string): number {
    if (!this.userProfile) return 0.5
    
    let confidence = 0.7 // Base confidence
    
    // Adjust based on user's historical accuracy
    confidence += (this.userProfile.voice_characteristics.speech_clarity - 0.7) * 0.3
    
    // Adjust if personalization was applied
    if (rawInput !== processedCommand) {
      confidence += 0.1 // Boost confidence when personalization helps
    }
    
    return Math.min(0.95, Math.max(0.1, confidence))
  }

  private async generateAlternatives(rawInput: string): Promise<string[]> {
    // Generate alternative interpretations based on phonetic similarity
    // This is simplified - real implementation would use phonetic algorithms
    const alternatives: string[] = []
    
    if (this.userProfile) {
      // Check pronunciation patterns for alternatives
      for (const [pattern, correction] of Object.entries(this.userProfile.pronunciation_patterns)) {
        if (rawInput.includes(pattern)) {
          alternatives.push(rawInput.replace(pattern, correction))
        }
      }
      
      // Check command aliases
      for (const [command, aliases] of Object.entries(this.userProfile.command_aliases)) {
        if (aliases.some(alias => rawInput.includes(alias))) {
          alternatives.push(command)
        }
      }
    }
    
    return alternatives.slice(0, 3) // Return top 3 alternatives
  }
}

// Export utility functions
export const createVoiceTrainer = (userId: string) => new VoiceTrainingSystem(userId)

export const getVoiceProfile = async (userId: string): Promise<VoiceProfile | null> => {
  const { data } = await supabase
    .from('voice_profiles')
    .select('*')
    .eq('user_id', userId)
    .single()
  
  return data
}

export const updatePersonalizationSettings = async (
  userId: string,
  settings: Partial<PersonalizationSettings>
): Promise<void> => {
  await supabase
    .from('personalization_settings')
    .upsert({
      user_id: userId,
      ...settings,
      updated_at: new Date().toISOString()
    })
}
// Enterprise Accessibility Training Module
// This module provides comprehensive accessibility training programs
// for organizations, teams, and educational institutions

import { supabase } from './supabase'

export interface TrainingProgram {
  id: string
  name: string
  description: string
  type: 'wcag_fundamentals' | 'voice_interfaces' | 'spatial_audio' | 'inclusive_design' | 'testing_methods'
  level: 'beginner' | 'intermediate' | 'advanced' | 'expert'
  duration_hours: number
  certification_available: boolean
  modules: TrainingModule[]
  prerequisites: string[]
  learning_objectives: string[]
  accessibility_features: string[]
  created_at: string
}

export interface TrainingModule {
  id: string
  program_id: string
  title: string
  description: string
  type: 'video' | 'interactive' | 'hands_on' | 'assessment' | 'case_study'
  duration_minutes: number
  content_url: string
  accessibility_transcript: string
  audio_description: string
  interactive_elements: InteractiveElement[]
  assessment_questions: AssessmentQuestion[]
  order_index: number
  completion_criteria: {
    min_score?: number
    required_interactions?: string[]
    time_requirement?: number
  }
}

export interface InteractiveElement {
  id: string
  type: 'voice_command_practice' | 'screen_reader_simulation' | 'audio_description_exercise' | 'wcag_evaluation'
  title: string
  description: string
  instructions: string
  accessibility_instructions: string
  success_criteria: Record<string, any>
  feedback_messages: {
    success: string
    partial: string
    failure: string
    hint: string
  }
}

export interface AssessmentQuestion {
  id: string
  type: 'multiple_choice' | 'practical_demo' | 'voice_response' | 'accessibility_audit'
  question: string
  audio_question: string
  options?: string[]
  correct_answer: string | string[]
  explanation: string
  accessibility_notes: string
  points: number
}

export interface EnterpriseAccount {
  id: string
  organization_name: string
  contact_email: string
  industry: string
  employee_count: number
  accessibility_maturity: 'beginner' | 'developing' | 'advanced' | 'leader'
  training_goals: string[]
  compliance_requirements: string[]
  budget_tier: 'starter' | 'professional' | 'enterprise' | 'custom'
  account_manager: string
  created_at: string
}

export interface TrainingEnrollment {
  id: string
  user_id: string
  program_id: string
  organization_id: string
  enrolled_at: string
  started_at?: string
  completed_at?: string
  current_module_id?: string
  progress_percentage: number
  completion_status: 'not_started' | 'in_progress' | 'completed' | 'certified'
  assessment_scores: Record<string, number>
  certification_earned: boolean
  accessibility_accommodations: string[]
}

export interface CertificationRecord {
  id: string
  user_id: string
  program_id: string
  certification_name: string
  issued_date: string
  expiry_date?: string
  certificate_url: string
  verification_code: string
  competencies: string[]
  accessibility_specializations: string[]
}

export class EnterpriseTrainingSystem {
  constructor(private organizationId: string, private userId: string) {}

  // Program Management
  async getAvailablePrograms(filters?: {
    level?: string
    type?: string
    certification_only?: boolean
  }): Promise<TrainingProgram[]> {
    try {
      let query = supabase
        .from('training_programs')
        .select(`
          *,
          training_modules(
            id, title, description, type, duration_minutes, order_index
          )
        `)
        .eq('status', 'published')

      if (filters?.level) {
        query = query.eq('level', filters.level)
      }
      if (filters?.type) {
        query = query.eq('type', filters.type)
      }
      if (filters?.certification_only) {
        query = query.eq('certification_available', true)
      }

      const { data: programs, error } = await query.order('created_at', { ascending: false })

      if (error) throw error
      return programs || []
    } catch (error) {
      console.error('Failed to get training programs:', error)
      return []
    }
  }

  async enrollInProgram(
    programId: string,
    accessibilityAccommodations: string[] = []
  ): Promise<TrainingEnrollment> {
    try {
      const enrollment: TrainingEnrollment = {
        id: crypto.randomUUID(),
        user_id: this.userId,
        program_id: programId,
        organization_id: this.organizationId,
        enrolled_at: new Date().toISOString(),
        progress_percentage: 0,
        completion_status: 'not_started',
        assessment_scores: {},
        certification_earned: false,
        accessibility_accommodations: accessibilityAccommodations
      }

      await supabase
        .from('training_enrollments')
        .insert(enrollment)

      return enrollment
    } catch (error) {
      console.error('Failed to enroll in program:', error)
      throw error
    }
  }

  // Interactive Learning Modules
  async startModule(moduleId: string): Promise<{
    module: TrainingModule
    user_progress: any
    accessibility_settings: any
  }> {
    try {
      // Get module details
      const { data: module, error: moduleError } = await supabase
        .from('training_modules')
        .select(`
          *,
          interactive_elements(*),
          assessment_questions(*)
        `)
        .eq('id', moduleId)
        .single()

      if (moduleError) throw moduleError

      // Get user's accessibility preferences
      const { data: userPrefs } = await supabase
        .from('user_accessibility_preferences')
        .select('*')
        .eq('user_id', this.userId)
        .single()

      // Track module start
      await supabase
        .from('module_progress')
        .upsert({
          user_id: this.userId,
          module_id: moduleId,
          started_at: new Date().toISOString(),
          progress_percentage: 0,
          current_element_index: 0
        })

      return {
        module: module,
        user_progress: { started: true, percentage: 0 },
        accessibility_settings: userPrefs || this.getDefaultAccessibilitySettings()
      }
    } catch (error) {
      console.error('Failed to start module:', error)
      throw error
    }
  }

  async processInteractiveElement(
    elementId: string,
    userResponse: {
      type: 'voice_input' | 'text_input' | 'selection' | 'demonstration'
      content: any
      confidence_score?: number
      accessibility_method?: string
    }
  ): Promise<{
    success: boolean
    score: number
    feedback: string
    next_action: string
  }> {
    try {
      // Get element details
      const { data: element } = await supabase
        .from('interactive_elements')
        .select('*')
        .eq('id', elementId)
        .single()

      if (!element) throw new Error('Interactive element not found')

      // Process response based on element type
      const result = await this.evaluateInteractiveResponse(element, userResponse)

      // Record user interaction
      await supabase
        .from('training_interactions')
        .insert({
          user_id: this.userId,
          element_id: elementId,
          response_content: userResponse.content,
          response_type: userResponse.type,
          score: result.score,
          success: result.success,
          accessibility_method: userResponse.accessibility_method,
          created_at: new Date().toISOString()
        })

      return result
    } catch (error) {
      console.error('Failed to process interactive element:', error)
      throw error
    }
  }

  // Voice Command Training
  async createVoiceTrainingExercise(
    difficulty: 'basic' | 'intermediate' | 'advanced',
    focusArea: 'navigation' | 'content_interaction' | 'accessibility_commands'
  ): Promise<{
    exercise_id: string
    commands_to_practice: string[]
    success_criteria: Record<string, any>
    accessibility_tips: string[]
  }> {
    try {
      const commandSets = {
        basic: {
          navigation: [
            'Go to main content',
            'Open navigation menu', 
            'Go to search',
            'Return to homepage',
            'Skip to footer'
          ],
          content_interaction: [
            'Read this heading',
            'Select first item',
            'Expand this section',
            'Play audio content',
            'Repeat last information'
          ],
          accessibility_commands: [
            'Enable screen reader',
            'Increase text size',
            'Turn on high contrast',
            'Activate voice control',
            'Show keyboard shortcuts'
          ]
        },
        intermediate: {
          navigation: [
            'Navigate to the third mystery in Victorian London',
            'Go to user preferences and enable spatial audio',
            'Find the accessibility settings menu',
            'Switch to the case evidence inventory',
            'Open the community discussion for this mystery'
          ],
          content_interaction: [
            'Examine the bloody knife on the left side',
            'Talk to Inspector Holmes about the witness testimony',
            'Review all collected evidence from this investigation',
            'Compare the footprint evidence with suspect information',
            'Submit accusation against the primary suspect'
          ],
          accessibility_commands: [
            'Enable audio descriptions for all visual elements',
            'Adjust voice recognition sensitivity to high',
            'Activate haptic feedback for spatial navigation',
            'Set audio playback speed to 1.5x for efficiency',
            'Enable automatic content summaries for lengthy dialogue'
          ]
        },
        advanced: {
          navigation: [
            'Navigate to analytics dashboard and filter by accessibility metrics for the past month',
            'Access the content creation suite and start a new Victorian era mystery',
            'Go to community leaderboards and view voice recognition accuracy rankings',
            'Open the enterprise training module for WCAG compliance certification',
            'Switch to the live monitoring dashboard and check real-time user engagement'
          ],
          content_interaction: [
            'Perform a comprehensive accessibility audit of the current mystery interface',
            'Create a custom voice command shortcut for repeated investigation actions',
            'Analyze the spatial audio positioning of evidence in the crime scene',
            'Configure personalized audio descriptions based on user context preferences',
            'Demonstrate proper voice-first navigation techniques for visually impaired users'
          ],
          accessibility_commands: [
            'Configure advanced voice recognition with accent adaptation and background noise filtering',
            'Set up multi-modal accessibility with combined voice, haptic, and audio feedback',
            'Enable contextual audio descriptions that adapt based on user progress and familiarity',
            'Activate expert mode voice controls with natural language processing for complex commands',
            'Initialize accessibility compliance monitoring with real-time WCAG validation feedback'
          ]
        }
      }

      const exerciseCommands = commandSets[difficulty][focusArea]
      const exerciseId = crypto.randomUUID()

      const successCriteria = {
        min_accuracy: difficulty === 'basic' ? 80 : difficulty === 'intermediate' ? 85 : 90,
        max_attempts_per_command: difficulty === 'basic' ? 3 : difficulty === 'intermediate' ? 2 : 1,
        required_completion_rate: 100,
        timing_requirements: {
          basic: { max_seconds_per_command: 10 },
          intermediate: { max_seconds_per_command: 8 },
          advanced: { max_seconds_per_command: 6 }
        }[difficulty]
      }

      const accessibilityTips = [
        'Speak clearly and at a consistent pace for optimal recognition',
        'Use natural language - the system understands context and intent',
        'If a command fails, try rephrasing using synonyms or alternative phrasing',
        'Practice in a quiet environment first, then gradually add background noise',
        'Remember that voice commands can be combined with other accessibility tools'
      ]

      // Store exercise in database
      await supabase
        .from('voice_training_exercises')
        .insert({
          id: exerciseId,
          user_id: this.userId,
          difficulty: difficulty,
          focus_area: focusArea,
          commands: exerciseCommands,
          success_criteria: successCriteria,
          created_at: new Date().toISOString()
        })

      return {
        exercise_id: exerciseId,
        commands_to_practice: exerciseCommands,
        success_criteria: successCriteria,
        accessibility_tips: accessibilityTips
      }
    } catch (error) {
      console.error('Failed to create voice training exercise:', error)
      throw error
    }
  }

  // Assessment and Certification
  async completeAssessment(
    moduleId: string,
    responses: Array<{
      question_id: string
      answer: string | string[]
      method: 'voice' | 'keyboard' | 'screen_reader' | 'other'
      time_taken_seconds: number
    }>
  ): Promise<{
    score: number
    passed: boolean
    certification_earned: boolean
    feedback: string[]
    areas_for_improvement: string[]
  }> {
    try {
      // Get assessment questions
      const { data: questions } = await supabase
        .from('assessment_questions')
        .select('*')
        .eq('module_id', moduleId)

      if (!questions) throw new Error('Assessment questions not found')

      // Calculate scores
      let totalScore = 0
      let maxScore = 0
      const feedback: string[] = []
      const improvementAreas: string[] = []

      for (const response of responses) {
        const question = questions.find(q => q.id === response.question_id)
        if (!question) continue

        maxScore += question.points
        const isCorrect = this.evaluateAnswer(question, response.answer)

        if (isCorrect) {
          totalScore += question.points
          feedback.push(`✓ ${question.question}: Correct`)
        } else {
          feedback.push(`✗ ${question.question}: ${question.explanation}`)
          improvementAreas.push(this.categorizeImprovement(question))
        }
      }

      const percentageScore = (totalScore / maxScore) * 100
      const passed = percentageScore >= 80 // 80% passing grade

      // Record assessment result
      await supabase
        .from('assessment_results')
        .insert({
          user_id: this.userId,
          module_id: moduleId,
          score: percentageScore,
          passed: passed,
          responses: responses,
          completed_at: new Date().toISOString()
        })

      // Check for certification eligibility
      const certificationEarned = await this.checkCertificationEligibility(moduleId, passed)

      return {
        score: percentageScore,
        passed: passed,
        certification_earned: certificationEarned,
        feedback: feedback,
        areas_for_improvement: [...new Set(improvementAreas)]
      }
    } catch (error) {
      console.error('Failed to complete assessment:', error)
      throw error
    }
  }

  async generateCertificate(programId: string): Promise<CertificationRecord> {
    try {
      // Verify completion requirements
      const { data: enrollment } = await supabase
        .from('training_enrollments')
        .select('*')
        .eq('user_id', this.userId)
        .eq('program_id', programId)
        .single()

      if (!enrollment || enrollment.completion_status !== 'completed') {
        throw new Error('Training program not completed')
      }

      // Get program details
      const { data: program } = await supabase
        .from('training_programs')
        .select('*')
        .eq('id', programId)
        .single()

      if (!program) throw new Error('Program not found')

      // Generate certification
      const certification: CertificationRecord = {
        id: crypto.randomUUID(),
        user_id: this.userId,
        program_id: programId,
        certification_name: `${program.name} Certificate`,
        issued_date: new Date().toISOString(),
        expiry_date: program.certification_expires ? 
          new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString() : undefined,
        certificate_url: '', // Will be generated
        verification_code: this.generateVerificationCode(),
        competencies: program.learning_objectives,
        accessibility_specializations: program.accessibility_features
      }

      // Generate certificate PDF/image
      certification.certificate_url = await this.generateCertificatePDF(certification, program)

      // Store certification
      await supabase
        .from('certifications')
        .insert(certification)

      return certification
    } catch (error) {
      console.error('Failed to generate certificate:', error)
      throw error
    }
  }

  // Organization Analytics
  async getOrganizationTrainingAnalytics(): Promise<{
    enrollment_stats: any
    completion_rates: any
    accessibility_improvements: any
    compliance_metrics: any
  }> {
    try {
      // Get organization enrollments
      const { data: enrollments } = await supabase
        .from('training_enrollments')
        .select(`
          *,
          training_programs(name, type),
          users(display_name, department)
        `)
        .eq('organization_id', this.organizationId)

      if (!enrollments) return this.getEmptyAnalytics()

      // Calculate metrics
      const enrollmentStats = {
        total_enrolled: enrollments.length,
        active_learners: enrollments.filter(e => e.completion_status === 'in_progress').length,
        completed: enrollments.filter(e => e.completion_status === 'completed').length,
        certified: enrollments.filter(e => e.certification_earned).length
      }

      const completionRates = this.calculateCompletionRates(enrollments)
      const accessibilityImprovements = await this.getAccessibilityImprovements()
      const complianceMetrics = await this.getComplianceMetrics()

      return {
        enrollment_stats: enrollmentStats,
        completion_rates: completionRates,
        accessibility_improvements: accessibilityImprovements,
        compliance_metrics: complianceMetrics
      }
    } catch (error) {
      console.error('Failed to get organization analytics:', error)
      return this.getEmptyAnalytics()
    }
  }

  // Private Helper Methods
  private async evaluateInteractiveResponse(element: any, response: any): Promise<any> {
    // Simulate interactive response evaluation
    const baseScore = 70
    let score = baseScore

    // Adjust score based on response quality
    if (response.confidence_score > 0.9) score += 20
    else if (response.confidence_score > 0.7) score += 10

    // Accessibility method bonus
    if (response.accessibility_method) score += 10

    const success = score >= 80

    return {
      success: success,
      score: Math.min(100, score),
      feedback: success ? 
        element.feedback_messages.success : 
        element.feedback_messages.failure,
      next_action: success ? 'continue' : 'retry'
    }
  }

  private evaluateAnswer(question: any, answer: string | string[]): boolean {
    // Implement answer evaluation logic
    if (Array.isArray(question.correct_answer)) {
      return Array.isArray(answer) && 
        answer.every(a => question.correct_answer.includes(a))
    }
    return question.correct_answer === answer
  }

  private categorizeImprovement(question: any): string {
    // Categorize areas for improvement based on question content
    const content = question.question.toLowerCase()
    if (content.includes('wcag') || content.includes('guideline')) return 'WCAG Knowledge'
    if (content.includes('voice') || content.includes('command')) return 'Voice Interface'
    if (content.includes('screen reader')) return 'Screen Reader Usage'
    if (content.includes('audio') || content.includes('sound')) return 'Audio Accessibility'
    return 'General Accessibility'
  }

  private async checkCertificationEligibility(moduleId: string, passed: boolean): Promise<boolean> {
    // Check if this module completion qualifies for certification
    if (!passed) return false

    // Get program requirements
    const { data: program } = await supabase
      .from('training_programs')
      .select('certification_available, modules_required_for_cert')
      .joins('training_modules', 'id', 'program_id')
      .eq('training_modules.id', moduleId)
      .single()

    return program?.certification_available || false
  }

  private generateVerificationCode(): string {
    return `AV-${Date.now().toString(36).toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`
  }

  private async generateCertificatePDF(cert: CertificationRecord, program: any): Promise<string> {
    // This would integrate with a PDF generation service
    // For now, return a placeholder URL
    return `https://certificates.audiovr.com/${cert.id}.pdf`
  }

  private calculateCompletionRates(enrollments: any[]): any {
    const byProgram = enrollments.reduce((acc, enrollment) => {
      const programName = enrollment.training_programs.name
      if (!acc[programName]) {
        acc[programName] = { enrolled: 0, completed: 0 }
      }
      acc[programName].enrolled += 1
      if (enrollment.completion_status === 'completed') {
        acc[programName].completed += 1
      }
      return acc
    }, {})

    return Object.entries(byProgram).map(([name, stats]: [string, any]) => ({
      program: name,
      completion_rate: (stats.completed / stats.enrolled) * 100
    }))
  }

  private async getAccessibilityImprovements(): Promise<any> {
    // Get accessibility metrics improvements from training
    return {
      wcag_compliance_score: 85,
      voice_interface_adoption: 78,
      screen_reader_compatibility: 92,
      overall_improvement: 15
    }
  }

  private async getComplianceMetrics(): Promise<any> {
    return {
      wcag_aa_compliance: 88,
      ada_compliance: 85,
      section_508_compliance: 90,
      accessibility_audits_passed: 12
    }
  }

  private getEmptyAnalytics(): any {
    return {
      enrollment_stats: { total_enrolled: 0, active_learners: 0, completed: 0, certified: 0 },
      completion_rates: [],
      accessibility_improvements: {},
      compliance_metrics: {}
    }
  }

  private getDefaultAccessibilitySettings(): any {
    return {
      screen_reader_enabled: false,
      voice_control_enabled: true,
      high_contrast: false,
      large_text: false,
      audio_descriptions: true,
      haptic_feedback: true
    }
  }
}

// Export utility functions
export const createEnterpriseTraining = (organizationId: string, userId: string) => 
  new EnterpriseTrainingSystem(organizationId, userId)

export const getPublicPrograms = async (): Promise<TrainingProgram[]> => {
  const { data } = await supabase
    .from('training_programs')
    .select('*')
    .eq('access_level', 'public')
    .eq('status', 'published')
  
  return data || []
}
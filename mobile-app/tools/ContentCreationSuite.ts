import { DetectiveCase, Character, Evidence, GameWorld, AudioAsset } from '../types';

export interface CaseTemplate {
  id: string;
  name: string;
  description: string;
  difficulty: number;
  estimatedDuration: number;
  structure: CaseChapter[];
  requiredAssets: ContentAsset[];
  voiceActingNotes: VoiceActingNote[];
}

export interface CaseChapter {
  id: string;
  title: string;
  description: string;
  objectives: ChapterObjective[];
  locations: Location[];
  dialogue: DialogueEntry[];
  evidence: Evidence[];
  choices: Choice[];
  triggers: AudioTrigger[];
}

export interface ChapterObjective {
  id: string;
  description: string;
  type: 'examine' | 'question' | 'navigate' | 'deduce' | 'collect';
  targetId: string;
  isOptional: boolean;
  completionText: string;
  hints: string[];
}

export interface Location {
  id: string;
  name: string;
  description: string;
  audioDescription: string;
  ambientSound?: string;
  spatialElements: SpatialElement[];
  interactableObjects: InteractableObject[];
  connectedLocations: string[];
}

export interface SpatialElement {
  id: string;
  name: string;
  position: { x: number; y: number; z: number };
  audioFile: string;
  volume: number;
  isLooping: boolean;
  triggerDistance: number;
}

export interface InteractableObject {
  id: string;
  name: string;
  description: string;
  audioDescription: string;
  examineText: string;
  interactionSound?: string;
  revealsEvidence?: string[];
  requiresEvidence?: string[];
}

export interface DialogueEntry {
  id: string;
  characterId: string;
  text: string;
  audioFile?: string;
  emotion: 'neutral' | 'happy' | 'sad' | 'angry' | 'suspicious' | 'nervous' | 'confident';
  triggers: string[];
  conditions: DialogueCondition[];
  responses: DialogueResponse[];
}

export interface DialogueCondition {
  type: 'has_evidence' | 'completed_objective' | 'character_trust' | 'time_constraint';
  value: string | number;
  operator: 'equals' | 'greater' | 'less' | 'contains';
}

export interface DialogueResponse {
  id: string;
  text: string;
  voiceCommand: string[];
  effect: ResponseEffect;
  nextDialogue?: string;
}

export interface ResponseEffect {
  type: 'reveal_evidence' | 'change_trust' | 'unlock_location' | 'advance_plot' | 'end_conversation';
  value: any;
}

export interface Choice {
  id: string;
  description: string;
  conditions: DialogueCondition[];
  consequences: ChoiceConsequence[];
  voiceCommands: string[];
}

export interface ChoiceConsequence {
  type: 'unlock_evidence' | 'change_character_state' | 'unlock_location' | 'fail_objective';
  targetId: string;
  value: any;
}

export interface AudioTrigger {
  id: string;
  type: 'location_enter' | 'objective_complete' | 'evidence_found' | 'dialogue_end';
  condition: string;
  audioAssets: string[];
  delay: number;
  fadeIn: number;
  fadeOut: number;
}

export interface ContentAsset {
  id: string;
  name: string;
  type: 'audio' | 'image' | 'text';
  path: string;
  description: string;
  tags: string[];
  size: number;
  duration?: number;
}

export interface VoiceActingNote {
  characterId: string;
  characterName: string;
  voiceDescription: string;
  personality: string;
  speakingStyle: string;
  accent?: string;
  sampleLines: string[];
  emotionalRange: string[];
}

export interface ValidationResult {
  isValid: boolean;
  errors: ValidationError[];
  warnings: ValidationWarning[];
  suggestions: string[];
}

export interface ValidationError {
  type: 'missing_required' | 'invalid_reference' | 'duplicate_id' | 'logic_error';
  message: string;
  location: string;
  severity: 'critical' | 'high' | 'medium' | 'low';
}

export interface ValidationWarning {
  type: 'accessibility' | 'performance' | 'user_experience' | 'content_quality';
  message: string;
  suggestion: string;
}

export class ContentCreationSuite {
  private caseTemplates: Map<string, CaseTemplate> = new Map();
  private audioAssets: Map<string, ContentAsset> = new Map();
  private characters: Map<string, Character> = new Map();
  
  // Event callbacks
  private onValidationComplete?: (result: ValidationResult) => void;
  private onAssetProcessed?: (asset: ContentAsset) => void;
  private onExportComplete?: (exportPath: string) => void;

  constructor() {
    this.initializeDefaultTemplates();
  }

  // Set event callbacks
  setEventCallbacks({
    onValidationComplete,
    onAssetProcessed,
    onExportComplete,
  }: {
    onValidationComplete?: (result: ValidationResult) => void;
    onAssetProcessed?: (asset: ContentAsset) => void;
    onExportComplete?: (exportPath: string) => void;
  }): void {
    this.onValidationComplete = onValidationComplete;
    this.onAssetProcessed = onAssetProcessed;
    this.onExportComplete = onExportComplete;
  }

  // Initialize default case templates
  private initializeDefaultTemplates(): void {
    const mysteryTemplate: CaseTemplate = {
      id: 'classic-mystery',
      name: 'Classic Murder Mystery',
      description: 'Traditional detective mystery with investigation, interrogation, and deduction phases',
      difficulty: 3,
      estimatedDuration: 45,
      structure: [
        {
          id: 'introduction',
          title: 'Crime Scene Investigation',
          description: 'Discover the crime and gather initial evidence',
          objectives: [
            {
              id: 'examine-body',
              description: 'Examine the victim',
              type: 'examine',
              targetId: 'victim-body',
              isOptional: false,
              completionText: 'You have examined the victim and noted key details',
              hints: ['Look for signs of struggle', 'Note the time of death', 'Check for identifying marks']
            }
          ],
          locations: [],
          dialogue: [],
          evidence: [],
          choices: [],
          triggers: []
        }
      ],
      requiredAssets: [],
      voiceActingNotes: []
    };

    this.caseTemplates.set(mysteryTemplate.id, mysteryTemplate);
  }

  // Create new case from template
  createCaseFromTemplate(templateId: string, caseData: Partial<DetectiveCase>): DetectiveCase | null {
    const template = this.caseTemplates.get(templateId);
    if (!template) {
      return null;
    }

    const newCase: DetectiveCase = {
      id: caseData.id || `case-${Date.now()}`,
      title: caseData.title || template.name,
      worldId: caseData.worldId || 'default-world',
      description: caseData.description || template.description,
      difficulty: caseData.difficulty || template.difficulty,
      estimatedDuration: caseData.estimatedDuration || template.estimatedDuration,
      currentChapter: 1,
      totalChapters: template.structure.length,
      backgroundImage: caseData.backgroundImage || '',
      characters: caseData.characters || [],
      evidence: caseData.evidence || [],
      progress: 0,
      isUnlocked: true,
      lastPlayedAt: new Date(),
    };

    return newCase;
  }

  // Create character with voice acting notes
  createCharacter(characterData: {
    name: string;
    role: string;
    description: string;
    voiceDescription: string;
    personality: string;
    speakingStyle: string;
    accent?: string;
    emotionalRange: string[];
  }): Character {
    const character: Character = {
      id: `char-${Date.now()}`,
      name: characterData.name,
      role: characterData.role,
      avatar: `https://via.placeholder.com/120x120/6c5ce7/FFFFFF?text=${characterData.name.substring(0, 2)}`,
      voiceActor: 'TBD',
      description: characterData.description,
      isAlive: true,
      suspicionLevel: 0,
    };

    const voiceNote: VoiceActingNote = {
      characterId: character.id,
      characterName: character.name,
      voiceDescription: characterData.voiceDescription,
      personality: characterData.personality,
      speakingStyle: characterData.speakingStyle,
      accent: characterData.accent,
      sampleLines: [],
      emotionalRange: characterData.emotionalRange,
    };

    this.characters.set(character.id, character);
    return character;
  }

  // Create dialogue with accessibility considerations
  createDialogue(dialogueData: {
    characterId: string;
    text: string;
    emotion: DialogueEntry['emotion'];
    audioDescription?: string;
    voiceCommands?: string[];
  }): DialogueEntry {
    const dialogue: DialogueEntry = {
      id: `dialogue-${Date.now()}`,
      characterId: dialogueData.characterId,
      text: dialogueData.text,
      emotion: dialogueData.emotion,
      triggers: [],
      conditions: [],
      responses: [],
    };

    // Add accessibility enhancements
    if (dialogueData.audioDescription) {
      dialogue.triggers.push(`audio_description:${dialogueData.audioDescription}`);
    }

    // Add voice command alternatives
    if (dialogueData.voiceCommands) {
      dialogue.responses = dialogueData.voiceCommands.map((cmd, index) => ({
        id: `response-${Date.now()}-${index}`,
        text: cmd,
        voiceCommand: [cmd.toLowerCase()],
        effect: {
          type: 'advance_plot',
          value: null,
        },
      }));
    }

    return dialogue;
  }

  // Create interactive object with spatial audio
  createInteractiveObject(objectData: {
    name: string;
    description: string;
    location: string;
    position?: { x: number; y: number; z: number };
    audioFile?: string;
    revealsEvidence?: string[];
  }): InteractableObject {
    return {
      id: `object-${Date.now()}`,
      name: objectData.name,
      description: objectData.description,
      audioDescription: `You can hear ${objectData.name} ${objectData.position ? 'to your left' : 'nearby'}`,
      examineText: `You examine the ${objectData.name}. ${objectData.description}`,
      interactionSound: objectData.audioFile,
      revealsEvidence: objectData.revealsEvidence,
      requiresEvidence: [],
    };
  }

  // Validate case content for accessibility and completeness
  validateCase(caseData: DetectiveCase, chapters: CaseChapter[]): ValidationResult {
    const errors: ValidationError[] = [];
    const warnings: ValidationWarning[] = [];
    const suggestions: string[] = [];

    // Check required fields
    if (!caseData.title || caseData.title.trim().length === 0) {
      errors.push({
        type: 'missing_required',
        message: 'Case title is required',
        location: 'caseData.title',
        severity: 'critical',
      });
    }

    if (!caseData.description || caseData.description.trim().length === 0) {
      errors.push({
        type: 'missing_required',
        message: 'Case description is required',
        location: 'caseData.description',
        severity: 'high',
      });
    }

    // Validate chapters
    chapters.forEach((chapter, chapterIndex) => {
      this.validateChapter(chapter, chapterIndex, errors, warnings, suggestions);
    });

    // Check accessibility requirements
    this.validateAccessibility(caseData, chapters, warnings, suggestions);

    // Check audio asset completeness
    this.validateAudioAssets(chapters, errors, warnings);

    const result: ValidationResult = {
      isValid: errors.filter(e => e.severity === 'critical' || e.severity === 'high').length === 0,
      errors,
      warnings,
      suggestions,
    };

    this.onValidationComplete?.(result);
    return result;
  }

  // Validate individual chapter
  private validateChapter(
    chapter: CaseChapter,
    chapterIndex: number,
    errors: ValidationError[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    const chapterLocation = `chapters[${chapterIndex}]`;

    // Check chapter structure
    if (!chapter.objectives || chapter.objectives.length === 0) {
      warnings.push({
        type: 'content_quality',
        message: `Chapter "${chapter.title}" has no objectives`,
        suggestion: 'Add at least one objective to guide player progression',
      });
    }

    // Validate objectives
    chapter.objectives.forEach((objective, objIndex) => {
      if (!objective.description || objective.description.trim().length === 0) {
        errors.push({
          type: 'missing_required',
          message: `Objective ${objIndex} in chapter "${chapter.title}" lacks description`,
          location: `${chapterLocation}.objectives[${objIndex}]`,
          severity: 'medium',
        });
      }

      // Check for accessibility hints
      if (!objective.hints || objective.hints.length === 0) {
        warnings.push({
          type: 'accessibility',
          message: `Objective "${objective.description}" has no hints for accessibility`,
          suggestion: 'Add helpful hints for users who might need guidance',
        });
      }
    });

    // Validate dialogue accessibility
    chapter.dialogue.forEach((dialogue, dialogueIndex) => {
      if (!dialogue.text || dialogue.text.trim().length === 0) {
        errors.push({
          type: 'missing_required',
          message: `Dialogue ${dialogueIndex} in chapter "${chapter.title}" has no text`,
          location: `${chapterLocation}.dialogue[${dialogueIndex}]`,
          severity: 'high',
        });
      }

      // Check for voice command alternatives
      if (!dialogue.responses || dialogue.responses.length === 0) {
        warnings.push({
          type: 'accessibility',
          message: `Dialogue "${dialogue.text.substring(0, 30)}..." has no voice command responses`,
          suggestion: 'Add voice command alternatives for accessibility',
        });
      }
    });
  }

  // Validate accessibility requirements
  private validateAccessibility(
    caseData: DetectiveCase,
    chapters: CaseChapter[],
    warnings: ValidationWarning[],
    suggestions: string[]
  ): void {
    // Check for audio descriptions
    let hasAudioDescriptions = false;
    chapters.forEach(chapter => {
      chapter.locations.forEach(location => {
        if (location.audioDescription) {
          hasAudioDescriptions = true;
        }
      });
    });

    if (!hasAudioDescriptions) {
      warnings.push({
        type: 'accessibility',
        message: 'No audio descriptions found for locations',
        suggestion: 'Add audio descriptions for all locations to support visually impaired users',
      });
    }

    // Check for voice commands
    let hasVoiceCommands = false;
    chapters.forEach(chapter => {
      chapter.choices.forEach(choice => {
        if (choice.voiceCommands && choice.voiceCommands.length > 0) {
          hasVoiceCommands = true;
        }
      });
    });

    if (!hasVoiceCommands) {
      warnings.push({
        type: 'accessibility',
        message: 'No voice commands defined for player choices',
        suggestion: 'Add voice command alternatives for all interactive choices',
      });
    }

    // Check difficulty progression
    if (caseData.difficulty > 3 && chapters.length > 0) {
      const hasHints = chapters.every(chapter =>
        chapter.objectives.every(obj => obj.hints && obj.hints.length > 0)
      );

      if (!hasHints) {
        suggestions.push(
          'High-difficulty cases should provide helpful hints for accessibility'
        );
      }
    }
  }

  // Validate audio assets
  private validateAudioAssets(
    chapters: CaseChapter[],
    errors: ValidationError[],
    warnings: ValidationWarning[]
  ): void {
    const referencedAssets = new Set<string>();
    const availableAssets = new Set(this.audioAssets.keys());

    // Collect all referenced audio assets
    chapters.forEach(chapter => {
      chapter.dialogue.forEach(dialogue => {
        if (dialogue.audioFile) {
          referencedAssets.add(dialogue.audioFile);
        }
      });

      chapter.locations.forEach(location => {
        if (location.ambientSound) {
          referencedAssets.add(location.ambientSound);
        }
        location.spatialElements.forEach(element => {
          referencedAssets.add(element.audioFile);
        });
      });

      chapter.triggers.forEach(trigger => {
        trigger.audioAssets.forEach(asset => {
          referencedAssets.add(asset);
        });
      });
    });

    // Check for missing assets
    referencedAssets.forEach(assetId => {
      if (!availableAssets.has(assetId)) {
        errors.push({
          type: 'invalid_reference',
          message: `Referenced audio asset not found: ${assetId}`,
          location: 'audio assets',
          severity: 'high',
        });
      }
    });
  }

  // Generate voice acting script
  generateVoiceActingScript(caseData: DetectiveCase, chapters: CaseChapter[]): string {
    let script = `# Voice Acting Script\n## Case: ${caseData.title}\n\n`;
    
    // Add character descriptions
    script += '## Characters\n\n';
    caseData.characters.forEach(character => {
      const voiceNote = this.getVoiceNote(character.id);
      if (voiceNote) {
        script += `### ${character.name} (${character.role})\n`;
        script += `**Voice Description:** ${voiceNote.voiceDescription}\n`;
        script += `**Personality:** ${voiceNote.personality}\n`;
        script += `**Speaking Style:** ${voiceNote.speakingStyle}\n`;
        if (voiceNote.accent) {
          script += `**Accent:** ${voiceNote.accent}\n`;
        }
        script += `**Emotional Range:** ${voiceNote.emotionalRange.join(', ')}\n\n`;
      }
    });

    // Add dialogue by chapter
    chapters.forEach((chapter, chapterIndex) => {
      script += `## Chapter ${chapterIndex + 1}: ${chapter.title}\n\n`;
      
      chapter.dialogue.forEach((dialogue, dialogueIndex) => {
        const character = caseData.characters.find(c => c.id === dialogue.characterId);
        script += `### Dialogue ${dialogueIndex + 1}\n`;
        script += `**Character:** ${character?.name || 'Unknown'}\n`;
        script += `**Emotion:** ${dialogue.emotion}\n`;
        script += `**Text:** "${dialogue.text}"\n`;
        script += `**Audio File:** ${dialogue.audioFile || 'TBD'}\n\n`;
      });
    });

    return script;
  }

  // Generate accessibility guide
  generateAccessibilityGuide(caseData: DetectiveCase, chapters: CaseChapter[]): string {
    let guide = `# Accessibility Implementation Guide\n## Case: ${caseData.title}\n\n`;
    
    guide += '## Audio Descriptions\n\n';
    chapters.forEach((chapter, chapterIndex) => {
      guide += `### Chapter ${chapterIndex + 1}: ${chapter.title}\n`;
      chapter.locations.forEach(location => {
        guide += `- **${location.name}:** ${location.audioDescription}\n`;
      });
      guide += '\n';
    });

    guide += '## Voice Commands\n\n';
    chapters.forEach((chapter, chapterIndex) => {
      guide += `### Chapter ${chapterIndex + 1}: ${chapter.title}\n`;
      chapter.choices.forEach(choice => {
        guide += `- **Choice:** ${choice.description}\n`;
        guide += `  - Commands: ${choice.voiceCommands.join(', ')}\n`;
      });
      guide += '\n';
    });

    guide += '## Spatial Audio Cues\n\n';
    chapters.forEach((chapter, chapterIndex) => {
      guide += `### Chapter ${chapterIndex + 1}: ${chapter.title}\n`;
      chapter.locations.forEach(location => {
        location.spatialElements.forEach(element => {
          guide += `- **${element.name}:** Position (${element.position.x}, ${element.position.y}, ${element.position.z})\n`;
        });
      });
      guide += '\n';
    });

    return guide;
  }

  // Export case for production
  exportCase(caseData: DetectiveCase, chapters: CaseChapter[]): any {
    const exportData = {
      metadata: {
        title: caseData.title,
        description: caseData.description,
        difficulty: caseData.difficulty,
        estimatedDuration: caseData.estimatedDuration,
        totalChapters: chapters.length,
        exportedAt: new Date(),
        version: '1.0.0',
      },
      case: caseData,
      chapters: chapters,
      assets: Array.from(this.audioAssets.values()),
      voiceActingNotes: caseData.characters.map(char => this.getVoiceNote(char.id)).filter(Boolean),
      accessibility: {
        voiceCommands: this.extractVoiceCommands(chapters),
        audioDescriptions: this.extractAudioDescriptions(chapters),
        spatialElements: this.extractSpatialElements(chapters),
      }
    };

    const exportPath = `case-${caseData.id}-export.json`;
    this.onExportComplete?.(exportPath);
    
    return exportData;
  }

  // Helper methods
  private getVoiceNote(characterId: string): VoiceActingNote | undefined {
    // Implementation would retrieve voice acting notes
    return undefined;
  }

  private extractVoiceCommands(chapters: CaseChapter[]): string[] {
    const commands: string[] = [];
    chapters.forEach(chapter => {
      chapter.choices.forEach(choice => {
        commands.push(...choice.voiceCommands);
      });
    });
    return [...new Set(commands)];
  }

  private extractAudioDescriptions(chapters: CaseChapter[]): string[] {
    const descriptions: string[] = [];
    chapters.forEach(chapter => {
      chapter.locations.forEach(location => {
        if (location.audioDescription) {
          descriptions.push(location.audioDescription);
        }
      });
    });
    return descriptions;
  }

  private extractSpatialElements(chapters: CaseChapter[]): SpatialElement[] {
    const elements: SpatialElement[] = [];
    chapters.forEach(chapter => {
      chapter.locations.forEach(location => {
        elements.push(...location.spatialElements);
      });
    });
    return elements;
  }

  // Asset management
  addAudioAsset(asset: ContentAsset): void {
    this.audioAssets.set(asset.id, asset);
    this.onAssetProcessed?.(asset);
  }

  getAudioAssets(): ContentAsset[] {
    return Array.from(this.audioAssets.values());
  }

  // Template management
  addTemplate(template: CaseTemplate): void {
    this.caseTemplates.set(template.id, template);
  }

  getTemplates(): CaseTemplate[] {
    return Array.from(this.caseTemplates.values());
  }
}

export default ContentCreationSuite;
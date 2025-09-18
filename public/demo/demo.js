/**
 * AudioVR Web Demo - JavaScript Functionality
 * Comprehensive accessibility-first demo with voice recognition and spatial audio
 */

class AudioVRDemo {
    constructor() {
        this.isListening = false;
        this.recognition = null;
        this.audioContext = null;
        this.spatialNodes = {};
        this.demoProgress = 0;
        this.maxProgress = 5;
        this.commandHistory = [];
        this.evidenceCollected = [];
        this.audioDescriptionsEnabled = true;
        this.highContrastEnabled = false;
        this.reducedMotionEnabled = false;
        
        this.initializeDemo();
    }

    async initializeDemo() {
        try {
            // Initialize Web Speech API
            await this.initializeSpeechRecognition();
            
            // Initialize Web Audio API for spatial audio
            await this.initializeAudioContext();
            
            // Setup event listeners
            this.setupEventListeners();
            
            // Check accessibility features
            this.detectAccessibilityFeatures();
            
            // Start ambient audio
            this.startAmbientAudio();
            
            // Show tutorial tooltips
            this.showTutorialTooltips();
            
            console.log('AudioVR Demo initialized successfully');
            this.announce('AudioVR demo loaded successfully. Press the microphone button or say "help" to get started.');
            
        } catch (error) {
            console.error('Demo initialization error:', error);
            this.updateVoiceStatus('error', 'Voice recognition not available in this browser');
        }
    }

    async initializeSpeechRecognition() {
        if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
            throw new Error('Speech recognition not supported');
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        this.recognition = new SpeechRecognition();
        
        // Configure speech recognition
        this.recognition.continuous = false;
        this.recognition.interimResults = true;
        this.recognition.lang = 'en-US';
        this.recognition.maxAlternatives = 3;

        // Speech recognition event handlers
        this.recognition.onstart = () => {
            this.updateVoiceStatus('listening', 'Listening for command...');
            this.addCommandToHistory('🎤 Listening...', 'processing');
        };

        this.recognition.onresult = (event) => {
            const result = event.results[event.results.length - 1];
            if (result.isFinal) {
                const command = result[0].transcript.trim().toLowerCase();
                this.processVoiceCommand(command, result[0].confidence);
            }
        };

        this.recognition.onerror = (event) => {
            console.error('Speech recognition error:', event.error);
            this.updateVoiceStatus('error', `Error: ${event.error}`);
            this.stopListening();
        };

        this.recognition.onend = () => {
            this.stopListening();
        };

        this.updateVoiceStatus('success', 'Voice recognition ready');
    }

    async initializeAudioContext() {
        try {
            this.audioContext = new (window.AudioContext || window.webkitAudioContext)();
            
            // Create spatial audio nodes
            this.spatialNodes = {
                listener: this.audioContext.listener,
                sources: new Map()
            };
            
            // Set listener position (user's perspective)
            if (this.audioContext.listener.positionX) {
                this.audioContext.listener.positionX.value = 0;
                this.audioContext.listener.positionY.value = 0;
                this.audioContext.listener.positionZ.value = 0;
            }
            
            this.updateAudioStatus('success', 'Spatial audio enabled');
        } catch (error) {
            console.error('Audio context initialization error:', error);
            this.updateAudioStatus('error', 'Audio context not available');
        }
    }

    setupEventListeners() {
        // Keyboard navigation support
        document.addEventListener('keydown', (event) => {
            this.handleKeyboardNavigation(event);
        });

        // Focus management for accessibility
        document.addEventListener('focusin', (event) => {
            if (event.target.classList.contains('spatial-element')) {
                this.highlightElement(event.target);
                this.announceElement(event.target);
            }
        });

        // Mouse hover for tooltips
        document.querySelectorAll('.spatial-element').forEach(element => {
            element.addEventListener('mouseenter', (event) => {
                this.showTooltip(event.target);
            });
            
            element.addEventListener('mouseleave', (event) => {
                this.hideTooltip(event.target);
            });
        });

        // Voice activation hotkey (Ctrl+Space)
        document.addEventListener('keydown', (event) => {
            if (event.ctrlKey && event.code === 'Space') {
                event.preventDefault();
                this.toggleVoiceListening();
            }
        });
    }

    detectAccessibilityFeatures() {
        // Screen reader detection
        const screenReaderDetected = this.detectScreenReader();
        if (screenReaderDetected) {
            this.updateScreenReaderStatus('success', 'Screen reader detected');
            document.body.setAttribute('data-screen-reader', 'true');
        } else {
            this.updateScreenReaderStatus('success', 'Compatible');
        }

        // High contrast preference
        if (window.matchMedia('(prefers-contrast: high)').matches) {
            this.enableHighContrast();
        }

        // Reduced motion preference  
        if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
            this.enableReducedMotion();
        }

        // Color scheme preference
        if (window.matchMedia('(prefers-color-scheme: dark)').matches) {
            document.body.setAttribute('data-theme', 'dark');
        }
    }

    detectScreenReader() {
        // Multiple detection methods for screen readers
        const indicators = [
            navigator.userAgent.includes('JAWS'),
            navigator.userAgent.includes('NVDA'),
            navigator.userAgent.includes('SAREG'),
            window.speechSynthesis && window.speechSynthesis.speaking,
            document.body.getAttribute('data-whatinput') === 'keyboard'
        ];
        
        return indicators.some(indicator => indicator);
    }

    processVoiceCommand(command, confidence) {
        console.log('Voice command:', command, 'Confidence:', confidence);
        
        // Add to command history
        this.addCommandToHistory(`"${command}"`, confidence > 0.8 ? 'success' : 'error');
        
        if (confidence < 0.6) {
            this.announce('Sorry, I didn\'t understand that clearly. Please try again.');
            return;
        }

        // Process command based on content
        const processed = this.parseCommand(command);
        if (processed) {
            this.executeCommand(processed);
            this.updateDemoProgress();
        } else {
            this.announce('I didn\'t recognize that command. Try "help" for available commands.');
        }
    }

    parseCommand(command) {
        const patterns = [
            // Examination commands
            { pattern: /examine|look at|inspect (the )?(knife|blade|weapon)/i, action: 'examine', target: 'knife' },
            { pattern: /examine|look at|inspect (the )?(footprints|tracks|prints)/i, action: 'examine', target: 'footprints' },
            { pattern: /examine|look at|inspect (the )?(letter|note|paper)/i, action: 'examine', target: 'letter' },
            { pattern: /talk to|speak with|interview (the )?(witness|mary|woman)/i, action: 'examine', target: 'witness' },
            
            // Navigation commands
            { pattern: /help|commands|what can i (do|say)/i, action: 'help' },
            { pattern: /inventory|evidence|show items/i, action: 'inventory' },
            { pattern: /repeat|say again|describe (scene|room|area)/i, action: 'describe' },
            { pattern: /look around|describe surroundings/i, action: 'describe' },
            
            // Audio controls
            { pattern: /volume (up|down|louder|quieter)/i, action: 'volume', target: command.includes('up') || command.includes('louder') ? 'up' : 'down' },
            { pattern: /spatial audio (on|off|enable|disable)/i, action: 'spatial', target: command.includes('on') || command.includes('enable') ? 'on' : 'off' },
            { pattern: /audio descriptions? (on|off|enable|disable)/i, action: 'descriptions', target: command.includes('on') || command.includes('enable') ? 'on' : 'off' }
        ];

        for (const { pattern, action, target } of patterns) {
            if (pattern.test(command)) {
                return { action, target, original: command };
            }
        }

        return null;
    }

    executeCommand(commandObj) {
        const { action, target, original } = commandObj;

        switch (action) {
            case 'examine':
                this.examineElement(target);
                break;
            case 'help':
                this.showHelp();
                break;
            case 'inventory':
                this.toggleInventory();
                break;
            case 'describe':
                this.repeatDescription();
                break;
            case 'volume':
                this.adjustVolume(target);
                break;
            case 'spatial':
                this.toggleSpatialAudio(target === 'on');
                break;
            case 'descriptions':
                this.toggleAudioDescriptions(target === 'on');
                break;
            default:
                this.announce('Command not implemented yet.');
        }

        // Update voice hint
        this.updateVoiceHint();
    }

    examineElement(elementType) {
        const elements = {
            knife: {
                title: 'Bloody Kitchen Knife',
                description: 'A sharp kitchen knife with fresh blood on the blade. The handle shows wear from use, and you notice carved initials "J.P." near the guard. The blood appears to be recent, still slightly wet to the touch.',
                audioDescription: 'The metallic scent of blood fills the air as you examine the weapon. You hear a slight dripping sound as blood drops to the cobblestones.',
                spatialAudio: { x: -5, y: 0, z: 2 }
            },
            footprints: {
                title: 'Muddy Boot Prints',
                description: 'Large boot impressions in the wet mud, leading from the crime scene toward the main street. The depth suggests someone heavy, possibly carrying a burden. The mud has a distinct reddish tint from the nearby docks.',
                audioDescription: 'Your footsteps squelch in the mud as you follow the trail. The prints are deep and widely spaced, indicating hurried movement.',
                spatialAudio: { x: 5, y: 0, z: -3 }
            },
            letter: {
                title: 'Torn Letter Fragment',
                description: 'A partially torn letter with elegant handwriting in dark ink. The visible text reads: "...must meet at the usual place...midnight strikes...bring what we discussed..." The signature is torn away, leaving only illegible flourishes.',
                audioDescription: 'The paper crinkles as you handle it. You notice the faint scent of expensive cologne still clinging to the parchment.',
                spatialAudio: { x: 0, y: 1, z: 0 }
            },
            witness: {
                title: 'Mary Kelly - Witness',
                description: 'A nervous young woman with auburn hair and a slight Irish accent. She clutches a shawl tightly around her shoulders and keeps glancing toward the tavern. Her eyes dart nervously as she speaks.',
                audioDescription: 'Mary speaks in hushed, trembling tones. You hear the rustle of her skirts as she shifts nervously, and the distant sound of tavern music behind her.',
                spatialAudio: { x: 8, y: 0, z: 1 },
                dialogue: "Oh sir, it was terrible! I saw a tall figure in a dark coat running from the alley just as the fog rolled in. Couldn't make out the face, but they were carrying something wrapped in cloth..."
            }
        };

        const element = elements[elementType];
        if (!element) return;

        // Play spatial audio effect
        this.playSpatialAudio('examine', element.spatialAudio);

        // Show modal with element details
        this.showElementModal(element);

        // Announce for screen readers
        let announcement = `Examining ${element.title}. ${element.description}`;
        if (this.audioDescriptionsEnabled) {
            announcement += ` ${element.audioDescription}`;
        }
        if (element.dialogue) {
            announcement += ` Mary says: "${element.dialogue}"`;
        }

        this.announce(announcement);
        
        // Add to evidence if not already collected
        if (!this.evidenceCollected.includes(elementType)) {
            this.evidenceCollected.push(elementType);
            this.announce(`${element.title} added to your evidence collection.`);
        }
    }

    showElementModal(element) {
        const modal = document.getElementById('evidence-modal');
        const title = document.getElementById('evidence-title');
        const description = document.getElementById('evidence-description');

        title.textContent = element.title;
        
        let fullDescription = element.description;
        if (this.audioDescriptionsEnabled && element.audioDescription) {
            fullDescription += `\n\nAudio Description: ${element.audioDescription}`;
        }
        if (element.dialogue) {
            fullDescription += `\n\n"${element.dialogue}"`;
        }
        
        description.textContent = fullDescription;
        modal.style.display = 'flex';
        
        // Focus management for accessibility
        setTimeout(() => {
            title.focus();
        }, 100);
    }

    playSpatialAudio(soundType, position) {
        if (!this.audioContext || !position) return;

        try {
            // Create oscillator for demo sound effect
            const oscillator = this.audioContext.createOscillator();
            const gainNode = this.audioContext.createGain();
            const pannerNode = this.audioContext.createPanner();

            // Configure spatial positioning
            pannerNode.panningModel = 'HRTF';
            pannerNode.distanceModel = 'inverse';
            pannerNode.refDistance = 1;
            pannerNode.maxDistance = 10000;
            pannerNode.rolloffFactor = 1;
            pannerNode.coneInnerAngle = 360;
            pannerNode.coneOuterAngle = 0;
            pannerNode.coneOuterGain = 0;

            if (pannerNode.positionX) {
                pannerNode.positionX.value = position.x;
                pannerNode.positionY.value = position.y;
                pannerNode.positionZ.value = position.z;
            } else {
                pannerNode.setPosition(position.x, position.y, position.z);
            }

            // Create appropriate sound for interaction type
            const frequency = soundType === 'examine' ? 400 + Math.random() * 200 : 300;
            oscillator.frequency.setValueAtTime(frequency, this.audioContext.currentTime);
            oscillator.type = 'sine';

            // Configure volume envelope
            gainNode.gain.setValueAtTime(0, this.audioContext.currentTime);
            gainNode.gain.linearRampToValueAtTime(0.1, this.audioContext.currentTime + 0.1);
            gainNode.gain.exponentialRampToValueAtTime(0.01, this.audioContext.currentTime + 0.5);

            // Connect audio nodes
            oscillator.connect(gainNode);
            gainNode.connect(pannerNode);
            pannerNode.connect(this.audioContext.destination);

            // Play sound
            oscillator.start(this.audioContext.currentTime);
            oscillator.stop(this.audioContext.currentTime + 0.5);

        } catch (error) {
            console.error('Spatial audio error:', error);
        }
    }

    startAmbientAudio() {
        // Simulate ambient audio with visual indicator
        // In a real implementation, this would play actual ambient sounds
        this.announce('Ambient audio initialized: Rain pattering, wind whistling, distant footsteps echoing from the main street.');
    }

    toggleVoiceListening() {
        if (!this.recognition) {
            this.announce('Voice recognition is not available in this browser.');
            return;
        }

        if (this.isListening) {
            this.stopListening();
        } else {
            this.startListening();
        }
    }

    startListening() {
        if (!this.recognition) return;

        try {
            // Resume audio context if suspended (required by some browsers)
            if (this.audioContext && this.audioContext.state === 'suspended') {
                this.audioContext.resume();
            }

            this.recognition.start();
            this.isListening = true;
            
            // Update UI
            const voiceBtn = document.getElementById('voice-btn');
            voiceBtn.classList.add('listening');
            voiceBtn.querySelector('i').className = 'fas fa-stop text-white text-2xl';
            
            document.getElementById('voice-status-display').textContent = 'Listening...';
            document.getElementById('voice-hint').textContent = 'Speak clearly into your microphone';

        } catch (error) {
            console.error('Failed to start listening:', error);
            this.updateVoiceStatus('error', 'Failed to start voice recognition');
        }
    }

    stopListening() {
        if (this.recognition && this.isListening) {
            this.recognition.stop();
        }
        
        this.isListening = false;
        
        // Update UI
        const voiceBtn = document.getElementById('voice-btn');
        voiceBtn.classList.remove('listening');
        voiceBtn.querySelector('i').className = 'fas fa-microphone text-white text-2xl';
        
        document.getElementById('voice-status-display').textContent = 'Ready for voice command';
        this.updateVoiceHint();
    }

    updateVoiceHint() {
        const hints = [
            'Try: "Examine the knife" or "Talk to Mary"',
            'Say: "Look around" or "Show inventory"',
            'Commands: "Help" or "Repeat description"',
            'Audio: "Volume up" or "Spatial audio on"'
        ];
        
        const randomHint = hints[Math.floor(Math.random() * hints.length)];
        document.getElementById('voice-hint').textContent = randomHint;
    }

    addCommandToHistory(command, status) {
        const history = document.getElementById('command-history');
        const timestamp = new Date().toLocaleTimeString();
        
        // Add to history array
        this.commandHistory.unshift({ command, status, timestamp });
        
        // Keep only last 5 commands
        if (this.commandHistory.length > 5) {
            this.commandHistory = this.commandHistory.slice(0, 5);
        }
        
        // Update UI
        history.innerHTML = this.commandHistory.map(item => `
            <div class="command-item">
                <span class="status-indicator status-${item.status}"></span>
                <span class="text-gray-300">${item.command}</span>
                <span class="text-xs text-gray-500 float-right">${item.timestamp}</span>
            </div>
        `).join('');
    }

    updateDemoProgress() {
        if (this.demoProgress < this.maxProgress) {
            this.demoProgress++;
            const percentage = (this.demoProgress / this.maxProgress) * 100;
            
            document.getElementById('demo-progress-fill').style.width = `${percentage}%`;
            document.getElementById('demo-progress-text').textContent = `${this.demoProgress} / ${this.maxProgress}`;
            
            if (this.demoProgress === this.maxProgress) {
                this.announce('Congratulations! You have completed the AudioVR demo. All interactive elements have been explored.');
            }
        }
    }

    // Accessibility Functions
    announce(message) {
        // Use speech synthesis for announcements
        if ('speechSynthesis' in window) {
            const utterance = new SpeechSynthesisUtterance(message);
            utterance.rate = 0.9;
            utterance.pitch = 1;
            utterance.volume = 0.8;
            speechSynthesis.speak(utterance);
        }

        // Also create live region for screen readers
        this.updateLiveRegion(message);
    }

    updateLiveRegion(message) {
        let liveRegion = document.getElementById('live-region');
        if (!liveRegion) {
            liveRegion = document.createElement('div');
            liveRegion.id = 'live-region';
            liveRegion.className = 'sr-only';
            liveRegion.setAttribute('aria-live', 'polite');
            liveRegion.setAttribute('aria-atomic', 'true');
            document.body.appendChild(liveRegion);
        }
        liveRegion.textContent = message;
    }

    handleKeyboardNavigation(event) {
        // Custom keyboard navigation for spatial elements
        const spatialElements = Array.from(document.querySelectorAll('.spatial-element'));
        const currentIndex = spatialElements.indexOf(document.activeElement);

        switch (event.key) {
            case 'Enter':
            case ' ':
                if (spatialElements.includes(document.activeElement)) {
                    event.preventDefault();
                    document.activeElement.click();
                }
                break;
                
            case 'ArrowRight':
            case 'ArrowDown':
                if (spatialElements.includes(document.activeElement)) {
                    event.preventDefault();
                    const nextIndex = (currentIndex + 1) % spatialElements.length;
                    spatialElements[nextIndex].focus();
                }
                break;
                
            case 'ArrowLeft':
            case 'ArrowUp':
                if (spatialElements.includes(document.activeElement)) {
                    event.preventDefault();
                    const prevIndex = currentIndex === 0 ? spatialElements.length - 1 : currentIndex - 1;
                    spatialElements[prevIndex].focus();
                }
                break;
                
            case 'Escape':
                // Close modals
                this.closeAllModals();
                break;
                
            case 'h':
                if (event.ctrlKey) {
                    event.preventDefault();
                    this.showHelp();
                }
                break;
        }
    }

    handleKeyPress(event, elementType) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.examineElement(elementType);
        }
    }

    // UI Helper Functions
    updateVoiceStatus(status, message) {
        const indicator = document.getElementById('voice-status');
        const text = document.getElementById('voice-status-text');
        
        indicator.className = `status-indicator status-${status}`;
        text.textContent = message;
    }

    updateScreenReaderStatus(status, message) {
        const indicator = document.getElementById('sr-status');
        const text = document.getElementById('sr-status-text');
        
        indicator.className = `status-indicator status-${status}`;
        text.textContent = message;
    }

    updateAudioStatus(status, message) {
        const indicator = document.getElementById('audio-status');
        const text = document.getElementById('audio-status-text');
        
        indicator.className = `status-indicator status-${status}`;
        text.textContent = message;
    }

    showTutorialTooltips() {
        const tooltips = document.querySelectorAll('.tutorial-tooltip');
        tooltips.forEach(tooltip => {
            setTimeout(() => {
                tooltip.style.display = 'block';
                setTimeout(() => {
                    tooltip.style.display = 'none';
                }, 3000);
            }, 1000);
        });
    }

    showTooltip(element) {
        const tooltip = element.querySelector('.tutorial-tooltip');
        if (tooltip) {
            tooltip.style.display = 'block';
        }
    }

    hideTooltip(element) {
        const tooltip = element.querySelector('.tutorial-tooltip');
        if (tooltip) {
            tooltip.style.display = 'none';
        }
    }

    highlightElement(element) {
        // Add visual highlight
        element.style.boxShadow = '0 0 0 3px rgba(139, 92, 246, 0.5)';
        
        // Remove highlight after delay
        setTimeout(() => {
            element.style.boxShadow = '';
        }, 2000);
    }

    announceElement(element) {
        const label = element.getAttribute('aria-label');
        if (label) {
            this.announce(`Focused on ${label}`);
        }
    }

    // Accessibility Settings
    toggleHighContrast() {
        this.highContrastEnabled = !this.highContrastEnabled;
        document.body.classList.toggle('high-contrast', this.highContrastEnabled);
        this.announce(`High contrast mode ${this.highContrastEnabled ? 'enabled' : 'disabled'}`);
    }

    toggleReducedMotion() {
        this.reducedMotionEnabled = !this.reducedMotionEnabled;
        document.body.classList.toggle('reduced-motion', this.reducedMotionEnabled);
        this.announce(`Reduced motion ${this.reducedMotionEnabled ? 'enabled' : 'disabled'}`);
    }

    toggleAudioDescriptions(enable) {
        if (enable !== undefined) {
            this.audioDescriptionsEnabled = enable;
        } else {
            this.audioDescriptionsEnabled = !this.audioDescriptionsEnabled;
        }
        this.announce(`Audio descriptions ${this.audioDescriptionsEnabled ? 'enabled' : 'disabled'}`);
    }

    // Modal Management
    closeAllModals() {
        document.getElementById('evidence-modal').style.display = 'none';
        document.getElementById('help-modal').style.display = 'none';
    }

    closeEvidenceModal() {
        document.getElementById('evidence-modal').style.display = 'none';
    }

    closeHelpModal() {
        document.getElementById('help-modal').style.display = 'none';
    }

    showHelp() {
        document.getElementById('help-modal').style.display = 'flex';
        this.announce('Help dialog opened. Review available voice commands and accessibility features.');
    }

    toggleInventory() {
        if (this.evidenceCollected.length === 0) {
            this.announce('Your evidence inventory is empty. Examine items in the scene to collect evidence.');
        } else {
            const evidenceList = this.evidenceCollected.join(', ');
            this.announce(`Evidence collected: ${evidenceList}. Total items: ${this.evidenceCollected.length}.`);
        }
    }

    addToEvidence() {
        this.announce('Evidence added to inventory successfully.');
        this.closeEvidenceModal();
    }

    repeatDescription() {
        const description = document.getElementById('scene-description').textContent;
        this.announce(`Scene description: ${description}`);
    }

    adjustVolume(direction) {
        // Simulate volume adjustment
        this.announce(`Audio volume adjusted ${direction === 'up' ? 'higher' : 'lower'}.`);
    }

    toggleSpatialAudio(enable) {
        // Simulate spatial audio toggle
        this.announce(`Spatial audio ${enable ? 'enabled' : 'disabled'}.`);
    }

    // External Actions
    redirectToAppStore() {
        this.announce('Redirecting to app store for AudioVR mobile download.');
        // In real implementation: window.open('app-store-link', '_blank');
        setTimeout(() => {
            alert('This would redirect to the app store in the full implementation.');
        }, 500);
    }

    learnMore() {
        this.announce('Opening AudioVR information page.');
        // In real implementation: window.open('/about', '_blank');
        setTimeout(() => {
            alert('This would open detailed information about AudioVR.');
        }, 500);
    }
}

// Global functions for HTML onclick handlers
let demoInstance;

function toggleVoiceListening() {
    demoInstance?.toggleVoiceListening();
}

function examineElement(elementType) {
    demoInstance?.examineElement(elementType);
}

function showHelp() {
    demoInstance?.showHelp();
}

function closeEvidenceModal() {
    demoInstance?.closeEvidenceModal();
}

function closeHelpModal() {
    demoInstance?.closeHelpModal();
}

function toggleInventory() {
    demoInstance?.toggleInventory();
}

function addToEvidence() {
    demoInstance?.addToEvidence();
}

function repeatDescription() {
    demoInstance?.repeatDescription();
}

function toggleHighContrast() {
    demoInstance?.toggleHighContrast();
}

function toggleReducedMotion() {
    demoInstance?.toggleReducedMotion();
}

function toggleAudioDescriptions() {
    demoInstance?.toggleAudioDescriptions();
}

function redirectToAppStore() {
    demoInstance?.redirectToAppStore();
}

function learnMore() {
    demoInstance?.learnMore();
}

function handleKeyPress(event, elementType) {
    demoInstance?.handleKeyPress(event, elementType);
}

// Initialize demo when DOM is loaded
document.addEventListener('DOMContentLoaded', () => {
    demoInstance = new AudioVRDemo();
});

// Export for potential module usage
if (typeof module !== 'undefined' && module.exports) {
    module.exports = AudioVRDemo;
}
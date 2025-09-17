// AudioVR Frontend Application
class AudioVR {
    constructor() {
        this.userId = this.getUserId();
        this.currentWorld = null;
        this.currentCase = null;
        this.profile = null;
        this.init();
    }

    getUserId() {
        let userId = localStorage.getItem('audiovr_user_id');
        if (!userId) {
            userId = 'user_' + Math.random().toString(36).substr(2, 9);
            localStorage.setItem('audiovr_user_id', userId);
        }
        return userId;
    }

    async init() {
        // Load user profile
        await this.loadProfile();
        
        // Try to restore session
        const session = await this.restoreSession();
        
        if (session && session.world) {
            // Resume previous session
            this.currentWorld = session.world;
            this.currentCase = session.caseId;
            this.showDesk(session.world);
        } else {
            // Show world selection
            this.showWorldSelection();
        }
        
        // Initialize top HUD
        this.renderHUD();
    }

    async loadProfile() {
        try {
            const response = await axios.get(`/api/profile/${this.userId}`);
            this.profile = response.data;
        } catch (error) {
            console.error('Failed to load profile:', error);
        }
    }

    async restoreSession() {
        try {
            const response = await axios.get(`/api/session/restore/${this.userId}`);
            return response.data;
        } catch (error) {
            console.error('Failed to restore session:', error);
            return null;
        }
    }

    renderHUD() {
        const hudHTML = `
            <div id="hud" class="fixed top-0 left-0 right-0 z-50 glass-card p-4">
                <div class="flex justify-between items-center max-w-7xl mx-auto">
                    <div class="flex items-center gap-4">
                        <h1 class="text-xl font-bold">AudioVR</h1>
                        <span id="current-case" class="text-gray-300"></span>
                    </div>
                    <div class="flex items-center gap-6">
                        <div class="flex items-center gap-2">
                            <i class="fas fa-coins text-yellow-400"></i>
                            <span id="balance">${this.profile?.balance || 100}</span>
                        </div>
                        <div class="flex items-center gap-2">
                            <i class="fas fa-trophy text-purple-400"></i>
                            <span id="rank">${this.profile?.rank || 'Rookie'}</span>
                        </div>
                        <button onclick="audioVR.signOut()" class="px-4 py-2 bg-red-600 hover:bg-red-700 rounded-lg transition">
                            <i class="fas fa-sign-out-alt mr-2"></i>Sign Out
                        </button>
                    </div>
                </div>
            </div>
        `;
        
        if (!document.getElementById('hud')) {
            document.body.insertAdjacentHTML('afterbegin', hudHTML);
        }
    }

    showWorldSelection() {
        const app = document.getElementById('app');
        app.innerHTML = `
            <div class="pt-20 px-4 fade-in">
                <div class="max-w-7xl mx-auto">
                    <h2 class="text-4xl font-bold text-center mb-4">Choose Your World</h2>
                    <p class="text-gray-400 text-center mb-12">Select a genre to begin your voice-driven adventure</p>
                    
                    <div id="world-grid" class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                        <!-- World cards will be inserted here -->
                    </div>
                </div>
            </div>
        `;
        
        this.renderWorldCards();
    }

    async renderWorldCards() {
        try {
            const response = await axios.get('/api/worlds');
            const worlds = response.data;
            const worldGrid = document.getElementById('world-grid');
            
            Object.entries(worlds).forEach(([key, world]) => {
                const card = document.createElement('div');
                card.className = 'world-card glass-card rounded-xl p-6 text-center';
                card.style.borderColor = world.color;
                card.innerHTML = `
                    <div class="text-5xl mb-4">${world.icon}</div>
                    <h3 class="text-2xl font-bold mb-2" style="color: ${world.color}">${world.name}</h3>
                    <p class="text-gray-400 text-sm">${world.description}</p>
                    <div class="mt-4 pt-4 border-t border-gray-700">
                        <span class="text-xs text-gray-500">Click or say "${world.name}"</span>
                    </div>
                `;
                
                card.addEventListener('click', () => this.selectWorld(key));
                worldGrid.appendChild(card);
            });
        } catch (error) {
            console.error('Failed to load worlds:', error);
        }
    }

    async selectWorld(worldKey) {
        this.currentWorld = worldKey;
        
        // Smooth transition
        const app = document.getElementById('app');
        app.classList.add('opacity-0');
        
        setTimeout(() => {
            this.showDesk(worldKey);
            app.classList.remove('opacity-0');
        }, 300);
    }

    async showDesk(worldKey) {
        const app = document.getElementById('app');
        
        // Get world data
        const response = await axios.get('/api/worlds');
        const world = response.data[worldKey];
        
        app.innerHTML = `
            <div class="pt-20 fade-in">
                <!-- Desk Scene -->
                <div class="relative h-screen">
                    <!-- Background Image (themed per world) -->
                    <div class="absolute inset-0 bg-gradient-to-br from-gray-900 via-gray-800 to-black">
                        <div class="absolute inset-0 opacity-20" style="background: linear-gradient(135deg, ${world.color}22, transparent)"></div>
                    </div>
                    
                    <!-- Desk Surface -->
                    <div class="absolute bottom-0 left-0 right-0 h-1/2 bg-gradient-to-t from-black to-transparent">
                        <div class="max-w-6xl mx-auto h-full flex items-end pb-20">
                            <!-- Message Objects Container -->
                            <div id="message-container" class="flex gap-8 justify-center w-full">
                                <!-- Case folders/objects will appear here -->
                            </div>
                        </div>
                    </div>
                    
                    <!-- Case Selection UI -->
                    <div class="absolute top-32 left-1/2 transform -translate-x-1/2">
                        <h2 class="text-3xl font-bold mb-4" style="color: ${world.color}">
                            ${world.icon} ${world.name} Cases
                        </h2>
                    </div>
                    
                    <!-- Inbox Button -->
                    <button onclick="audioVR.showInbox()" class="fixed bottom-8 right-8 glass-card px-6 py-3 rounded-full hover:scale-105 transition">
                        <i class="fas fa-inbox mr-2"></i>Evidence Locker
                    </button>
                </div>
            </div>
        `;
        
        // Load cases for this world
        this.loadCases(worldKey);
    }

    async loadCases(worldKey) {
        try {
            const response = await axios.get(`/api/cases/${worldKey}`, {
                headers: { 'X-User-Id': this.userId }
            });
            
            const cases = response.data.results || [];
            const container = document.getElementById('message-container');
            
            if (cases.length === 0) {
                // Show placeholder for demo
                container.innerHTML = `
                    <div class="glass-card p-8 rounded-xl text-center">
                        <i class="fas fa-folder-open text-6xl mb-4 opacity-50"></i>
                        <h3 class="text-xl font-bold mb-2">No Cases Available</h3>
                        <p class="text-gray-400">New cases coming soon!</p>
                    </div>
                `;
            } else {
                cases.forEach(caseData => {
                    this.renderCaseObject(caseData);
                });
            }
        } catch (error) {
            console.error('Failed to load cases:', error);
        }
    }

    renderCaseObject(caseData) {
        const container = document.getElementById('message-container');
        const caseElement = document.createElement('div');
        caseElement.className = 'case-object cursor-pointer hover:scale-110 transition-transform';
        
        // Different visual for each world's message type
        const messageIcons = {
            'manila-folder': 'fa-folder',
            'tattered-file': 'fa-file-alt',
            'data-cube': 'fa-cube',
            'scroll': 'fa-scroll',
            'magnetic-cartridge': 'fa-compact-disc',
            'wax-sealed-letter': 'fa-envelope',
            'treasure-map': 'fa-map'
        };
        
        caseElement.innerHTML = `
            <div class="glass-card p-6 rounded-lg text-center" style="border-color: ${this.getWorldColor()}">
                <i class="fas ${messageIcons[caseData.message_type] || 'fa-folder'} text-4xl mb-2"></i>
                <h4 class="font-bold">${caseData.title}</h4>
                <p class="text-xs text-gray-400 mt-1">Difficulty: ${caseData.difficulty}/5</p>
                ${caseData.is_completed ? '<i class="fas fa-check text-green-400 mt-2"></i>' : ''}
            </div>
        `;
        
        caseElement.addEventListener('click', () => this.startCase(caseData));
        container.appendChild(caseElement);
    }

    async startCase(caseData) {
        try {
            const response = await axios.post(`/api/cases/${caseData.case_id}/start`, {
                userId: this.userId
            });
            
            this.currentCase = caseData;
            this.showCaseScene(response.data);
        } catch (error) {
            console.error('Failed to start case:', error);
        }
    }

    showCaseScene(caseInfo) {
        const app = document.getElementById('app');
        
        app.innerHTML = `
            <div class="pt-20 fade-in">
                <div class="max-w-6xl mx-auto px-4">
                    <!-- Scene Container -->
                    <div class="glass-card rounded-xl p-6 mb-4">
                        <h2 class="text-2xl font-bold mb-4">${caseInfo.case.title}</h2>
                        <p class="text-gray-300 mb-6">${caseInfo.case.description}</p>
                        
                        <!-- ElevenLabs Widget Container -->
                        <div id="convai-container" class="mb-6">
                            <!-- The widget will be embedded here -->
                        </div>
                        
                        <!-- Transcript Drawer -->
                        <div class="glass-card rounded-lg p-4 max-h-64 overflow-y-auto">
                            <h3 class="font-bold mb-2">Conversation Transcript</h3>
                            <div id="transcript" class="text-sm text-gray-300 space-y-2">
                                <!-- Transcript lines will appear here -->
                            </div>
                        </div>
                        
                        <!-- Optional Text Input -->
                        <div class="mt-4">
                            <input 
                                type="text" 
                                id="text-input" 
                                placeholder="Type your response (optional)..." 
                                class="w-full p-3 rounded-lg bg-gray-800 border border-gray-700 focus:border-blue-500 focus:outline-none"
                                onkeypress="if(event.key === 'Enter') audioVR.sendTextInput()"
                            />
                        </div>
                    </div>
                    
                    <!-- Clues Section -->
                    <div class="glass-card rounded-xl p-6">
                        <h3 class="text-xl font-bold mb-4">Discovered Clues</h3>
                        <div id="clues-list" class="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <!-- Clues will appear here -->
                        </div>
                    </div>
                </div>
            </div>
        `;
        
        // Display initial clues
        if (caseInfo.clues) {
            caseInfo.clues.forEach(clue => this.addClueToList(clue));
        }
        
        // Update HUD
        document.getElementById('current-case').textContent = caseInfo.case.title;
    }

    addClueToList(clue) {
        const cluesList = document.getElementById('clues-list');
        const clueElement = document.createElement('div');
        clueElement.className = 'glass-card p-3 rounded-lg';
        clueElement.innerHTML = `
            <h4 class="font-bold text-sm">${clue.title}</h4>
            <p class="text-xs text-gray-400 mt-1">${clue.content}</p>
        `;
        cluesList.appendChild(clueElement);
    }

    async showInbox() {
        try {
            const response = await axios.get(`/api/inbox/${this.userId}`);
            const items = response.data.results || [];
            
            const app = document.getElementById('app');
            app.innerHTML = `
                <div class="pt-20 px-4 fade-in">
                    <div class="max-w-6xl mx-auto">
                        <h2 class="text-3xl font-bold mb-6">Evidence Locker</h2>
                        
                        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            ${items.map(item => `
                                <div class="glass-card p-4 rounded-lg">
                                    <h3 class="font-bold">${item.clue_title}</h3>
                                    <p class="text-sm text-gray-400 mt-1">From: ${item.case_title}</p>
                                    <p class="text-sm mt-2">${item.content}</p>
                                    ${!item.is_analyzed ? `
                                        <button onclick="audioVR.analyzeClue('${item.clue_id}')" 
                                            class="mt-3 px-3 py-1 bg-purple-600 hover:bg-purple-700 rounded text-sm">
                                            <i class="fas fa-search mr-1"></i>Analyze (${item.analysis_cost || 10} coins)
                                        </button>
                                    ` : `
                                        <p class="text-xs text-green-400 mt-3">
                                            <i class="fas fa-check-circle mr-1"></i>Analyzed
                                        </p>
                                    `}
                                </div>
                            `).join('')}
                        </div>
                        
                        <button onclick="audioVR.showDesk('${this.currentWorld}')" 
                            class="mt-6 px-6 py-3 glass-card rounded-lg hover:scale-105 transition">
                            <i class="fas fa-arrow-left mr-2"></i>Back to Desk
                        </button>
                    </div>
                </div>
            `;
        } catch (error) {
            console.error('Failed to load inbox:', error);
        }
    }

    async analyzeClue(clueId) {
        try {
            const response = await axios.post(`/api/clues/${clueId}/analyze`, {
                userId: this.userId
            });
            
            if (response.data.success) {
                // Update balance in HUD
                document.getElementById('balance').textContent = response.data.newBalance;
                
                // Refresh inbox
                this.showInbox();
                
                // Show analysis result
                alert('Analysis complete: ' + response.data.analysis);
            }
        } catch (error) {
            if (error.response && error.response.data.error) {
                alert(error.response.data.error);
            }
        }
    }

    sendTextInput() {
        const input = document.getElementById('text-input');
        const text = input.value.trim();
        
        if (text) {
            // Add to transcript
            this.addToTranscript('You', text);
            
            // Clear input
            input.value = '';
            
            // Process with ElevenLabs widget (if integrated)
            // This would normally trigger the conversational AI
        }
    }

    addToTranscript(speaker, text) {
        const transcript = document.getElementById('transcript');
        const line = document.createElement('div');
        line.className = 'flex gap-2';
        line.innerHTML = `
            <span class="font-bold">${speaker}:</span>
            <span>${text}</span>
        `;
        transcript.appendChild(line);
        transcript.scrollTop = transcript.scrollHeight;
        
        // Save dialogue
        this.saveDialogue(speaker, text);
    }

    async saveDialogue(speaker, text) {
        try {
            await axios.post('/api/dialogue/save', {
                userId: this.userId,
                caseId: this.currentCase?.case_id,
                dialogue: {
                    speaker,
                    text,
                    timestamp: new Date().toISOString()
                }
            });
        } catch (error) {
            console.error('Failed to save dialogue:', error);
        }
    }

    getWorldColor() {
        const colors = {
            detective: '#C19A6B',
            horror: '#B03030',
            scifi: '#00C0C0',
            fantasy: '#6A0DAD',
            space: '#4169E1',
            historical: '#B08D57',
            pirate: '#A52A2A'
        };
        return colors[this.currentWorld] || '#4169E1';
    }

    async signOut() {
        // Save current session
        if (this.currentWorld) {
            await axios.post('/api/session/save', {
                userId: this.userId,
                world: this.currentWorld,
                caseId: this.currentCase?.case_id,
                sceneState: {}
            });
        }
        
        // Clear local storage and reload
        localStorage.removeItem('audiovr_user_id');
        window.location.reload();
    }
}

// Initialize application when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.audioVR = new AudioVR();
});
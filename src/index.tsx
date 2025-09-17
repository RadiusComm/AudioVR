import { Hono } from 'hono'
import { cors } from 'hono/cors'
import { serveStatic } from 'hono/cloudflare-workers'

type Bindings = {
  DB: D1Database;
  SESSION_STORE: KVNamespace;
  MEDIA_STORAGE: R2Bucket;
  SUPABASE_URL?: string;
  SUPABASE_ANON_KEY?: string;
  ELEVENLABS_API_KEY?: string;
}

const app = new Hono<{ Bindings: Bindings }>()

// Enable CORS for API routes
app.use('/api/*', cors())

// Serve static files
app.use('/static/*', serveStatic({ root: './public' }))

// World configuration
const WORLDS = {
  detective: {
    name: 'Detective',
    color: '#C19A6B',
    icon: '🕵️',
    messageType: 'manila-folder',
    description: 'Solve criminal cases in noir-styled investigations'
  },
  horror: {
    name: 'Horror',
    color: '#B03030',
    icon: '👻',
    messageType: 'tattered-file',
    description: 'Uncover dark mysteries in terrifying scenarios'
  },
  scifi: {
    name: 'Sci-Fi',
    color: '#00C0C0',
    icon: '🚀',
    messageType: 'data-cube',
    description: 'Explore futuristic worlds and advanced technologies'
  },
  fantasy: {
    name: 'Fantasy',
    color: '#6A0DAD',
    icon: '🏰',
    messageType: 'scroll',
    description: 'Embark on magical quests in mystical realms'
  },
  space: {
    name: 'Space',
    color: '#4169E1',
    icon: '🌌',
    messageType: 'magnetic-cartridge',
    description: 'Navigate the cosmos and alien civilizations'
  },
  historical: {
    name: 'Historical',
    color: '#B08D57',
    icon: '📜',
    messageType: 'wax-sealed-letter',
    description: 'Travel through time to solve historical mysteries'
  },
  pirate: {
    name: 'Pirate',
    color: '#A52A2A',
    icon: '🏴‍☠️',
    messageType: 'treasure-map',
    description: 'Sail the seven seas in search of adventure'
  }
}

// API Routes

// Get user profile
app.get('/api/profile/:userId', async (c) => {
  const { env } = c;
  const userId = c.req.param('userId');
  
  try {
    const profile = await env.DB.prepare(`
      SELECT * FROM profiles WHERE user_id = ?
    `).bind(userId).first();
    
    if (!profile) {
      // Create new profile
      const result = await env.DB.prepare(`
        INSERT INTO profiles (user_id, email, name, rank, balance)
        VALUES (?, ?, ?, 'Rookie', 100)
        RETURNING *
      `).bind(userId, `${userId}@example.com`, 'New Player').first();
      
      return c.json(result);
    }
    
    return c.json(profile);
  } catch (error) {
    return c.json({ error: 'Failed to fetch profile' }, 500);
  }
});

// Get worlds
app.get('/api/worlds', (c) => {
  return c.json(WORLDS);
});

// Get cases for a world
app.get('/api/cases/:world', async (c) => {
  const { env } = c;
  const world = c.req.param('world');
  const userId = c.req.header('X-User-Id');
  
  try {
    const cases = await env.DB.prepare(`
      SELECT c.*, 
        CASE WHEN up.status = 'completed' THEN 1 ELSE 0 END as is_completed,
        up.status as user_status
      FROM cases c
      LEFT JOIN user_progress up ON c.case_id = up.case_id AND up.user_id = ?
      WHERE c.world = ?
      ORDER BY c.difficulty ASC
    `).bind(userId, world).all();
    
    return c.json(cases);
  } catch (error) {
    return c.json({ error: 'Failed to fetch cases' }, 500);
  }
});

// Start a case
app.post('/api/cases/:caseId/start', async (c) => {
  const { env } = c;
  const caseId = c.req.param('caseId');
  const { userId } = await c.req.json();
  
  try {
    // Check if already started
    const existing = await env.DB.prepare(`
      SELECT * FROM user_progress WHERE user_id = ? AND case_id = ?
    `).bind(userId, caseId).first();
    
    if (!existing) {
      // Create new progress entry
      await env.DB.prepare(`
        INSERT INTO user_progress (user_id, case_id, world, status, started_at)
        SELECT ?, case_id, world, 'started', CURRENT_TIMESTAMP
        FROM cases WHERE case_id = ?
      `).bind(userId, caseId).run();
    }
    
    // Get case details with initial clues
    const caseData = await env.DB.prepare(`
      SELECT * FROM cases WHERE case_id = ?
    `).bind(caseId).first();
    
    const clues = await env.DB.prepare(`
      SELECT * FROM clues 
      WHERE case_id = ? 
      AND (unlock_condition IS NULL OR unlock_condition = '{}')
      ORDER BY id ASC
    `).bind(caseId).all();
    
    return c.json({ case: caseData, clues: clues.results });
  } catch (error) {
    return c.json({ error: 'Failed to start case' }, 500);
  }
});

// Save dialogue history
app.post('/api/dialogue/save', async (c) => {
  const { env } = c;
  const { userId, caseId, dialogue } = await c.req.json();
  
  try {
    // Get current dialogue history
    const progress = await env.DB.prepare(`
      SELECT dialogue_history FROM user_progress 
      WHERE user_id = ? AND case_id = ?
    `).bind(userId, caseId).first();
    
    let history = [];
    if (progress && progress.dialogue_history) {
      history = JSON.parse(progress.dialogue_history);
    }
    history.push(dialogue);
    
    // Update dialogue history
    await env.DB.prepare(`
      UPDATE user_progress 
      SET dialogue_history = ?, status = 'in_progress'
      WHERE user_id = ? AND case_id = ?
    `).bind(JSON.stringify(history), userId, caseId).run();
    
    return c.json({ success: true });
  } catch (error) {
    return c.json({ error: 'Failed to save dialogue' }, 500);
  }
});

// Get inbox (evidence locker)
app.get('/api/inbox/:userId', async (c) => {
  const { env } = c;
  const userId = c.req.param('userId');
  
  try {
    const items = await env.DB.prepare(`
      SELECT i.*, c.title as clue_title, c.content, c.message_type,
        cases.title as case_title
      FROM inbox i
      JOIN clues c ON i.clue_id = c.clue_id
      JOIN cases ON i.case_id = cases.case_id
      WHERE i.user_id = ?
      ORDER BY i.acquired_at DESC
    `).bind(userId).all();
    
    return c.json(items);
  } catch (error) {
    return c.json({ error: 'Failed to fetch inbox' }, 500);
  }
});

// Analyze clue (premium feature)
app.post('/api/clues/:clueId/analyze', async (c) => {
  const { env } = c;
  const clueId = c.req.param('clueId');
  const { userId } = await c.req.json();
  
  try {
    // Get clue and check cost
    const clue = await env.DB.prepare(`
      SELECT * FROM clues WHERE clue_id = ?
    `).bind(clueId).first();
    
    if (!clue) {
      return c.json({ error: 'Clue not found' }, 404);
    }
    
    // Check user balance
    const profile = await env.DB.prepare(`
      SELECT balance FROM profiles WHERE user_id = ?
    `).bind(userId).first();
    
    if (profile.balance < clue.analysis_cost) {
      return c.json({ error: 'Insufficient balance' }, 400);
    }
    
    // Deduct balance
    await env.DB.prepare(`
      UPDATE profiles 
      SET balance = balance - ? 
      WHERE user_id = ?
    `).bind(clue.analysis_cost, userId).run();
    
    // Mark as analyzed in inbox
    await env.DB.prepare(`
      UPDATE inbox 
      SET is_analyzed = 1, 
        analysis_notes = 'This clue reveals important connections to the case.'
      WHERE user_id = ? AND clue_id = ?
    `).bind(userId, clueId).run();
    
    return c.json({ 
      success: true, 
      analysis: 'This clue reveals important connections to the case.',
      newBalance: profile.balance - clue.analysis_cost 
    });
  } catch (error) {
    return c.json({ error: 'Failed to analyze clue' }, 500);
  }
});

// Save session
app.post('/api/session/save', async (c) => {
  const { env } = c;
  const { userId, world, caseId, sceneState } = await c.req.json();
  
  try {
    const sessionToken = crypto.randomUUID();
    
    await env.DB.prepare(`
      INSERT INTO sessions (user_id, session_token, world, case_id, scene_state, last_activity)
      VALUES (?, ?, ?, ?, ?, CURRENT_TIMESTAMP)
      ON CONFLICT(user_id) DO UPDATE SET
        session_token = ?,
        world = ?,
        case_id = ?,
        scene_state = ?,
        last_activity = CURRENT_TIMESTAMP
    `).bind(
      userId, sessionToken, world, caseId, JSON.stringify(sceneState),
      sessionToken, world, caseId, JSON.stringify(sceneState)
    ).run();
    
    // Also save to KV for faster access
    await env.SESSION_STORE.put(
      `session:${userId}`,
      JSON.stringify({ world, caseId, sceneState }),
      { expirationTtl: 86400 * 7 } // 7 days
    );
    
    return c.json({ sessionToken });
  } catch (error) {
    return c.json({ error: 'Failed to save session' }, 500);
  }
});

// Restore session
app.get('/api/session/restore/:userId', async (c) => {
  const { env } = c;
  const userId = c.req.param('userId');
  
  try {
    // Try KV first for speed
    const kvSession = await env.SESSION_STORE.get(`session:${userId}`, 'json');
    if (kvSession) {
      return c.json(kvSession);
    }
    
    // Fallback to DB
    const session = await env.DB.prepare(`
      SELECT * FROM sessions 
      WHERE user_id = ? 
      ORDER BY last_activity DESC 
      LIMIT 1
    `).bind(userId).first();
    
    if (session) {
      return c.json({
        world: session.world,
        caseId: session.case_id,
        sceneState: JSON.parse(session.scene_state || '{}')
      });
    }
    
    return c.json(null);
  } catch (error) {
    return c.json({ error: 'Failed to restore session' }, 500);
  }
});

// Main application HTML
app.get('/', (c) => {
  return c.html(`
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>AudioVR - Immersive Voice-Driven Storytelling</title>
        <script src="https://cdn.tailwindcss.com"></script>
        <link href="https://cdn.jsdelivr.net/npm/@fortawesome/fontawesome-free@6.4.0/css/all.min.css" rel="stylesheet">
        <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            body { font-family: 'Inter', sans-serif; }
            
            .glass-card {
                background: rgba(255, 255, 255, 0.05);
                backdrop-filter: blur(10px);
                border: 1px solid rgba(255, 255, 255, 0.1);
                box-shadow: 0 8px 32px 0 rgba(31, 38, 135, 0.15);
            }
            
            .world-card {
                transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
                cursor: pointer;
            }
            
            .world-card:hover {
                transform: translateY(-5px) scale(1.02);
                box-shadow: 0 20px 40px 0 rgba(31, 38, 135, 0.3);
            }
            
            .fade-in {
                animation: fadeIn 0.5s ease-in-out;
            }
            
            @keyframes fadeIn {
                from { opacity: 0; transform: translateY(10px); }
                to { opacity: 1; transform: translateY(0); }
            }
            
            .pulse-glow {
                animation: pulse 2s infinite;
            }
            
            @keyframes pulse {
                0%, 100% { box-shadow: 0 0 20px currentColor; }
                50% { box-shadow: 0 0 40px currentColor, 0 0 60px currentColor; }
            }
        </style>
    </head>
    <body class="bg-gray-900 text-white min-h-screen">
        <div id="app"></div>
        
        <!-- ElevenLabs Conversational AI Widget -->
        <elevenlabs-convai agent-id="YOUR_AGENT_ID"></elevenlabs-convai>
        
        <script src="https://cdn.jsdelivr.net/npm/axios@1.6.0/dist/axios.min.js"></script>
        <script src="https://elevenlabs.io/convai-widget/index.js"></script>
        <script src="/static/app.js"></script>
    </body>
    </html>
  `)
})

export default app
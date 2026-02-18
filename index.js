/**
 * CAMPAIGN CHATBOT BACKEND
 * 
 * This Node.js server acts as the intermediary between your players and Claude.
 * It loads all your campaign data (NPCs, locations, sessions, lore) and uses
 * that as context when answering questions.
 * 
 * The architecture here is simple but powerful:
 * 1. Load campaign knowledge base on startup
 * 2. Receive player questions via API
 * 3. Send questions to Claude with campaign context
 * 4. Return Claude's responses to the player
 * 
 * This keeps your Anthropic API key secure on the server while allowing
 * players to ask questions freely through the web interface.
 */

const express = require('express');
const Anthropic = require('@anthropic-ai/sdk');
const fs = require('fs').promises;
const path = require('path');
const cors = require('cors');

// Initialize Express app
const app = express();
const PORT = process.env.PORT || 3001;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static('public'));

// Initialize Anthropic client
const anthropic = new Anthropic({
    apiKey: process.env.ANTHROPIC_API_KEY
});

// Campaign knowledge base (loaded on startup)
let campaignKnowledge = {
    npcs: {},
    locations: {},
    sessions: [],
    lore: '',
    rules: ''
};

/**
 * Load all campaign data files on server startup
 */
async function loadCampaignData() {
    try {
        console.log('Loading campaign knowledge base...');
        
        // Load NPCs
        try {
            const npcsData = await fs.readFile('/app/data/npcs.json', 'utf8');
            campaignKnowledge.npcs = JSON.parse(npcsData);
            console.log(`✓ Loaded ${Object.keys(campaignKnowledge.npcs).length} NPCs`);
        } catch (error) {
            console.warn('⚠ NPCs file not found, using empty dataset');
        }
        
        // Load Locations
        try {
            const locationsData = await fs.readFile('/app/data/locations.json', 'utf8');
            campaignKnowledge.locations = JSON.parse(locationsData);
            console.log(`✓ Loaded ${Object.keys(campaignKnowledge.locations).length} locations`);
        } catch (error) {
            console.warn('⚠ Locations file not found, using empty dataset');
        }
        
        // Load Sessions
        try {
            const sessionsData = await fs.readFile('/app/data/sessions.json', 'utf8');
            campaignKnowledge.sessions = JSON.parse(sessionsData);
            console.log(`✓ Loaded ${campaignKnowledge.sessions.length} session recaps`);
        } catch (error) {
            console.warn('⚠ Sessions file not found, using empty dataset');
        }
        
        // Load Lore
        try {
            campaignKnowledge.lore = await fs.readFile('/app/data/lore.txt', 'utf8');
            console.log('✓ Loaded campaign lore');
        } catch (error) {
            console.warn('⚠ Lore file not found, using empty dataset');
        }
        
        // Load House Rules
        try {
            campaignKnowledge.rules = await fs.readFile('/app/data/rules.txt', 'utf8');
            console.log('✓ Loaded house rules');
        } catch (error) {
            console.warn('⚠ Rules file not found, using empty dataset');
        }
        
        console.log('Campaign knowledge base loaded successfully!\n');
        
    } catch (error) {
        console.error('Error loading campaign data:', error);
    }
}

/**
 * Create the system prompt with campaign context
 */
function createSystemPrompt() {
    return `You are the Lore Master, a helpful and knowledgeable assistant for "The Crimson Tavern Chronicles" D&D campaign.

Your personality: You're enthusiastic about the campaign, speak with a touch of fantasy flair (but not over-the-top), and you're always eager to help players remember details or understand lore. You keep responses concise but engaging.

CAMPAIGN KNOWLEDGE BASE:

=== NPCs ===
${JSON.stringify(campaignKnowledge.npcs, null, 2)}

=== LOCATIONS ===
${JSON.stringify(campaignKnowledge.locations, null, 2)}

=== SESSION HISTORY ===
${JSON.stringify(campaignKnowledge.sessions, null, 2)}

=== CAMPAIGN LORE ===
${campaignKnowledge.lore}

=== HOUSE RULES ===
${campaignKnowledge.rules}

GUIDELINES:
- Answer questions about NPCs, locations, past events, lore, and rules based on the knowledge above
- If a player asks about something not in the knowledge base, be honest that you don't have that information and suggest they ask the DM or check the wiki
- Keep responses clear and concise (2-4 sentences usually)
- Add some personality and fantasy flavor, but stay professional
- For combat or mechanics questions, reference the house rules when relevant
- If asked about future events or DM secrets, politely say you can't reveal that information
- Help players remember details from past sessions to keep the story coherent

Remember: Your goal is to enhance the campaign experience by being a helpful, accessible source of campaign knowledge!`;
}

/**
 * Main chat endpoint
 */
app.post('/api/chat', async (req, res) => {
    try {
        const { message, conversationHistory = [] } = req.body;
        
        if (!message || typeof message !== 'string') {
            return res.status(400).json({ 
                error: 'Invalid message format' 
            });
        }
        
        console.log(`[Chat] Received message: "${message.substring(0, 50)}..."`);
        
        // Build messages array for Claude
        const messages = [
            ...conversationHistory.map(msg => ({
                role: msg.role,
                content: msg.content
            })),
            {
                role: 'user',
                content: message
            }
        ];
        
        // Call Claude API
        const response = await anthropic.messages.create({
            model: 'claude-sonnet-4-20250514',
            max_tokens: 1024,
            system: createSystemPrompt(),
            messages: messages
        });
        
        // Extract response text
        const responseText = response.content[0].text;
        
        console.log(`[Chat] Response sent (${responseText.length} chars)`);
        
        // Build updated conversation history
        const updatedHistory = [
            ...conversationHistory,
            { role: 'user', content: message },
            { role: 'assistant', content: responseText }
        ];
        
        // Keep conversation history manageable (last 20 messages)
        const trimmedHistory = updatedHistory.slice(-20);
        
        res.json({
            response: responseText,
            conversationHistory: trimmedHistory
        });
        
    } catch (error) {
        console.error('[Chat] Error:', error);
        
        // Check for specific API errors
        if (error.status === 401) {
            return res.status(500).json({ 
                error: 'API authentication failed. Please check your API key.' 
            });
        }
        
        if (error.status === 429) {
            return res.status(429).json({ 
                error: 'Rate limit exceeded. Please try again in a moment.' 
            });
        }
        
        res.status(500).json({ 
            error: 'Failed to process your message. Please try again.' 
        });
    }
});

/**
 * Health check endpoint
 */
app.get('/health', (req, res) => {
    res.json({ 
        status: 'healthy',
        knowledgeBase: {
            npcs: Object.keys(campaignKnowledge.npcs).length,
            locations: Object.keys(campaignKnowledge.locations).length,
            sessions: campaignKnowledge.sessions.length,
            hasLore: campaignKnowledge.lore.length > 0,
            hasRules: campaignKnowledge.rules.length > 0
        }
    });
});

/**
 * Endpoint to reload campaign data (useful for updates)
 */
app.post('/api/reload', async (req, res) => {
    try {
        await loadCampaignData();
        res.json({ 
            success: true, 
            message: 'Campaign data reloaded successfully' 
        });
    } catch (error) {
        console.error('[Reload] Error:', error);
        res.status(500).json({ 
            error: 'Failed to reload campaign data' 
        });
    }
});

/**
 * Start the server
 */
async function startServer() {
    // Load campaign data first
    await loadCampaignData();
    
    // Start listening
    app.listen(PORT, () => {
        console.log(`
╔═══════════════════════════════════════════════╗
║   🎲 Campaign Chatbot Server Running 🎲      ║
╠═══════════════════════════════════════════════╣
║   Port: ${PORT}                                  ║
║   Status: Ready to serve campaign lore       ║
╚═══════════════════════════════════════════════╝
        `);
    });
}

// Handle graceful shutdown
process.on('SIGTERM', () => {
    console.log('\nShutting down gracefully...');
    process.exit(0);
});

// Start the server
startServer();

/**
 * UPDATING CAMPAIGN DATA:
 * 
 * Whenever you update the JSON or text files in /app/data/, you have two options:
 * 
 * 1. Restart the container (data auto-reloads on startup):
 *    docker-compose restart chatbot
 * 
 * 2. Trigger a hot reload without restarting:
 *    curl -X POST http://localhost:3001/api/reload
 * 
 * The second option is faster and doesn't interrupt ongoing conversations.
 */

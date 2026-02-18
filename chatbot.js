/**
 * CAMPAIGN CHATBOT - Lore Master
 * 
 * This handles the interactive chatbot powered by Claude API.
 * It maintains conversation history in localStorage so players can have
 * ongoing discussions about campaign lore across sessions.
 * 
 * Features:
 * - Persistent conversation history
 * - Example query buttons for quick starts
 * - Smooth animations
 * - Error handling and loading states
 */

class CampaignChatbot {
    constructor() {
        // Load conversation history from browser storage
        this.conversationHistory = this.loadHistory();
        
        // Get DOM elements
        this.chatMessages = document.getElementById('chat-messages');
        this.chatInput = document.getElementById('chat-input');
        this.sendBtn = document.getElementById('send-btn');
        this.clearBtn = document.getElementById('clear-chat');
        this.chatToggle = document.getElementById('chatbot-toggle');
        this.chatContainer = document.getElementById('chatbot-container');
        
        // Track if chatbot is currently processing
        this.isProcessing = false;
        
        // Initialize the chatbot
        this.init();
    }
    
    /**
     * Initialize event listeners and load previous conversation
     */
    init() {
        // Display any existing conversation history
        this.displayHistory();
        
        // Send button click
        this.sendBtn.addEventListener('click', () => this.handleSend());
        
        // Enter key in input
        this.chatInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                this.handleSend();
            }
        });
        
        // Clear history button
        this.clearBtn.addEventListener('click', () => this.clearHistory());
        
        // Toggle chatbot visibility
        this.chatToggle.addEventListener('click', () => this.toggleChat());
        
        // Example query buttons
        const queryButtons = document.querySelectorAll('.query-btn');
        queryButtons.forEach(btn => {
            btn.addEventListener('click', () => {
                const query = btn.getAttribute('data-query');
                this.chatInput.value = query;
                this.handleSend();
            });
        });
        
        console.log('Lore Master chatbot initialized');
    }
    
    /**
     * Toggle chatbot expanded/collapsed state
     */
    toggleChat() {
        this.chatContainer.classList.toggle('collapsed');
        this.chatToggle.classList.toggle('open');
    }
    
    /**
     * Handle sending a message
     */
    async handleSend() {
        const message = this.chatInput.value.trim();
        
        // Don't send empty messages or if already processing
        if (!message || this.isProcessing) return;
        
        // Clear input immediately for better UX
        this.chatInput.value = '';
        
        // Display user message
        this.addMessage(message, 'user');
        
        // Show loading indicator
        const loadingId = this.showLoading();
        
        // Mark as processing
        this.isProcessing = true;
        
        try {
            // Send to API
            const response = await this.sendToAPI(message);
            
            // Remove loading indicator
            this.removeLoading(loadingId);
            
            // Display assistant response
            this.addMessage(response, 'assistant');
            
        } catch (error) {
            // Remove loading indicator
            this.removeLoading(loadingId);
            
            // Show error message
            this.addMessage(
                'Apologies, adventurer. The Lore Master is temporarily unavailable. Please try again in a moment.',
                'assistant',
                true
            );
            
            console.error('Chatbot error:', error);
        } finally {
            this.isProcessing = false;
        }
    }
    
    /**
     * Send message to the backend API
     */
    async sendToAPI(message) {
        const response = await fetch('/api/chat', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                message: message,
                conversationHistory: this.conversationHistory
            })
        });
        
        if (!response.ok) {
            throw new Error(`API error: ${response.status}`);
        }
        
        const data = await response.json();
        
        // Update conversation history
        this.conversationHistory = data.conversationHistory;
        this.saveHistory();
        
        return data.response;
    }
    
    /**
     * Add a message to the chat display
     */
    addMessage(text, role, isError = false) {
        const messageDiv = document.createElement('div');
        messageDiv.className = `chat-message ${role}`;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.textContent = text;
        
        if (isError) {
            bubbleDiv.style.borderColor = '#8b1a1a';
            bubbleDiv.style.backgroundColor = 'rgba(139, 26, 26, 0.05)';
        }
        
        messageDiv.appendChild(bubbleDiv);
        this.chatMessages.appendChild(messageDiv);
        
        // Scroll to bottom smoothly
        this.scrollToBottom();
    }
    
    /**
     * Show loading indicator while waiting for response
     */
    showLoading() {
        const loadingId = `loading-${Date.now()}`;
        const messageDiv = document.createElement('div');
        messageDiv.className = 'chat-message assistant';
        messageDiv.id = loadingId;
        
        const bubbleDiv = document.createElement('div');
        bubbleDiv.className = 'message-bubble';
        bubbleDiv.innerHTML = '<span class="loading-dots">Consulting the ancient tomes<span>.</span><span>.</span><span>.</span></span>';
        
        messageDiv.appendChild(bubbleDiv);
        this.chatMessages.appendChild(messageDiv);
        
        this.scrollToBottom();
        return loadingId;
    }
    
    /**
     * Remove loading indicator
     */
    removeLoading(loadingId) {
        const loadingElement = document.getElementById(loadingId);
        if (loadingElement) {
            loadingElement.remove();
        }
    }
    
    /**
     * Scroll chat to bottom
     */
    scrollToBottom() {
        this.chatMessages.scrollTop = this.chatMessages.scrollHeight;
    }
    
    /**
     * Display conversation history from previous session
     */
    displayHistory() {
        this.conversationHistory.forEach(msg => {
            this.addMessage(msg.content, msg.role);
        });
    }
    
    /**
     * Load conversation history from localStorage
     */
    loadHistory() {
        try {
            const saved = localStorage.getItem('campaignChatHistory');
            return saved ? JSON.parse(saved) : [];
        } catch (error) {
            console.error('Error loading chat history:', error);
            return [];
        }
    }
    
    /**
     * Save conversation history to localStorage
     */
    saveHistory() {
        try {
            localStorage.setItem('campaignChatHistory', JSON.stringify(this.conversationHistory));
        } catch (error) {
            console.error('Error saving chat history:', error);
        }
    }
    
    /**
     * Clear conversation history
     */
    clearHistory() {
        if (confirm('Clear all chat history? This cannot be undone.')) {
            this.conversationHistory = [];
            this.chatMessages.innerHTML = '';
            localStorage.removeItem('campaignChatHistory');
            
            // Show intro message again
            const intro = document.querySelector('.chatbot-intro');
            if (intro) {
                intro.style.display = 'block';
            }
        }
    }
}

// Initialize chatbot when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.campaignChatbot = new CampaignChatbot();
});

// Add CSS for loading dots animation
const style = document.createElement('style');
style.textContent = `
    .loading-dots span {
        animation: loadingDot 1.4s infinite;
    }
    .loading-dots span:nth-child(2) {
        animation-delay: 0.2s;
    }
    .loading-dots span:nth-child(3) {
        animation-delay: 0.4s;
    }
    @keyframes loadingDot {
        0%, 60%, 100% { opacity: 0; }
        30% { opacity: 1; }
    }
`;
document.head.appendChild(style);

/**
 * CAMPAIGN UPDATES MANAGER
 * 
 * This script manages the campaign updates feed on your homepage. It loads
 * updates from a JSON file and displays them in the updates grid.
 * 
 * The beauty of this approach is that you can manage all your updates in a
 * single JSON file. Whenever you want to post a new update, just add an entry
 * to the JSON, push to your git repo, and the site automatically displays it.
 * No need to edit the HTML directly.
 * 
 * This keeps your workflow simple: write updates in a structured format,
 * and let the JavaScript handle the presentation layer.
 */

class UpdatesManager {
    constructor() {
        this.updatesContainer = document.getElementById('recent-updates');
        this.heroUpdate = document.getElementById('hero-update');
        this.updates = [];
        
        this.loadUpdates();
    }
    
    /**
     * Load updates from JSON file
     */
    async loadUpdates() {
        try {
            const response = await fetch('/updates/updates.json');
            if (!response.ok) {
                throw new Error('Failed to load updates');
            }
            
            const data = await response.json();
            this.updates = data.updates;
            
            // Sort by date (most recent first)
            this.updates.sort((a, b) => new Date(b.date) - new Date(a.date));
            
            // Display updates
            this.displayRecentUpdates();
            
        } catch (error) {
            console.error('Error loading updates:', error);
            this.showError();
        }
    }
    
    /**
     * Display the 3 most recent updates (excluding the hero update)
     */
    displayRecentUpdates() {
        if (!this.updatesContainer) return;
        
        // Clear existing content
        this.updatesContainer.innerHTML = '';
        
        // Get updates to display (skip the first one as it's shown in hero)
        const recentUpdates = this.updates.slice(1, 4);
        
        // Create cards for each update
        recentUpdates.forEach(update => {
            const card = this.createUpdateCard(update);
            this.updatesContainer.appendChild(card);
        });
    }
    
    /**
     * Create an update card element
     */
    createUpdateCard(update) {
        const card = document.createElement('div');
        card.className = 'update-card';
        card.setAttribute('data-type', update.type);
        
        // Format the date nicely
        const date = new Date(update.date);
        const formattedDate = date.toLocaleDateString('en-US', { 
            month: 'short', 
            day: 'numeric', 
            year: 'numeric' 
        });
        
        // Determine card type label
        const typeLabels = {
            'session-recap': 'Session Recap',
            'lore-update': 'Lore Update',
            'map': 'Map Update',
            'rules': 'House Rule',
            'npc': 'New NPC',
            'item': 'New Item',
            'announcement': 'Announcement'
        };
        const typeLabel = typeLabels[update.type] || 'Update';
        
        // Build the card HTML
        card.innerHTML = `
            <div class="card-header">
                <span class="card-type">${typeLabel}</span>
                <span class="card-date">${formattedDate}</span>
            </div>
            <h3 class="card-title">${update.title}</h3>
            <p class="card-excerpt">${update.content}</p>
            ${update.wikiLink ? `<a href="${update.wikiLink}" class="card-link">View in Wiki →</a>` : ''}
        `;
        
        return card;
    }
    
    /**
     * Show error message if updates fail to load
     */
    showError() {
        if (this.updatesContainer) {
            this.updatesContainer.innerHTML = `
                <div style="text-align: center; padding: 2rem; color: #8b7355;">
                    <p>Unable to load recent updates. Please refresh the page.</p>
                </div>
            `;
        }
    }
    
    /**
     * Add a new update (for future admin panel functionality)
     */
    addUpdate(update) {
        this.updates.unshift(update);
        this.displayRecentUpdates();
        // In a real implementation, you'd also save to the server/JSON file
    }
}

// Initialize updates manager when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.updatesManager = new UpdatesManager();
});

/**
 * WORKFLOW FOR THE DM:
 * 
 * To add a new campaign update:
 * 
 * 1. Open /updates/updates.json
 * 
 * 2. Add a new entry at the top of the "updates" array:
 *    {
 *      "id": 48,
 *      "title": "Session 48: Shadows of the Past",
 *      "date": "2026-01-20",
 *      "type": "session-recap",
 *      "content": "The party discovered shocking revelations...",
 *      "tags": ["combat", "revelation"],
 *      "wikiLink": "/wiki/sessions/session-48"
 *    }
 * 
 * 3. Commit and push to your git repo (or just save if not using git)
 * 
 * 4. The site will automatically load and display the new update
 * 
 * Available types: session-recap, lore-update, map, rules, npc, item, announcement
 */

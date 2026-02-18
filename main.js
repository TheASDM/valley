/**
 * MAIN SITE FUNCTIONALITY
 * 
 * This file handles general site features like smooth scrolling,
 * navigation highlighting, and other interactive elements.
 * 
 * Think of this as the glue that makes the site feel polished and responsive
 * to user interactions. Small touches like smooth scrolling and active link
 * highlighting make a huge difference in how professional and immersive
 * the experience feels.
 */

class CampaignSite {
    constructor() {
        this.init();
    }
    
    /**
     * Initialize all site functionality
     */
    init() {
        this.setupSmoothScrolling();
        this.setupActiveNavigation();
        this.setupAnimations();
        this.logWelcome();
    }
    
    /**
     * Enable smooth scrolling for anchor links
     */
    setupSmoothScrolling() {
        document.querySelectorAll('a[href^="#"]').forEach(anchor => {
            anchor.addEventListener('click', function (e) {
                const href = this.getAttribute('href');
                
                // Don't smooth scroll if it's just "#"
                if (href === '#') {
                    e.preventDefault();
                    return;
                }
                
                const target = document.querySelector(href);
                if (target) {
                    e.preventDefault();
                    
                    // Smooth scroll to target
                    target.scrollIntoView({
                        behavior: 'smooth',
                        block: 'start'
                    });
                    
                    // Update URL without jumping
                    history.pushState(null, null, href);
                }
            });
        });
    }
    
    /**
     * Highlight active navigation items based on scroll position
     */
    setupActiveNavigation() {
        // This is for future expansion when you have multiple pages
        // For now, just ensure the home link is active on the homepage
        const currentPath = window.location.pathname;
        document.querySelectorAll('.nav-item').forEach(item => {
            const href = item.getAttribute('href');
            if (href === currentPath || (currentPath === '/' && href === '/')) {
                item.classList.add('active');
            }
        });
    }
    
    /**
     * Setup scroll-triggered animations
     */
    setupAnimations() {
        // Observe elements that should animate when scrolled into view
        const observerOptions = {
            threshold: 0.1,
            rootMargin: '0px 0px -50px 0px'
        };
        
        const observer = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.opacity = '1';
                    entry.target.style.transform = 'translateY(0)';
                }
            });
        }, observerOptions);
        
        // Animate update cards as they come into view
        document.querySelectorAll('.update-card').forEach(card => {
            card.style.opacity = '0';
            card.style.transform = 'translateY(20px)';
            card.style.transition = 'opacity 0.5s ease, transform 0.5s ease';
            observer.observe(card);
        });
        
        // Animate session items
        document.querySelectorAll('.session-item').forEach((item, index) => {
            item.style.opacity = '0';
            item.style.transform = 'translateX(-20px)';
            item.style.transition = `opacity 0.5s ease ${index * 0.1}s, transform 0.5s ease ${index * 0.1}s`;
            observer.observe(item);
        });
    }
    
    /**
     * Log welcome message to console (Easter egg for curious players)
     */
    logWelcome() {
        const styles = [
            'color: #8b1a1a',
            'font-size: 16px',
            'font-weight: bold',
            'text-shadow: 2px 2px 4px rgba(0,0,0,0.3)'
        ].join(';');
        
        console.log('%c🎲 Welcome to The Crimson Tavern Chronicles! 🎲', styles);
        console.log('%cMay your rolls be high and your adventures legendary.', 'color: #b8860b; font-style: italic;');
        console.log('\nInterested in the code? Check out the GitHub repo!');
    }
    
    /**
     * Handle window resize events
     */
    handleResize() {
        // Adjust layout if needed on resize
        // This is where you'd handle responsive behavior that CSS can't cover
    }
    
    /**
     * Utility function to show notifications (for future features)
     */
    showNotification(message, type = 'info') {
        const notification = document.createElement('div');
        notification.className = `notification notification-${type}`;
        notification.textContent = message;
        
        // Style the notification
        Object.assign(notification.style, {
            position: 'fixed',
            top: '20px',
            right: '20px',
            background: type === 'error' ? '#8b1a1a' : '#4a3728',
            color: 'white',
            padding: '1rem 1.5rem',
            borderRadius: '8px',
            boxShadow: '0 4px 8px rgba(0,0,0,0.3)',
            zIndex: '1000',
            animation: 'slideIn 0.3s ease'
        });
        
        document.body.appendChild(notification);
        
        // Remove after 3 seconds
        setTimeout(() => {
            notification.style.animation = 'slideOut 0.3s ease';
            setTimeout(() => notification.remove(), 300);
        }, 3000);
    }
}

// Initialize site functionality when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.campaignSite = new CampaignSite();
});

// Handle window resize
window.addEventListener('resize', () => {
    if (window.campaignSite) {
        window.campaignSite.handleResize();
    }
});

// Add notification animations
const style = document.createElement('style');
style.textContent = `
    @keyframes slideIn {
        from {
            transform: translateX(400px);
            opacity: 0;
        }
        to {
            transform: translateX(0);
            opacity: 1;
        }
    }
    
    @keyframes slideOut {
        from {
            transform: translateX(0);
            opacity: 1;
        }
        to {
            transform: translateX(400px);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

/**
 * FUTURE ENHANCEMENTS:
 * 
 * This main.js file is designed to be extensible. Here are some features
 * you might want to add in the future:
 * 
 * 1. Search functionality across wiki and updates
 * 2. Theme switcher (dark mode for late-night sessions)
 * 3. Notification system for new updates
 * 4. Keyboard shortcuts for power users
 * 5. Session note-taking functionality
 * 6. Character sheet integration
 * 7. Dice roller widget
 * 
 * The architecture is set up to make these additions straightforward.
 * Just add new methods to the CampaignSite class or create new classes
 * that follow the same patterns used in the other JavaScript files.
 */

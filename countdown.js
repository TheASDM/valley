/**
 * SESSION COUNTDOWN TIMER
 * 
 * This creates a live countdown to your next D&D session.
 * It updates every second and displays days, hours, and minutes remaining.
 * 
 * The design philosophy here is simple: build anticipation. When your players
 * visit the site, they immediately see how close they are to the next adventure.
 * This helps maintain engagement between sessions.
 */

class SessionCountdown {
    constructor() {
        // Set your next session date and time here (adjust timezone as needed)
        // Format: Year, Month (0-11), Day, Hour (24hr), Minute
        this.nextSession = new Date(2026, 0, 20, 19, 0, 0); // Jan 20, 2026 at 7:00 PM
        
        // Get DOM elements
        this.daysElement = document.getElementById('days');
        this.hoursElement = document.getElementById('hours');
        this.minutesElement = document.getElementById('minutes');
        this.dateElement = document.getElementById('next-session-date');
        
        // Start the countdown
        this.updateCountdown();
        this.startTimer();
        
        // Update the displayed date
        this.updateSessionDate();
    }
    
    /**
     * Calculate time remaining until next session
     */
    calculateTimeRemaining() {
        const now = new Date().getTime();
        const sessionTime = this.nextSession.getTime();
        const distance = sessionTime - now;
        
        // Calculate time components
        const days = Math.floor(distance / (1000 * 60 * 60 * 24));
        const hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        const minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        
        return {
            days: days > 0 ? days : 0,
            hours: hours > 0 ? hours : 0,
            minutes: minutes > 0 ? minutes : 0,
            expired: distance < 0
        };
    }
    
    /**
     * Update countdown display
     */
    updateCountdown() {
        const time = this.calculateTimeRemaining();
        
        if (time.expired) {
            // Session time has passed
            this.daysElement.textContent = '0';
            this.hoursElement.textContent = '0';
            this.minutesElement.textContent = '0';
            
            // You could add special styling or message here
            const countdownDisplay = document.querySelector('.countdown-display');
            if (countdownDisplay) {
                countdownDisplay.style.background = 'linear-gradient(135deg, #4a3728, #5c4a3a)';
            }
        } else {
            // Update the display with current countdown
            this.daysElement.textContent = time.days;
            this.hoursElement.textContent = time.hours;
            this.minutesElement.textContent = time.minutes;
            
            // Add pulsing animation when less than 24 hours remain
            if (time.days === 0) {
                const countdownDisplay = document.querySelector('.countdown-display');
                if (countdownDisplay) {
                    countdownDisplay.style.animation = 'pulse 2s ease-in-out infinite';
                }
            }
        }
    }
    
    /**
     * Start the countdown timer (updates every second)
     */
    startTimer() {
        // Update every second
        setInterval(() => {
            this.updateCountdown();
        }, 1000);
    }
    
    /**
     * Update the session date display
     */
    updateSessionDate() {
        const options = { 
            weekday: 'long', 
            year: 'numeric', 
            month: 'long', 
            day: 'numeric' 
        };
        
        const formattedDate = this.nextSession.toLocaleDateString('en-US', options);
        
        if (this.dateElement) {
            this.dateElement.textContent = formattedDate;
        }
    }
    
    /**
     * Update to a new session date (useful for DM to call after a session)
     */
    setNextSession(year, month, day, hour, minute) {
        this.nextSession = new Date(year, month, day, hour, minute);
        this.updateSessionDate();
        this.updateCountdown();
    }
}

// Initialize countdown when DOM is ready
document.addEventListener('DOMContentLoaded', () => {
    window.sessionCountdown = new SessionCountdown();
});

// Add pulse animation CSS
const style = document.createElement('style');
style.textContent = `
    @keyframes pulse {
        0%, 100% { 
            transform: scale(1); 
            box-shadow: 0 0 0 0 rgba(184, 134, 11, 0.7);
        }
        50% { 
            transform: scale(1.05); 
            box-shadow: 0 0 20px 10px rgba(184, 134, 11, 0);
        }
    }
`;
document.head.appendChild(style);

/**
 * USAGE INSTRUCTIONS FOR THE DM:
 * 
 * To update the next session date, you can either:
 * 
 * 1. Edit this file and change the date in the constructor:
 *    this.nextSession = new Date(2026, 0, 27, 19, 0, 0);
 *    (Remember: months are 0-indexed, so January = 0, February = 1, etc.)
 * 
 * 2. Or, from the browser console, run:
 *    sessionCountdown.setNextSession(2026, 0, 27, 19, 0);
 * 
 * For a more permanent solution, you could create an admin panel that saves
 * the next session date to a configuration file or database, which this
 * script could then load via fetch().
 */

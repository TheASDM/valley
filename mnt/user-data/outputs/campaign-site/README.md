# The Crimson Tavern Chronicles - Campaign Website

A beautiful, immersive D&D campaign website featuring a medieval tavern aesthetic, interactive chatbot powered by Claude AI, session tracking, and comprehensive wiki integration.

## What This System Provides

This is a complete self-hosted campaign management system that gives your players a central hub for everything related to your D&D campaign. Think of it as your campaign's home on the internet - a place where players can check upcoming session times, review past adventures, ask questions about lore, and immerse themselves in the world you've built together.

The design philosophy mirrors your physical gaming space: creating an atmosphere that pulls players into the world. The medieval tavern aesthetic with warm leather tones, aged parchment textures, and candlelight effects makes visiting the site feel like stepping into The Crimson Tavern itself.

## Architecture Overview

This system is built using a microservices architecture with Docker containers. If you're not familiar with Docker, think of it as a way to package each component of the website (database, wiki, chatbot, web server) into isolated units that work together seamlessly. This makes deployment simple and keeps everything organized.

Here's what each component does:

**PostgreSQL Database**: Stores all the Wiki.js content. Think of this as the filing cabinet where your wiki articles are kept.

**Wiki.js**: A powerful, modern wiki engine that lets you create and organize all your campaign content - NPCs, locations, items, rules, session recaps. It has a beautiful editor and makes organizing information intuitive.

**Chatbot Backend**: A Node.js application that connects to the Anthropic Claude API. This is the "brain" that answers your players' lore questions by searching through all your campaign data.

**Nginx**: A web server that acts as the front door to your site. It directs traffic to the right place - static pages go to the HTML files, wiki requests go to Wiki.js, and chatbot questions go to the chatbot backend.

**Static Frontend**: Your beautiful landing page with session countdowns, update feeds, and the chatbot interface. This is what players see first when they visit.

## Prerequisites

Before you begin, you'll need:

### 1. A Server or VM
You'll need a Linux machine to host this. Based on your Proxmox setup, I recommend creating a new VM with:
- **OS**: Ubuntu 22.04 LTS (or newer)
- **CPU**: 2 cores minimum
- **RAM**: 4 GB minimum (6-8 GB recommended)
- **Disk**: 20 GB minimum (more if you plan to store many images/maps)

The resource requirements are modest because we're optimizing for a small group of players, not running a public-facing service.

### 2. Docker & Docker Compose
Docker packages applications into containers. Docker Compose orchestrates multiple containers working together. We'll install both during setup.

### 3. Anthropic API Key
You'll need an API key from Anthropic to power the chatbot. Here's how to get one:
1. Go to https://console.anthropic.com
2. Sign up or log in
3. Navigate to Settings → API Keys
4. Create a new key
5. Copy it somewhere safe (you'll only see it once)

API usage costs money, but it's very affordable for a small D&D group. Expect roughly $5-10 per month for typical campaign usage. You can set spending limits in the console to prevent surprises.

### 4. Basic Linux Knowledge
You should be comfortable with:
- SSH into a server
- Running commands in a terminal
- Editing text files with nano or vim
- Basic file operations (cd, ls, mkdir, etc.)

If you're comfortable managing your Proxmox homelab, you already have these skills.

## Installation Guide

Let's walk through the installation step by step. I'll explain what each command does and why we're doing it, so you understand the process rather than just copying commands blindly.

### Step 1: Prepare Your Server

First, create your VM in Proxmox with the specifications mentioned above. Install Ubuntu 22.04 LTS and make sure you can SSH into it.

Once you're logged in, update the system to ensure all packages are current:

```bash
sudo apt update && sudo apt upgrade -y
```

This updates the package list and upgrades any outdated packages. The `-y` flag automatically says "yes" to prompts, making it non-interactive.

### Step 2: Install Docker

Docker provides official installation scripts that handle all the complexity for you. Here's how to install it:

```bash
# Download and run Docker's installation script
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh

# Add your user to the docker group so you don't need sudo for every docker command
sudo usermod -aG docker $USER

# Log out and back in for group changes to take effect
exit
```

After logging back in, verify Docker is installed correctly:

```bash
docker --version
docker-compose --version
```

You should see version numbers for both commands. If you do, Docker is ready to go.

### Step 3: Clone or Upload the Campaign Site Files

You have two options here:

**Option A: Using Git** (recommended if you want version control)
```bash
cd ~
git clone <your-repo-url> campaign-site
cd campaign-site
```

**Option B: Manual Upload** (if you don't want to use Git)
Upload the entire campaign-site folder to your server using SCP or SFTP:

```bash
# From your local machine:
scp -r campaign-site user@your-server-ip:~/
```

Then SSH into your server and navigate to the folder:
```bash
cd ~/campaign-site
```

### Step 4: Configure Your Environment

Create your environment file with your actual API key:

```bash
cp .env.example .env
nano .env
```

In the nano editor, replace `your_api_key_here` with your actual Anthropic API key. The file should look like:

```
ANTHROPIC_API_KEY=sk-ant-api03-your-actual-key-here
NODE_ENV=production
```

Save and exit nano (Ctrl+X, then Y, then Enter).

**Important Security Note**: This .env file contains sensitive credentials. Make sure it's never committed to version control if you use Git. The .gitignore file is already configured to prevent this, but it's worth understanding why this matters.

### Step 5: Customize Your Campaign Data

Before launching, you'll want to customize the campaign data files with your own content. The files in `campaign-data/` currently contain example data based on the Crimson Tavern Chronicles campaign. Here's what you should update:

```bash
# Edit NPCs with your campaign's characters
nano campaign-data/npcs.json

# Edit locations with your campaign's world
nano campaign-data/locations.json

# Edit session history
nano campaign-data/sessions.json

# Edit campaign lore
nano campaign-data/lore.txt

# Edit house rules
nano campaign-data/rules.txt
```

These files provide the knowledge base for your chatbot. The more detailed and accurate you make them, the better the chatbot will be at answering player questions.

You should also update the countdown timer with your actual next session date:

```bash
nano static-site/js/countdown.js
```

Find the line that sets `this.nextSession` and update it with your date and time.

### Step 6: Configure DNS (Optional but Recommended)

For the best experience, set up a local DNS entry so you can access the site with a friendly name like `campaign.local` instead of an IP address.

If you have a local DNS server (like Pi-hole), add an A record pointing to your VM's IP.

Alternatively, you can edit your hosts file on each player's computer:
- **Windows**: `C:\Windows\System32\drivers\etc\hosts`
- **Mac/Linux**: `/etc/hosts`

Add a line like:
```
192.168.1.100  campaign.local
```

(Replace with your VM's actual IP address)

### Step 7: Launch the Application

Now comes the exciting part - starting everything up! Docker Compose will read the configuration file and start all the containers:

```bash
# Start all services in the background
docker-compose up -d
```

The `-d` flag means "detached mode" - the containers run in the background so you can close your SSH session without stopping them.

Docker will now:
1. Download the necessary images (PostgreSQL, Wiki.js, Nginx, Node.js)
2. Build your custom chatbot container
3. Create the network for containers to communicate
4. Start all services

This first run takes a few minutes because it needs to download images. Subsequent starts are much faster.

Check that everything started correctly:

```bash
docker-compose ps
```

You should see all four containers running:
- campaign_db (postgres)
- campaign_wiki (wikijs)
- campaign_chatbot (chatbot)
- campaign_nginx (nginx)

If any container shows as "Exited" or "Restarting", check the logs:

```bash
docker-compose logs [container-name]
```

### Step 8: Initial Wiki.js Setup

Open your browser and navigate to `http://campaign.local/wiki` (or use your server's IP address).

Wiki.js will present a setup wizard. Follow these steps:

1. **Choose Installation Type**: Select "PostgreSQL"

2. **Database Configuration**:
   - Host: `postgres`
   - Port: `5432`
   - Username: `wikijs`
   - Password: `ChangeThisPassword123!` (or whatever you set in docker-compose.yml)
   - Database: `wiki`

3. **Create Admin Account**: Set up your administrator credentials

4. **Finish Setup**: Wiki.js will initialize its database

Once setup is complete, you'll be taken to the wiki dashboard where you can start creating pages.

### Step 9: Organize Your Wiki

Create the basic structure for your campaign wiki. Here's a suggested organization:

**Main Categories:**
- Locations (with subcategories for regions, cities, dungeons)
- NPCs & Factions
- Lore & History
- Magic Items
- House Rules
- Session Archive

Wiki.js makes it easy to create pages and organize them into hierarchies. As you add content, remember that this information also becomes available to the chatbot - so the more detailed your wiki, the better the chatbot can answer player questions.

### Step 10: Test the Chatbot

Navigate to your site's homepage at `http://campaign.local`

You should see:
- The beautiful medieval tavern interface
- The countdown to your next session
- Recent campaign updates
- The Lore Master chatbot in the right sidebar

Try asking the chatbot a question like "Who is Valdris?" or "Tell me about Thornkeep" to verify it's working correctly.

If the chatbot isn't responding:
1. Check the chatbot container logs: `docker-compose logs chatbot`
2. Verify your API key is correct in the .env file
3. Make sure the campaign data files exist in the expected location

## Daily Operations

Once everything is set up, here's how you'll use and maintain the system.

### Adding Campaign Updates

When you want to post a new update for your players:

1. Edit the updates file:
   ```bash
   nano static-site/updates/updates.json
   ```

2. Add a new entry at the top of the "updates" array:
   ```json
   {
     "id": 48,
     "title": "Session 48: Your Title Here",
     "date": "2026-01-20",
     "type": "session-recap",
     "content": "Your update content here...",
     "tags": ["relevant", "tags"],
     "wikiLink": "/wiki/sessions/session-48"
   }
   ```

3. Save the file

4. The update appears immediately - no restart needed!

### Updating Campaign Data

When you want to add NPCs, locations, or lore that the chatbot should know about:

1. Edit the relevant file:
   ```bash
   nano campaign-data/npcs.json
   # or locations.json, sessions.json, lore.txt, rules.txt
   ```

2. Add or update the information

3. Reload the chatbot to pick up changes:
   ```bash
   docker-compose restart chatbot
   ```

Alternatively, you can trigger a hot reload without restarting:
```bash
curl -X POST http://localhost:3001/api/reload
```

### Updating the Next Session Date

Edit the countdown timer:
```bash
nano static-site/js/countdown.js
```

Find this line and update the date:
```javascript
this.nextSession = new Date(2026, 0, 27, 19, 0, 0);
```

Remember: months are 0-indexed (0=January, 1=February, etc.)

### Viewing Logs

If something isn't working correctly, logs are your friend:

```bash
# View all logs
docker-compose logs

# View logs for a specific service
docker-compose logs chatbot
docker-compose logs wikijs

# Follow logs in real-time (useful for debugging)
docker-compose logs -f chatbot
```

### Restarting Services

If you need to restart everything:
```bash
docker-compose restart
```

Or restart a specific service:
```bash
docker-compose restart chatbot
```

### Stopping and Starting

To stop all services:
```bash
docker-compose down
```

To start them again:
```bash
docker-compose up -d
```

Note: Stopping doesn't delete your data. Everything persists in Docker volumes.

## Backup Strategy

Regular backups are essential. Here's what to back up and how:

### What to Backup

1. **Campaign Data Files**: Your NPCs, locations, sessions, lore
2. **Wiki Database**: All your wiki content
3. **Static Site Content**: Updates and custom pages
4. **Configuration**: .env and docker-compose.yml

### How to Backup

Create a backup script:

```bash
nano ~/backup-campaign.sh
```

```bash
#!/bin/bash
BACKUP_DIR=~/campaign-backups
DATE=$(date +%Y%m%d_%H%M%S)

# Create backup directory
mkdir -p $BACKUP_DIR

# Backup campaign data
tar -czf $BACKUP_DIR/campaign-data-$DATE.tar.gz ~/campaign-site/campaign-data/

# Backup static site
tar -czf $BACKUP_DIR/static-site-$DATE.tar.gz ~/campaign-site/static-site/

# Backup Wiki.js database
docker exec campaign_db pg_dump -U wikijs wiki > $BACKUP_DIR/wiki-$DATE.sql

# Backup configuration
cp ~/campaign-site/.env $BACKUP_DIR/env-$DATE.backup
cp ~/campaign-site/docker-compose.yml $BACKUP_DIR/docker-compose-$DATE.yml

# Keep only last 30 days of backups
find $BACKUP_DIR -type f -mtime +30 -delete

echo "Backup completed: $DATE"
```

Make it executable:
```bash
chmod +x ~/backup-campaign.sh
```

Run it manually:
```bash
~/backup-campaign.sh
```

Or schedule it with cron to run weekly:
```bash
crontab -e
```

Add this line:
```
0 3 * * 0 ~/backup-campaign.sh
```

This runs the backup every Sunday at 3 AM.

## Troubleshooting

### Chatbot Not Responding

**Symptom**: Players ask questions but get no response

**Possible Causes**:
1. API key issue
2. Chatbot container crashed
3. Network connectivity problem

**Solutions**:
```bash
# Check if chatbot is running
docker-compose ps

# View chatbot logs
docker-compose logs chatbot

# Restart chatbot
docker-compose restart chatbot

# Verify API key is correct
nano .env
```

### Wiki Won't Load

**Symptom**: /wiki path shows error or blank page

**Solutions**:
```bash
# Check Wiki.js logs
docker-compose logs wikijs

# Verify database is running
docker-compose ps

# Restart Wiki.js
docker-compose restart wikijs
```

### Updates Not Showing

**Symptom**: New updates don't appear on homepage

**Solutions**:
1. Check JSON syntax in updates.json (use JSONLint.com)
2. Clear your browser cache
3. Check browser console for JavaScript errors

### Countdown Timer Not Working

**Symptom**: Shows 0 days/hours/minutes or wrong time

**Solutions**:
1. Verify date format in countdown.js
2. Remember months are 0-indexed
3. Check browser console for errors

## Security Considerations

### API Key Protection
- Never commit .env to git
- Restrict API key permissions in Anthropic console
- Monitor API usage for anomalies
- Rotate keys periodically

### Network Security
- Consider running on a private network only
- Use a reverse proxy with SSL if exposing to internet
- Keep Docker and all images updated
- Set strong passwords for Wiki.js admin

### Data Privacy
- Campaign data is stored locally on your server
- No data leaves your network except API calls to Anthropic
- Consider encrypting backups if they contain sensitive info

## Customization Ideas

Once you're comfortable with the basic system, here are ideas for enhancement:

### Visual Customization
- Replace the dice emoji in the header with your own logo
- Adjust color scheme in CSS variables (style.css lines 16-29)
- Add custom background image for your campaign
- Create custom fonts to match your theme

### Functional Enhancements
- Add a dice roller widget
- Create character sheet integration
- Build an initiative tracker
- Add music player with ambient tavern sounds
- Create a session calendar with Google Calendar integration

### Content Additions
- Add a gallery for session photos
- Create handout downloads section
- Build a character relationship map
- Add searchable bestiary
- Create interactive maps with clickable locations

## Getting Help

If you run into issues:

1. **Check the logs**: They usually reveal the problem
2. **Review this README**: The troubleshooting section covers common issues
3. **Test components individually**: Isolate which service has the problem
4. **Search the error message**: Often others have encountered similar issues

## Conclusion

You now have a complete, beautiful campaign website that rivals professional game companies' player portals - all self-hosted on your own infrastructure.

The system is designed to be maintainable and extensible. As your campaign evolves, you can continue adding features, adjusting the design, and expanding the content.

Most importantly, this site enhances your campaign by keeping players engaged between sessions, making lore accessible, and creating a central hub for your shared storytelling experience.

May your rolls be high and your adventures legendary!

---
Created with ⚔️ for The Crimson Tavern Chronicles

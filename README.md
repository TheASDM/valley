# The Crimson Tavern Chronicles
## D&D Campaign Website with AI Lore Master

A self-hosted campaign management system featuring:
- 📚 Wiki.js for campaign documentation
- 🤖 Claude-powered AI chatbot for lore questions
- 📰 Updates feed for session recaps and announcements
- ⏰ Session countdown timer
- 🗺️ Resource library for maps and handouts

## Quick Start

```bash
# 1. Clone or download this repository
# 2. Copy environment example
cp .env.example .env

# 3. Edit .env and add your Anthropic API key
nano .env

# 4. Deploy
./deploy.sh
```

Access your site at: http://localhost:8080

## Documentation

See [SETUP.md](SETUP.md) for detailed setup instructions.

## Project Structure

```
.
├── docker-compose.yml          # Docker orchestration
├── deploy.sh                   # Deployment script
├── .env                        # Your configuration (not in git)
├── .env.example               # Configuration template
│
├── nginx/                      # Web server config
│   ├── nginx.conf
│   └── conf.d/
│       └── dnd-site.conf
│
├── chatbot/                    # AI chatbot service
│   ├── Dockerfile
│   ├── package.json
│   └── index.js
│
├── campaign-data/              # Your campaign content
│   ├── npcs.json
│   ├── locations.json
│   ├── factions.json
│   ├── sessions.json
│   ├── items.json
│   ├── lore.txt
│   └── house-rules.txt
│
└── static-site/                # Frontend
    ├── index.html
    ├── sessions.html
    ├── resources.html
    ├── css/
    │   ├── style.css
    │   └── chatbot.css
    ├── js/
    │   ├── main.js
    │   ├── updates.js
    │   ├── chatbot.js
    │   └── countdown.js
    └── data/
        └── updates.json
```

## Features

### AI Lore Master Chatbot
- Powered by Claude Sonnet 4
- Answers questions about NPCs, locations, factions, and lore
- Context-aware responses based on your campaign data
- Conversation history saved locally

### Campaign Wiki
- Full Wiki.js installation
- Organize campaign content by category
- Search functionality
- Version control for pages

### Updates Feed
- Session recaps
- NPC introductions
- Location updates
- Rules announcements

### Session Management
- Countdown timer to next session
- Session archive
- Automatic session numbering

## Customization

### Update Campaign Data
Edit files in `campaign-data/` directory - changes are immediate.

### Add Updates
Edit `static-site/data/updates.json`

### Create Wiki Pages
Log in to Wiki.js at http://localhost:8080/wiki

### Customize Appearance
Edit `static-site/css/style.css` for colors and layout

## Requirements

- Docker & Docker Compose
- 4GB RAM minimum
- Anthropic API key
- Ports 8080 and 8443 available

## Maintenance

```bash
# View logs
docker-compose logs -f

# Restart services
docker-compose restart

# Stop everything
docker-compose down

# Update to latest
git pull
./deploy.sh
```

## Backup

```bash
# Backup wiki database
docker-compose exec postgres pg_dump -U wikijs wiki > wiki-backup.sql

# Backup campaign data
tar -czf campaign-backup.tar.gz campaign-data/ static-site/data/
```

## Support

For issues with:
- **Wiki.js**: https://docs.requarks.io/
- **Claude API**: https://docs.anthropic.com/
- **Docker**: https://docs.docker.com/

## License

This project is provided as-is for personal use.

Campaign content © Your Name

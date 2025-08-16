# Building Science Millionaire 🎮

**Who Wants to be a Buildonaire** - An interactive building science quiz game with real-time leaderboards and AI-powered voice hosting.

## 🎯 Game Features

- **100 Building Science Questions** with progressive difficulty
- **OpenAI TTS Voice Host** - Professional game show experience  
- **Real-time Leaderboards** - Daily, weekly, and all-time rankings
- **Player Registration** - Lead generation and analytics
- **Admin Dashboard** - View stats and export data
- **Mobile Responsive** - Play on any device

## 🚀 Quick Start

### Local Development
```bash
# Clone and setup
git clone https://github.com/backlash2023/building-science-millionaire.git
cd building-science-millionaire
npm install

# Setup environment
cp .env.local.example .env.local
# Add your OpenAI API key to .env.local

# Setup database and import questions
npx prisma migrate deploy
npx tsx scripts/import-all-questions.ts

# Start development server
npm run dev
```

### Production Deployment
```bash
# Build application
npm run build

# Start with PM2
pm2 start ecosystem.config.js --env production
```

## 🎪 Game Show Experience

- **15 Questions** from $100 to $1,000,000
- **3 Lifelines**: 50:50, Phone a Friend, Ask the Audience
- **Professional Voice Acting** via OpenAI TTS
- **Difficulty Progression**:
  - Levels 1-5: Easy (Basic building science)
  - Levels 6-9: Medium (Professional knowledge)  
  - Levels 10-12: Hard (Advanced concepts)
  - Levels 13-15: Expert (Research-level)

## 📊 Built for Lead Generation

- **Complete Player Profiles** - Name, email, company, job title
- **Performance Analytics** - Question-by-question tracking
- **Marketing Opt-ins** - GDPR compliant data collection
- **Admin Dashboard** - Export leads and view statistics
- **Real-time Tracking** - Monitor game sessions live

## 🛠️ Technology Stack

- **Frontend**: Next.js 15, React, TailwindCSS, Framer Motion
- **Backend**: Next.js API Routes, Prisma ORM
- **Database**: SQLite (dev) / PostgreSQL (production)
- **Voice**: OpenAI TTS API
- **Deployment**: Docker, PM2, Nginx
- **Real-time**: WebSocket integration

## 🎮 Live Demo

**Production URL**: http://13.91.60.221:5050

- Play the full game experience
- View live leaderboards  
- Test on mobile devices

## 📋 Deployment Guide

See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) for complete server setup instructions.

### Environment Variables
```bash
# Required
OPENAI_API_KEY=your_openai_api_key
DATABASE_URL=your_database_url
NEXT_PUBLIC_APP_URL=your_domain_url

# Optional
NODE_ENV=production
PORT=5050
```

## 🎯 Perfect For

- **Trade Shows** - Engage booth visitors
- **Training Events** - Test building science knowledge
- **Lead Generation** - Capture qualified prospects  
- **Team Building** - Internal competitions
- **Education** - Interactive learning tool

## 🏆 Features

### Game Engine
- [x] Question progression with difficulty scaling
- [x] Lifeline system (50:50, Phone, Audience)
- [x] Prize money tracking ($100 - $1,000,000)
- [x] Time limits and scoring

### Voice & Audio  
- [x] OpenAI TTS integration
- [x] Game show host personality
- [x] Dynamic commentary
- [x] Mute/unmute controls

### Data & Analytics
- [x] Player registration system
- [x] Real-time leaderboards
- [x] Performance tracking
- [x] Admin dashboard
- [x] Data export capabilities

### Production Ready
- [x] Docker containerization
- [x] PM2 process management
- [x] Nginx reverse proxy
- [x] SSL/HTTPS support
- [x] Environment-based configuration

## 📞 Support

For technical issues or customization requests, create an issue in this repository.

---

**Built with ❤️ for the Building Science Community**

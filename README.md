# Virtual Debating Club Platform

A comprehensive web platform for managing and participating in virtual debates. Built for the RPI Debating Club to facilitate real-time debates, skill development, and community engagement.

## 🎯 Overview

The Virtual Debating Club platform enables debate enthusiasts to participate in structured debates, develop their argumentation skills, and connect with a global community. The platform features real-time debate functionality, user authentication, and a modern, responsive interface.

## ✨ Features

- **Real-time Debates**: Participate in live debates with Socket.io-powered real-time communication
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **User Roles**: Support for USER, MODERATOR, and ADMIN roles
- **Debate Management**: Create, manage, and participate in debates with multiple status states
- **Live Streaming**: Stream debates to multiple platforms simultaneously (YouTube, Facebook, Twitch, Custom RTMP)
- **Engagement Metrics**: Real-time viewer counts, comments, and likes tracking
- **Dark Mode**: Toggle between light and dark themes with persistent preference
- **Modern UI**: Responsive React interface with Tailwind CSS and smooth animations
- **RESTful API**: Clean, well-documented API endpoints
- **Database Integration**: PostgreSQL with Prisma ORM for type-safe database access
- **Docker Support**: Containerized deployment for easy setup and scalability

## 🏗️ Architecture

The project follows a monorepo structure:

```
/
├── api/              # Node.js/Express/TypeScript backend
│   ├── src/          # Source code
│   ├── prisma/       # Database schema and migrations
│   └── Dockerfile    # API container configuration
├── web/              # React/TypeScript/Vite frontend
│   ├── src/          # Source code
│   │   ├── pages/    # Page components
│   │   └── components/ # Reusable components
│   └── Dockerfile    # Web container configuration
├── ops/              # Operations and deployment documentation
│   └── docs/         # Deployment and architecture guides
├── .github/          # GitHub Actions CI/CD workflows
│   └── workflows/    # CI pipeline definitions
├── licenses/         # License files
│   ├── MIT.txt
│   ├── Apache-2.0.txt
│   ├── GPL-3.0.txt
│   └── CUSTOM-TERMS.txt
└── docker-compose.yml # Container orchestration
```

## 🚀 Getting Started

### Prerequisites

- Node.js 20+ ([Download](https://nodejs.org/))
- Docker and Docker Compose ([Download](https://www.docker.com/))
- PostgreSQL 16+ (optional for local development without Docker)

### Live Debate UI (Redesigned)

The platform features a redesigned live debate interface at `/live-debate` with improved visual hierarchy and user experience:

**Key Features:**
- **Centered Current Speaker**: Prominently highlighted with large timer display for immediate focus
- **Strategic Layout**: Timekeeper controls positioned directly below current speaker for quick access
- **Live Streaming Controls**: Integrated controls for multi-platform streaming (YouTube, Facebook, Twitch, RTMP)
- **Real-time Engagement Stats**: Live viewer counts, comments, and likes displayed prominently
- **Interactive Q&A Modal**: Full-screen modal for audience questions with upvoting and filtering
- **Dark Mode Support**: Toggle between light and dark themes with smooth transitions
- **Collapsible Audience Section**: Left rail combines audience count, actions, and view requests in a collapsible panel
- **Horizontal Team & Judges Layout**: Teams displayed side-by-side with judges panel below for better space utilization
- **Compact Streaming Status**: Streamlined display showing all platforms and recording status in one line
- **Enhanced Accessibility**: 
  - Hover tooltips on all interactive controls
  - Improved color contrast (WCAG AA compliant)
  - Semantic HTML landmarks and ARIA labels
  - Clear focus states for keyboard navigation
- **Fully Responsive**: 
  - Desktop (>1024px): Full 3-column layout
  - Tablet (640px-1024px): Adaptive 2-column layout
  - Mobile (<640px): Stacked single-column layout
- **Visual Improvements**:
  - Consistent padding and spacing
  - Subtle gradients and shadows for depth
  - Better typography hierarchy
  - Refined color palette with better contrast
  - Smooth animations for modals and transitions

**Access:**
1. Navigate to `http://localhost:5173/live-debate` (currently uses mock data)
2. The page is accessible without authentication for development purposes

### Quick Start with Docker

1. **Clone the repository**
   ```bash
   git clone https://github.com/mufthakherul/debate.git
   cd debate
   ```

2. **Set up environment variables**
   ```bash
   cp api/.env.example api/.env
   cp web/.env.example web/.env
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations**
   ```bash
   cd api
   npm install
   npx prisma migrate dev
   ```

5. **Access the application**
   - Web interface: http://localhost:5173
   - API: http://localhost:3001
   - API health check: http://localhost:3001/api/health

### Manual Setup (Without Docker)

#### Backend Setup

1. **Navigate to API directory**
   ```bash
   cd api
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update `DATABASE_URL` with your PostgreSQL connection string
   - Set a secure `JWT_SECRET`

4. **Run database migrations**
   ```bash
   npx prisma generate
   npx prisma migrate dev
   ```

5. **Start the API server**
   ```bash
   npm run dev
   ```

#### Frontend Setup

1. **Navigate to web directory**
   ```bash
   cd web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   - Copy `.env.example` to `.env`
   - Update `VITE_API_URL` if needed

4. **Start the development server**
   ```bash
   npm run dev
   ```

## 📚 Documentation

- [Deployment Guide](ops/docs/DEPLOYMENT.md) - Detailed deployment instructions
- [Architecture Overview](ops/docs/ARCHITECTURE.md) - System design and technology stack
- [Streaming Guide](STREAMING.md) - Comprehensive guide to live streaming features

## 🎥 Live Streaming

The platform supports streaming debates to multiple platforms simultaneously. Key features include:

### Supported Platforms
- **YouTube Live** - Stream to YouTube with real-time engagement
- **Facebook Live** - Broadcast to Facebook with comments and reactions
- **Twitch** - Stream to Twitch with interactive chat
- **Custom RTMP** - Connect to any RTMP-compatible service

### Quick Start
1. Navigate to a live debate at `/live-debate`
2. Click "Start Stream" button (requires Moderator/Admin role)
3. Select platforms and enter stream keys
4. Monitor live engagement statistics in real-time

### Key Features
- ✅ Multi-platform simultaneous streaming
- ✅ Real-time viewer count and engagement metrics
- ✅ Platform-specific status indicators
- ✅ Secure stream key validation
- ✅ Error handling and automatic recovery
- ✅ Historical statistics tracking

For detailed information, see the [Streaming Guide](STREAMING.md).

### API Endpoints
```
GET  /api/streaming/status/:debateId  - Get streaming status
GET  /api/streaming/stats/:debateId   - Get engagement metrics
POST /api/streaming/start             - Start streaming
POST /api/streaming/stop              - Stop streaming
POST /api/streaming/stats             - Update statistics
```

## 🛠️ Development

### API Development

```bash
cd api
npm run dev          # Start development server
npm run build        # Build for production
npm run prisma:studio # Open Prisma Studio
```

### Web Development

```bash
cd web
npm run dev          # Start development server
npm run build        # Build for production
npm run preview      # Preview production build
npm run lint         # Run ESLint
```

### Database Management

```bash
cd api
npx prisma migrate dev    # Create and apply migration
npx prisma studio         # Open database GUI
npx prisma generate       # Generate Prisma client
```

## 🧪 Testing

Run the test suite:

```bash
# API tests
cd api
npm test

# Web tests
cd web
npm test
```

## 📋 API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login

### Debates
- `GET /api/debates` - List debates with filtering
- `GET /api/debates/:id` - Get debate details
- `POST /api/debates` - Create new debate (Moderator/Admin)
- `PUT /api/debates/:id` - Update debate (Moderator/Admin)
- `DELETE /api/debates/:id` - Delete debate (Moderator/Admin)

### Streaming
- `GET /api/streaming/status/:debateId` - Get streaming status
- `GET /api/streaming/stats/:debateId` - Get engagement statistics
- `POST /api/streaming/start` - Start multi-platform stream (Moderator/Admin)
- `POST /api/streaming/stop` - Stop stream (Moderator/Admin)
- `POST /api/streaming/stats` - Update statistics (Internal)

### Health Check
- `GET /api/health` - Check API status

## 🔐 Security

- JWT-based authentication with 7-day token expiration
- Bcrypt password hashing
- CORS protection
- Helmet.js security headers
- Rate limiting on API endpoints

## 🚀 Deployment to Vercel

This project can be deployed to Vercel with both the API and Web app in a single project.

**📖 [Read the Complete Vercel Deployment Guide](VERCEL_DEPLOYMENT.md)**

### Quick Overview

1. **Connect your repository to Vercel**
2. **Set up environment variables** (DATABASE_URL, JWT_SECRET, etc.)
3. **Deploy** - Vercel will automatically build and deploy both API and Web
4. **Run database migrations** using Vercel CLI or locally

For detailed step-by-step instructions, troubleshooting, and best practices, see the [Vercel Deployment Guide](VERCEL_DEPLOYMENT.md).

## 🗺️ Roadmap

### Phase 1: Foundation (Current)
- [x] Initial project scaffold
- [x] User authentication system
- [x] Basic debate models
- [x] Real-time communication setup
- [x] Docker containerization

### Phase 2: Core Features (Q1 2025)
- [ ] Debate creation and management UI
- [x] Live debate room functionality (Redesigned UI at `/live-debate`)
- [ ] Real-time messaging and notifications
- [ ] User profile management
- [ ] Debate history and recordings

### Phase 3: Enhanced Features (Q2 2025)
- [ ] Video/audio integration
- [ ] Advanced moderation tools
- [ ] Debate analytics and scoring
- [ ] Tournament management
- [ ] Mobile application

### Phase 4: Community & Growth (Q3 2025)
- [ ] Social features (follow, share, comment)
- [ ] Debate templates and formats
- [ ] Integration with debate organizations
- [ ] Public API for third-party integrations
- [ ] Performance optimizations

## 📄 Licensing

This project uses a composite licensing structure to accommodate different components and use cases:

- **Core platform code**: MIT License (see [licenses/MIT.txt](licenses/MIT.txt))
- **Shared utilities**: Apache License 2.0 (see [licenses/Apache-2.0.txt](licenses/Apache-2.0.txt))
- **Certain extensions**: GNU General Public License v3.0 (see [licenses/GPL-3.0.txt](licenses/GPL-3.0.txt))
- **Custom components**: Custom Terms (see [licenses/CUSTOM-TERMS.txt](licenses/CUSTOM-TERMS.txt))

Please refer to the [LICENSE](LICENSE) file and individual license files in the `licenses/` directory for complete terms. Unless otherwise specified in file headers, the default license is MIT.

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📞 Support

For questions, issues, or feature requests:
- Open an issue on GitHub
- Contact the maintainers via GitHub

## 👥 Authors

- RPI Debating Club Team

## 🙏 Acknowledgments

- Built with React, Express, Prisma, and Socket.io
- Inspired by the need for accessible virtual debate platforms
- Special thanks to the RPI Debating Club community

---

**Note**: This is an educational project for the RPI Debating Club. For production deployment, ensure all security best practices are followed and environment variables are properly configured. 

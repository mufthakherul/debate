# Virtual Debating Club Platform

A comprehensive web platform for managing and participating in virtual debates. Built for the RPI Debating Club to facilitate real-time debates, skill development, and community engagement.

## 🎯 Overview

The Virtual Debating Club platform enables debate enthusiasts to participate in structured debates, develop their argumentation skills, and connect with a global community. The platform features real-time debate functionality, user authentication, and a modern, responsive interface.

## ✨ Features

- **Real-time Debates**: Participate in live debates with Socket.io-powered real-time communication
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **User Roles**: Support for USER, MODERATOR, and ADMIN roles
- **Debate Management**: Create, manage, and participate in debates with multiple status states
- **Modern UI**: Responsive React interface with Tailwind CSS
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

### Health Check
- `GET /api/health` - Check API status

## 🔐 Security

- JWT-based authentication with 7-day token expiration
- Bcrypt password hashing
- CORS protection
- Helmet.js security headers
- Rate limiting on API endpoints

## 🚀 Deployment to Vercel

### Prerequisites
- A [Vercel account](https://vercel.com/signup)
- GitHub repository connected to Vercel

### Deploy Steps

1. **Connect your repository to Vercel**
   - Go to [Vercel Dashboard](https://vercel.com/dashboard)
   - Click "Add New Project"
   - Import your GitHub repository

2. **Configure the project**
   - Framework Preset: **Vite**
   - Root Directory: **web**
   - Build Command: `npm run build`
   - Output Directory: `dist`

3. **Environment Variables**
   Set the following environment variables in Vercel project settings:
   ```
   VITE_API_URL=https://your-api-url.com
   ```

4. **Deploy**
   - Click "Deploy"
   - Vercel will automatically build and deploy your application
   - Your site will be available at `https://your-project.vercel.app`

### Automatic Deployments
- **Production**: Automatically deploys from the `main` branch
- **Preview**: Automatically creates preview deployments for pull requests

### Custom Domain (Optional)
1. Go to your project settings in Vercel
2. Navigate to "Domains"
3. Add your custom domain
4. Follow DNS configuration instructions

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

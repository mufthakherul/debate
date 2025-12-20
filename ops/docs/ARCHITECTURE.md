# Architecture Overview

## System Design

### High-Level Architecture

```
┌─────────────┐         ┌─────────────┐         ┌─────────────┐
│             │         │             │         │             │
│  React Web  │────────▶│  Express    │────────▶│ PostgreSQL  │
│  (Vite)     │         │  API        │         │  Database   │
│             │◀────────│  (Node.js)  │         │             │
└─────────────┘         └─────────────┘         └─────────────┘
                              │
                              │ Socket.io
                              ▼
                        ┌─────────────┐
                        │  Real-time  │
                        │  Events     │
                        └─────────────┘
```

### Technology Stack

#### Frontend (/web)
- **Framework**: React 18
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Language**: TypeScript
- **Routing**: React Router v6
- **Real-time**: Socket.io Client

#### Backend (/api)
- **Framework**: Express.js
- **Runtime**: Node.js 20
- **Language**: TypeScript
- **ORM**: Prisma
- **Database**: PostgreSQL 16
- **Authentication**: JWT + bcrypt
- **Real-time**: Socket.io Server

#### Infrastructure
- **Containerization**: Docker
- **Orchestration**: Docker Compose
- **CI/CD**: GitHub Actions

## Data Models

### User Model
```typescript
{
  id: UUID
  email: String (unique)
  username: String (unique)
  password: String (hashed)
  role: Enum(USER, MODERATOR, ADMIN)
  createdAt: DateTime
  updatedAt: DateTime
}
```

### Debate Model
```typescript
{
  id: UUID
  title: String
  description: String?
  topic: String
  status: Enum(DRAFT, OPEN, IN_PROGRESS, COMPLETED, CANCELLED)
  creatorId: UUID (references User)
  startTime: DateTime?
  endTime: DateTime?
  createdAt: DateTime
  updatedAt: DateTime
}
```

## API Endpoints

### Authentication
- `POST /api/auth/register` - User registration
- `POST /api/auth/login` - User login

### Health Check
- `GET /api/health` - Service health status

## Real-time Events

### Socket.io Events
- `connection` - Client connected
- `join-debate` - Join debate room
- `leave-debate` - Leave debate room
- `disconnect` - Client disconnected

## Security Considerations

1. **Authentication**: JWT tokens with 7-day expiration
2. **Password**: Bcrypt hashing with salt rounds
3. **CORS**: Configured for frontend origin
4. **Headers**: Helmet.js for security headers
5. **Rate Limiting**: Express rate limiter

## Scalability

### Current Architecture
- Monolithic structure suitable for initial deployment
- Horizontal scaling possible via load balancer

### Future Improvements
- Microservices architecture
- Message queue (RabbitMQ/Redis)
- Caching layer (Redis)
- CDN for static assets

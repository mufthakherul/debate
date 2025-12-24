# API Structure for Vercel Deployment

This directory contains the Vercel serverless function entry point for the API.

## Structure

```
api/
├── api/              # Vercel serverless function entry point
│   └── index.ts      # Exports the Express app for Vercel
├── src/              # API source code
│   ├── app.ts        # Express app configuration (serverless-ready)
│   ├── index.ts      # Local development server
│   └── ...           # Other API files
└── ...
```

## How It Works

### Local Development (`src/index.ts`)
- Creates an HTTP server with Socket.io
- Starts the server on the configured port
- Used when running `npm run dev`

### Vercel Deployment (`api/index.ts`)
- Exports the Express app without starting a server
- Vercel handles the server lifecycle
- Routes requests through serverless functions

### Shared App Logic (`src/app.ts`)
- Contains all Express middleware and routes
- Used by both local and serverless deployments
- Does not start a server (just exports the app)

## Important Notes

1. **Socket.io Limitation**: Vercel serverless functions don't support WebSocket connections. Socket.io features work locally but not in Vercel deployment.

2. **Cold Starts**: First request after inactivity may be slower due to serverless cold starts.

3. **Stateless**: Each request may hit a different serverless instance. Don't rely on in-memory state.

## Building

The TypeScript compiler builds both `src/` and `api/` directories:

```bash
npm run build
```

Output goes to `dist/`:
- `dist/src/` - Local development files
- `dist/api/` - Vercel serverless function

## Testing Locally

```bash
npm run dev
```

This uses `src/index.ts` which includes Socket.io and a full HTTP server.

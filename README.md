# Smartly.io Demo Application

This is a demo application showcasing key technologies used in Smartly.io's ad campaign management system. The application demonstrates the use of:

- Node.js/TypeScript backend
- React frontend
- Redis for caching
- RabbitMQ for message queuing
- WebSocket for real-time updates
- REST API endpoints
- CORS implementation

## Prerequisites

Before running the application, make sure you have the following installed:

1. Node.js (v14 or higher)
2. Redis (for caching)
3. RabbitMQ (for message queuing)

## Setup

1. Install Redis:

   - macOS: `brew install redis`
   - Start Redis: `brew services start redis`

2. Install RabbitMQ:

   - macOS: `brew install rabbitmq`
   - Start RabbitMQ: `brew services start rabbitmq`

3. Install dependencies:
   ```bash
   npm run install:all
   ```

## Running the Application

1. Start the backend server:

   ```bash
   npm run start:backend
   ```

2. Start the frontend development server:
   ```bash
   npm run start:frontend
   ```

The application will be available at:

- Frontend: http://localhost:3000
- Backend API: http://localhost:4000

## Features

- Create and manage ad campaigns
- Real-time campaign updates using WebSocket
- Campaign metrics tracking
- Caching with Redis
- Message queuing with RabbitMQ

## Project Structure

```
.
├── backend/
│   ├── src/
│   │   ├── services/
│   │   │   ├── redis.ts
│   │   │   ├── rabbitmq.ts
│   │   │   └── websocket.ts
│   │   ├── routes/
│   │   │   └── campaigns.ts
│   │   └── index.ts
│   ├── package.json
│   └── tsconfig.json
├── frontend/
│   ├── src/
│   │   └── App.tsx
│   └── package.json
└── package.json
```

## API Endpoints

- GET /api/campaigns - Get all campaigns
- GET /api/campaigns/:id - Get campaign by ID
- POST /api/campaigns - Create new campaign
- PUT /api/campaigns/:id - Update campaign

## WebSocket Events

- campaign_update - Real-time campaign updates
- analytics_update - Real-time analytics updates

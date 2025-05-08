# FitSync - Exercise Form Analysis

A real-time exercise form analysis application that uses pose estimation to compare user form with reference exercises.

## Project Structure

```
fit-sync/
├── backend/           # Node.js/Express backend
│   ├── src/          # TypeScript source
│   └── python/       # Python pose similarity service
├── frontend/         # React/TypeScript frontend
└── package.json      # Root package.json for managing all services
```

## Prerequisites

- Node.js (v18 or higher)
- Python 3.8 or higher
- npm or yarn

## Setup

1. Install all dependencies:
```bash
npm run install:all
```

2. Start the development servers:
```bash
npm run dev
```

This will start:
- Frontend on http://localhost:5173
- Backend on http://localhost:3000

## Development

- Frontend development: `npm run dev:frontend`
- Backend development: `npm run dev:backend`
- Run tests: `npm run test`

## Building for Production

```bash
npm run build
```

## Environment Variables

Create a `.env` file in the root directory:

```env
# Frontend
VITE_API_URL=http://localhost:3000

# Backend
PORT=3000
```

## Technologies Used

- Frontend:
  - React
  - TypeScript
  - Vite
  - MediaPipe Pose
  - TailwindCSS

- Backend:
  - Node.js
  - Express
  - TypeScript
  - Python (for pose similarity calculations)
  - NumPy

## License

MIT

# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a medical diagnosis and patient management system with Adjusted RW (Relative Weight) calculations for DRG (Diagnosis-Related Groups) optimization. The system consists of:

- **Backend API**: Hono framework with Bun runtime, PostgreSQL database with Drizzle ORM
- **Frontend Web**: Remix framework with React, TypeScript, Tailwind CSS, Radix UI components

## Development Commands

### Backend API (in `/api` directory)
```bash
# Install dependencies
bun install

# Development server (hot reload)
bun run dev

# Database operations
bun run db:generate     # Generate Drizzle migrations
bun run db:migrate      # Run database migrations
bun run db:push         # Push schema changes to database
```

### Frontend Web (in `/web` directory)
```bash
# Install dependencies
npm install

# Development server
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting and type checking
npm run lint
npm run typecheck
```

## Architecture Overview

### Backend Architecture (`/api`)
- **Framework**: Hono with Bun runtime
- **Database**: PostgreSQL with Drizzle ORM
- **Authentication**: JWT with bcryptjs
- **Key Services**:
  - `AdjRwManager`: Core Adjusted RW calculation engine
  - `OptimizationService`: Combination optimization algorithms
  - DRG calculation with PCL scoring system
- **API Routes**: `/v2/adjrw` for optimized Adjusted RW calculations

### Frontend Architecture (`/web`)
- **Framework**: Remix with Vite
- **State Management**: Zustand stores
- **UI Components**: Radix UI primitives with Tailwind CSS
- **Key Features**:
  - Patient information management
  - ICD-10/ICD-9 code suggestion and search
  - DRG ranking interface with drag-and-drop
  - PDF report generation with jsPDF
  - Real-time AdjRw calculations

### Core Domain Logic

**Adjusted RW Calculation Process**:
1. Input ICD-10 diagnosis codes + patient demographics
2. Generate all possible PDx/SDx combinations (max 13 codes: 1 PDx + 12 SDx)
3. For each combination:
   - Calculate 4-digit DRG based on diagnoses
   - Compute PCL (Patient Complexity Level) score
   - Determine final 5-digit DRG
   - Calculate Adjusted RW using length of stay and DRG parameters
4. Return combination with highest Adjusted RW value

**Key Data Flow**:
- Patient Info → ICD Codes → API Optimization → Best PDx/SDx Combination → Adjusted RW Result

## Important File Locations

### Backend (`/api/src`)
- `routes/v2.ts`: Main AdjRw calculation endpoint
- `services/adjRwManager.service.ts`: Core AdjRw calculation logic
- `services/optimization.service.ts`: Combination optimization algorithms
- `utils/db/schema.ts`: Drizzle database schema
- `utils/db/migrations/`: Database migration files

### Frontend (`/web/app`)
- `routes/_index.tsx`: Main application route
- `components/patient-form.tsx`: Patient information input
- `components/patient-information.tsx`: Patient data display
- `components/ranking-interface.tsx`: DRG ranking with drag-and-drop
- `hooks/store/useDiagnosisStore.ts`: Global diagnosis state management
- `libs/adjrw-calculator.ts`: Frontend AdjRw utilities
- `libs/optimizer.ts`: Optimization algorithms
- `libs/types.ts`: TypeScript type definitions

## Development Guidelines

### Database Changes
1. Modify schema in `api/src/utils/db/schema.ts`
2. Run `bun run db:generate` to create migration
3. Run `bun run db:migrate` to apply changes

### API Development
- Use Zod schemas for request validation (see `v2.ts` examples)
- Follow existing service layer pattern
- Include proper error handling and logging

### Frontend Development
- Use Radix UI components for accessibility
- Follow existing component patterns in `/components`
- Manage global state with Zustand stores
- Use TypeScript interfaces from `libs/types.ts`

### Testing AdjRw Calculations
Use the `/v2/adjrw-old` endpoint for debugging calculation steps with detailed console logs.

## Docker Deployment

### Production Deployment with Docker Compose

The project includes production-ready Docker configuration:

```bash
# Start all services (database, api, web)
docker-compose up -d

# Start with nginx reverse proxy
docker-compose --profile with-nginx up -d

# View logs
docker-compose logs -f api
docker-compose logs -f web

# Stop services
docker-compose down
```

### Environment Variables for Production
Create a `.env` file in the root directory:

```env
POSTGRES_PASSWORD=your_secure_password
DATABASE_URL=postgresql://postgres:your_secure_password@postgres:5432/acc_nia_db
API_BASE_URL=http://api:3000
NODE_ENV=production
```

### Docker Configuration Files
- `api/Dockerfile`: Multi-stage build for production API
- `web/Dockerfile`: Multi-stage build for production web app
- `docker-compose.yml`: Complete orchestration with PostgreSQL
- `.dockerignore` files: Optimized for production builds

### Docker Build Commands

```bash
# Build individual services
docker build -t acc-nia-api ./api
docker build -t acc-nia-web ./web

# Build with docker-compose
docker-compose build
```

### Service Ports
- **Web Application**: http://localhost:3000
- **API**: http://localhost:3001
- **PostgreSQL**: localhost:5432
- **Nginx (optional)**: http://localhost:80

## Environment Setup

### Local Development
- **Node.js**: >=20.0.0 required
- **Bun**: Latest version for backend
- **PostgreSQL**: Database must be running locally
- Environment variables needed for database connection

### Production Deployment
- **Docker**: Docker Engine and Docker Compose
- **PostgreSQL**: Managed via Docker container
- Environment variables configured for production

## Key Dependencies

### Backend
- `hono`: Web framework
- `drizzle-orm`: Database ORM
- `zod`: Schema validation
- `bcryptjs`: Password hashing

### Frontend
- `remix`: Full-stack framework
- `@radix-ui/*`: UI component library
- `zustand`: State management
- `recharts`: Charting library
- `jspdf`: PDF generation
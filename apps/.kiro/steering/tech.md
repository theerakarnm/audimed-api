# Technology Stack

## Architecture
- **Monorepo structure** with separate `api` and `web` directories
- **API**: Hono.js backend with TypeScript
- **Frontend**: Remix.run with React and TypeScript
- **Database**: PostgreSQL with Drizzle ORM
- **Runtime**: Bun for API, Node.js for web

## Backend (API)
- **Framework**: Hono.js v4.7+ - lightweight web framework
- **Database**: Drizzle ORM with PostgreSQL
- **Authentication**: bcryptjs for password hashing, JWT tokens
- **Validation**: Zod schemas with Hono validator
- **Rate limiting**: hono-rate-limiter
- **Security**: CORS, secure headers middleware

## Frontend (Web)
- **Framework**: Remix.run v2.16+ with Vite
- **UI Library**: Radix UI components with Tailwind CSS
- **State Management**: Zustand for client state
- **Forms**: React Hook Form with Zod resolvers
- **Styling**: Tailwind CSS v3.4+ with custom design system
- **Icons**: Lucide React
- **Charts**: Recharts for data visualization
- **PDF Export**: jsPDF with autotable

## Development Tools
- **TypeScript**: Strict mode enabled across both projects
- **Linting**: ESLint with TypeScript rules
- **Package Manager**: Bun for API, npm/bun for web
- **Database Migrations**: Drizzle Kit

## Common Commands

### API Development
```bash
cd api
bun install          # Install dependencies
bun run dev          # Start development server (port 8000)
bun run db:generate  # Generate database migrations
bun run db:migrate   # Run database migrations
bun run db:push      # Push schema changes to database
```

### Web Development
```bash
cd web
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run lint         # Run ESLint
npm run typecheck    # Run TypeScript compiler check
```

## Environment Setup
- API requires `.env` file with `DATABASE_URL` and other config
- Web uses Remix conventions for environment variables
- CORS configured for localhost:3000 and localhost:5173
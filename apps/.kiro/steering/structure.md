# Project Structure

## Root Level
```
├── api/          # Backend API (Hono.js + TypeScript)
├── web/          # Frontend web app (Remix + React)
├── CLAUDE.md     # AI model documentation
└── GEMINI.md     # AI model documentation
```

## API Structure (`api/`)
```
api/
├── src/
│   ├── auth/           # Authentication module
│   │   ├── routes.ts   # Auth endpoints
│   │   ├── schema.ts   # Zod validation schemas
│   │   ├── service.ts  # Auth business logic
│   │   ├── utils/      # bcrypt, JWT utilities
│   │   └── tests/      # Auth-related tests
│   ├── config/         # Environment and app configuration
│   ├── routes/         # API route definitions
│   ├── schemas/        # Shared Zod schemas
│   ├── services/       # Business logic services
│   │   ├── adjRwManager.service.ts  # DRG relative weight calculations
│   │   ├── deepseek.service.ts      # AI integration
│   │   ├── icd.service.ts           # ICD code management
│   │   └── optimization.service.ts  # Medical coding optimization
│   ├── types/          # TypeScript type definitions
│   ├── utils/          # Shared utilities
│   │   └── db/         # Database configuration and schema
│   ├── asset/          # Static data files (CSV, JSON)
│   │   └── adjrw/      # DRG adjustment and relative weight data
│   └── script/         # Database seeding and utility scripts
├── dist/               # Compiled output
├── Dockerfile          # Container configuration
├── drizzle.config.ts   # Database ORM configuration
└── package.json        # Dependencies and scripts
```

## Web Structure (`web/`)
```
web/
├── app/
│   ├── components/     # React components
│   │   ├── ui/         # Radix UI component library
│   │   ├── diagnosis-input.tsx
│   │   ├── patient-form.tsx
│   │   ├── ranking-interface.tsx
│   │   └── ...         # Feature-specific components
│   ├── hooks/          # Custom React hooks
│   │   └── store/      # Zustand state management
│   ├── libs/           # Utility libraries
│   │   ├── adjrw-calculator.ts  # DRG calculations
│   │   ├── optimizer.ts         # Medical coding optimization
│   │   ├── types.ts            # TypeScript definitions
│   │   └── utils.ts            # General utilities
│   ├── routes/         # Remix route components
│   ├── root.tsx        # App root component
│   └── tailwind.css    # Global styles
├── public/             # Static assets
│   └── images/         # Image assets
├── build/              # Production build output
├── vite.config.ts      # Vite bundler configuration
└── package.json        # Dependencies and scripts
```

## Key Conventions

### File Naming
- **Components**: PascalCase for React components (`PatientForm.tsx`)
- **Utilities**: camelCase for utility files (`adjrw-calculator.ts`)
- **Routes**: Remix file-based routing conventions
- **Services**: `.service.ts` suffix for business logic modules
- **Schemas**: `.schema.ts` suffix for validation schemas

### Import Patterns
- **Web**: Uses `~/*` path alias for app directory imports
- **API**: Relative imports from `src/` directory
- **Shared types**: Defined in respective `types/` directories

### Database
- **Schema**: Defined in `api/src/utils/db/schema.ts`
- **Migrations**: Auto-generated in `api/src/utils/db/migrations/`
- **Common columns**: `createdAt`, `updatedAt`, `deletedAt` pattern

### Component Organization
- **UI Components**: Reusable Radix UI components in `web/app/components/ui/`
- **Feature Components**: Domain-specific components in `web/app/components/`
- **Hooks**: Custom hooks in `web/app/hooks/` with store-specific hooks in subdirectory
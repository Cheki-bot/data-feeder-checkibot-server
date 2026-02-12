# Agent Guidelines - Data Feeder Server

## Build & Quality Commands

```bash
# Development
npm run dev          # Start dev server with hot reload (nodemon)

# Build & Production
npm run build        # Compile TypeScript to dist/
npm start            # Run production server (NODE_ENV=production)

# Code Quality
npm run lint         # Check ESLint rules
npm run lint:fix     # Auto-fix ESLint issues
npm run format       # Format code with Prettier
npm run format:check # Check formatting without changes

# Testing
# Note: No test framework is currently configured in this project.
```

## Code Style Guidelines

### TypeScript Configuration

- Strict mode enabled; explicit types required everywhere
- ES2020 target, CommonJS modules (`"type": "commonjs"`)
- Path alias: `@/*` maps to `./src/*` (e.g., `import { Role } from '@/constants/roles'`)
- `no-explicit-any`: Use proper types or `unknown` instead
- `explicit-function-return-type`: All functions must declare return types
- `no-inferrable-types`: Avoid explicit types when auto-inferred

### Import Organization

```typescript
// Standard import order: external libraries -> internal modules -> relative imports
import express, { Request, Response } from 'express';
import { Db, ObjectId } from 'mongodb';
import { Role } from '@/constants/roles';
import * as AuthService from './auth.service';
```

### Naming Conventions

| Element           | Convention                          | Examples                                       |
| ----------------- | ----------------------------------- | ---------------------------------------------- |
| Controllers       | camelCase, async                    | `register`, `login`, `deactivateUser`          |
| Services          | camelCase, async, descriptive verbs | `registerUser`, `loginUser`, `changeUserRole`  |
| Models/Interfaces | PascalCase, specific suffixes       | `UserDocument`, `LoginResponse`, `AuthRequest` |
| Constants         | UPPER_SNAKE_CASE                    | `ROLES`, `DEFAULT_ROLE`, `MAX_LOGIN_ATTEMPTS`  |
| Timestamps        | snake_case with `_at` suffix        | `created_at`, `updated_at`                     |
| Password fields   | snake_case with `_hash` suffix      | `password_hash`                                |

### Formatting (Prettier)

- Single quotes (`'`)
- Trailing commas enabled (`all`)
- Print width: 100 characters
- Semicolons: always (`true`)
- Arrow parens: avoid (`(x) => x` not `(x) => (x)`)

### Error Handling Pattern

**Services:** Throw `Error` with descriptive message strings

```typescript
if (existingUser) throw new Error('EMAIL_ALREADY_EXISTS');
```

**Controllers:** Catch errors and return structured JSON responses

```typescript
try {
  // Operation
  res.status(201).json({ message: 'Success', ok: true, status: 201, data: result });
} catch (error) {
  if (error instanceof Error && error.message === 'EMAIL_ALREADY_EXISTS') {
    return res.status(400).json({ message: 'Email exists', ok: false, status: 400 });
  }
  res.status(500).json({ message: 'Server error', ok: false, status: 500 });
}
```

Standard response shape: `{ message: string, ok: boolean, status: number, data?: any, error?: any }`

### Module Architecture

Each feature module follows this structure:

```
src/modules/[feature-name]/
├── [feature-name].controller.ts  # HTTP request/response handlers
├── [feature-name].service.ts     # Business logic (no Express types)
├── [feature-name].routes.ts      # Route definitions
└── [feature-name].model.ts       # Data interfaces & model factories
```

Key principles:

- Controllers: Handle HTTP concerns, validation via `validationResult()`, responses
- Services: Pure business logic, receive `Db` instance, throw Errors, return typed data
- Routes: Map HTTP methods to controllers, apply middleware (auth, RBAC)
- Models: Define interfaces and factory functions for documents

### Database & Validation

- MongoDB native driver: `db.collection<T>('name')`
- ObjectId validation before database operations: `ObjectId.isValid(id)`
- Use `projection` to exclude sensitive fields: `{ projection: { password_hash: 0 } }`
- Validation schemas in `/validators/` using `express-validator`

### Security & Authentication

- JWT tokens stored in `Authorization: Bearer <token>` header
- Role-based access via `requireRole()` middleware in routes
- Passwords hashed with bcrypt (12 rounds)
- Email normalization: `email.toLowerCase().trim()`

### Unused Parameters

Prefix with `_` to avoid lint errors: `_req: Request`

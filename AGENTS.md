# Data Feeder Server - Project Guide

## Project Overview

The Data Feeder Server is a RESTful API built with Express.js, TypeScript, and MongoDB. It provides a modular architecture for managing user authentication, roles, and data feeds with comprehensive security features including JWT authentication, password hashing, and role-based access control.

### Key Technologies

- **Runtime**: Node.js >= 18
- **Language**: TypeScript (ES2020 target)
- **Framework**: Express.js
- **Database**: MongoDB
- **Authentication**: JWT (HS256 algorithm)
- **Password Hashing**: bcrypt (12 rounds)
- **Validation**: express-validator
- **Documentation**: Swagger/OpenAPI
- **Code Quality**: ESLint, Prettier, Husky

### High-Level Architecture

The project follows a **modular architecture** with feature-based organization. Each module contains its own controller, service, routes, and model files, promoting separation of concerns and maintainability.

---

## Getting Started

### Prerequisites

- Node.js >= 18
- MongoDB (local or MongoDB Atlas)
- npm or yarn package manager

### Installation

1. **Clone the repository**

   ```bash
   git clone <repository-url>
   cd data-feeder-server
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Configure environment variables**

   ```bash
   cp .env.example .env
   ```

4. **Edit `.env` file** with your configuration:

   ```env
   NODE_ENV=development
   PORT=3000
   MONGO_URI=mongodb://localhost:27017
   MONGO_DB_NAME=checkibot_db
   ADMIN_EMAIL=admin@checkibot.com
   ADMIN_PASSWORD=your_secure_admin_password
   JWT_SECRET=your_secret_jwt_key_change_in_production
   ```

5. **Generate a strong JWT secret** (for production):

   ```bash
   node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

### Basic Usage

**Health Check:**

```bash
curl http://localhost:3000/api/health
```

**Swagger Documentation:**
Visit `http://localhost:3000/docs` to view API documentation.

### Running Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

---

## Project Structure

```
data-feeder-server/
├── .continue/
│   └── rules/
│       └── CONTINUE.md          # This file
├── src/
│   ├── app.ts                    # Express app setup (middleware, routes)
│   ├── server.ts                 # Server startup & DB initialization
│   ├── config/
│   │   ├── index.ts              # Environment configuration
│   │   ├── database.ts          # MongoDB connection & setup
│   │   └── swagger.ts           # Swagger/OpenAPI documentation
│   ├── constants/
│   │   └── roles.ts            # User role constants
│   ├── middleware/
│   │   ├── auth.ts              # JWT authentication middleware
│   │   └── errorHandler.js     # Global error handling
│   ├── modules/                # Feature-based modules
│   │   ├── auth/               # Authentication module
│   │   │   ├── auth.controller.ts
│   │   │   ├── auth.service.ts
│   │   │   ├── auth.routes.ts
│   │   │   └── user.model.ts
│   │   ├── candidates/         # Candidates module
│   │   │   ├── candidates.controller.ts
│   │   │   ├── candidates.service.ts
│   │   │   ├── candidates.routes.ts
│   │   │   └── candidates.model.ts
│   │   ├── calendars/          # Calendars module
│   │   ├── calendar-events/     # Calendar events module
│   │   ├── political-parties/  # Political parties module
│   │   ├── questions-answers/  # Questions and answers module
│   │   └── verifications/      # Verifications module
│   ├── routes/
│   │   └── index.ts             # Centralized route registration
│   ├── types/
│   │   └── authInterfaces.ts  # TypeScript interfaces
│   ├── utils/
│   │   └── auth.ts             # Password hashing & JWT utilities
│   └── validators/           # Request validation schemas
├── .env.example                 # Environment variables template
├── .gitignore
├── .husky/                     # Git hooks
├── eslint.config.mjs          # ESLint configuration
├── package.json
├── prettierrc                  # Prettier configuration
├── tsconfig.json              # TypeScript configuration
└── README.md                  # Project documentation
```

### Key Files and Their Roles

| File                     | Purpose                                                                   |
| ------------------------ | ------------------------------------------------------------------------- |
| `src/server.ts`          | Server entry point, initializes MongoDB connection and starts HTTP server |
| `src/app.ts`             | Express app configuration, middleware setup, route mounting               |
| `src/config/database.ts` | MongoDB connection management, index creation, default admin setup        |
| `src/middleware/auth.ts` | JWT authentication, role-based access control middleware                  |
| `src/utils/auth.ts`      | Password hashing (bcrypt), JWT token generation/verification              |
| `src/modules/*/`         | Feature modules with controller, service, routes, and model separation    |
| `src/routes/index.ts`    | Centralized route registration for all modules                            |
| `src/config/swagger.ts`  | API documentation generation                                              |

---

## Development Workflow

### Coding Standards

- **TypeScript**: Strict mode enabled, ES2020 target
- **Code Formatting**: Prettier (configured in `.prettierrc`)
- **Linting**: ESLint with flat config (configured in `eslint.config.mjs`)
- **Git Hooks**: Husky with lint-staged for pre-commit checks

### Editor Configuration (Recommended)

Enable format on save and ESLint fixes in VS Code:

```json
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

### Build and Deployment

**Build the project:**

```bash
npm run build
```

**Start in production:**

```bash
npm start
```

**Lint and format:**

```bash
# Check linting issues
npm run lint

# Auto-fix linting issues
npm run lint:fix

# Check formatting
npm run format:check

# Format all files
npm run format
```

### Git Workflow

- **Pre-commit**: Automatically runs `lint-staged` to check and format staged files
- **Commit messages**: Use conventional commit format (e.g., `feat: add new endpoint`)

### Testing Approach

The project uses Jest for testing. Tests should be written for:

- Controller logic
- Service business logic
- API endpoints (integration tests)
- Edge cases and error handling

---

## Key Concepts

### User Roles

| Role    | Permissions                                                              |
| ------- | ------------------------------------------------------------------------ |
| `admin` | Full access - can create, deactivate, activate, and delete user accounts |
| `user`  | Standard access - can register, login, and use protected endpoints       |

### Authentication Flow

1. **Registration**: User registers with email, password, and optional role
2. **Password Hashing**: Password is hashed with bcrypt (12 rounds) before storage
3. **Login**: User provides credentials → password verified → JWT token generated
4. **Token Usage**: JWT token included in Authorization header for protected routes
5. **Token Expiration**: 24-hour expiration with HS256 algorithm

### Account Lockout

- After 5 failed login attempts, account is locked for 60 minutes
- Lockout time displayed in Bolivia timezone (UTC-4)
- Auto-unlock after 60 minutes
- Successful login resets failed attempts counter

### Database Indexes

- Unique index on `email` field
- Unique index on `username` field
- These constraints are enforced at database level

### Middleware Stack

1. `cors()` - Cross-Origin Resource Sharing
2. `express.json()` - JSON body parsing
3. `morgan('dev')` - HTTP request logging
4. `authenticateToken()` - JWT verification
5. `requireRole()` - Role-based access control
6. `notFoundHandler()` - 404 error handling
7. `errorHandler()` - Global error handling

---

## Common Tasks

### Adding a New Module

1. **Create module directory**: `src/modules/new-module/`
2. **Add files**:
   - `new-module.controller.ts` - Request handlers
   - `new-module.service.ts` - Business logic
   - `new-module.routes.ts` - Route definitions
   - `new-module.model.ts` - Data models
3. **Register routes** in `src/routes/index.ts`
4. **Add validation schemas** in `src/validators/` if needed
5. **Update Swagger** in `src/config/swagger.ts` if needed

### Creating a New API Endpoint

1. **Define route** in module's `*.routes.ts` file
2. **Implement controller** with request/response handling
3. **Add service** for business logic
4. **Apply middleware** (authentication, role checks)
5. **Add validation** using express-validator
6. **Update Swagger** documentation

### Generating JWT Secret

```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

### Testing Authentication

```bash
# Register a user
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123","username":"testuser"}'

# Login and get token
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"password123"}'

# Use token in header
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

### Database Operations

**Connect to MongoDB:**

```bash
mongosh mongodb://localhost:27017/checkibot_db
```

**Check indexes:**

```javascript
db.users.getIndexes();
```

---

## Troubleshooting

### Common Issues

**Issue: "MONGO_URI is not defined"**

- **Solution**: Ensure `.env` file exists and contains `MONGO_URI` and `MONGO_DB_NAME`

**Issue: "JWT_SECRET is not defined"**

- **Solution**: Generate a strong JWT secret and add it to `.env`

**Issue: "Database not initialized"**

- **Solution**: Ensure MongoDB is running and connection string is correct

**Issue: "Account locked"**

- **Solution**: Wait 60 minutes for auto-unlock or contact admin

**Issue: "Port already in use"**

- **Solution**: Change `PORT` in `.env` or stop the process using the port

### Debugging Tips

1. **Enable verbose logging**: Check `NODE_ENV=development` in `.env`
2. **Check MongoDB connection**: Verify `MONGO_URI` is correct
3. **Review logs**: Server logs are printed to console
4. **Test endpoints**: Use Swagger UI at `/docs` for interactive testing
5. **Check environment variables**: Ensure all required vars are set

### Database Connection Issues

If MongoDB connection fails:

1. Verify MongoDB is running: `mongosh --eval "db.adminCommand('ping')"`
2. Check connection string format
3. Verify database name is valid
4. Check network/firewall settings

### JWT Token Issues

- Token expiration: 24 hours
- Algorithm: HS256
- Token format: `Bearer <token>`
- Check `JWT_SECRET` in `.env` matches between client and server

---

## References

### Documentation

- [Express.js Documentation](https://expressjs.com/)
- [MongoDB Node.js Driver](https://mongodb.github.io/node-mongodb-native/)
- [JWT.io](https://jwt.io/)
- [Swagger/OpenAPI](https://swagger.io/)

### Configuration Files

- `.env.example` - Environment variables template
- `tsconfig.json` - TypeScript compiler options
- `eslint.config.mjs` - ESLint rules
- `.prettierrc` - Prettier formatting rules

### Useful Commands

```bash
npm run dev          # Development server with auto-reload
npm run build       # Compile TypeScript
npm test            # Run tests
npm run lint        # Check code quality
npm run format      # Format code
```

### Security Best Practices

- Never commit `.env` file
- Use strong passwords (minimum 8 characters)
- Rotate JWT secrets regularly in production
- Use HTTPS in production
- Monitor failed login attempts
- Keep dependencies updated (`npm audit`)

---

## Notes

- This project uses **CommonJS** module system (`"type": "commonjs"`)
- TypeScript compilation output goes to `dist/` directory
- All modules are organized by feature, not by layer
- Database connection is initialized once at server startup
- Admin user is created automatically on first startup if not exists

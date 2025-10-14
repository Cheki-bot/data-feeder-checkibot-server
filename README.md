# Data Feeder Server - CheckiBot# Data Feeder Server



RESTful API built with Express.js featuring JWT authentication, MongoDB integration, and comprehensive user management.Bas### Security Features


- ✅ **Password Hashing**: bcrypt with automatic salt generation (12 rounds)
- ✅ **JWT Tokens**: HS256 algorithm with 24-hour expiration
- ✅ **Account Lockout**: Account locked for 60 minutes after 5 failed login attempts
- ✅ **Role-Based Access Control**: Different permissions for Admin and User roles
- ✅ **Password Requirements**: Minimum 8 characters
- ✅ **Unique Email Constraint**: Enforced at database level
- ✅ **Secure Responses**: Password hashes never exposed in API responses

## 📡 API Endpointswith Express.



## Requirements## Requirements



- Node.js >= 18- Node.js >= 18

- MongoDB (local or MongoDB Atlas)

## Installation

## Installation

```bash

```bashnpm install

npm install```

```

## Environment variables

## Environment variables

Copy `.env.example` to `.env` and adjust the values.

Copy `.env.example` to `.env` and adjust the values:

```bash

```bashcp .env.example .env

cp .env.example .env```

```

## Available scripts

### Required Environment Variables

- `npm run dev`: start the server with auto-reload (nodemon)

```bash- `npm start`: start in production mode

# MongoDB Configuration- `npm run lint`: run ESLint

MONGO_URI=mongodb://localhost:27017  # or MongoDB Atlas URI- `npm run lint:fix`: auto-fix ESLint issues

MONGO_DB_NAME=checkibot_db- `npm run format`: format code with Prettier

- `npm run format:check`: check formatting without writing changes

# Authentication (REQUIRED)

ADMIN_EMAIL=admin@checkibot.com## Code style and quality

ADMIN_PASSWORD=your_secure_admin_password

JWT_SECRET=your_secret_jwt_key_change_in_production- ESLint (Flat Config) configured for Node ESM

- Prettier as the code formatter

# Server- ESLint + Prettier integration to avoid conflicts

PORT=3000- Husky + lint-staged run checks on each commit

NODE_ENV=development

```When you run `npm install`, Husky initializes automatically via the `prepare` script.



> **⚠️ SECURITY NOTE**: Always use strong passwords and change the `JWT_SECRET` in production!### Git hooks



Generate a strong JWT secret:- `pre-commit`: runs `lint-staged` to lint/format staged files.

```bash

node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"If you’re on CI or Docker and don’t want to install hooks, you can disable Husky with `HUSKY=0`.

```

## Project structure

## Available scripts

```

- `npm run dev`: start the server with auto-reload (nodemon)src/

- `npm start`: start in production mode  app.js

- `npm test`: run tests with Jest  server.js

- `npm run test:watch`: run tests in watch mode  config/

- `npm run test:coverage`: run tests with coverage report    index.js

- `npm run lint`: run ESLint  routes/

- `npm run lint:fix`: auto-fix ESLint issues    index.js

- `npm run format`: format code with Prettier    health.js

- `npm run format:check`: check formatting without writing changes  middleware/

    errorHandler.js

## Getting Started```



1. Install dependencies:## Health endpoint

   ```bash

   npm installGET `/api/health`

   ```

Sample response:

2. Configure environment variables in `.env`

```json

3. Start the server:{

   ```bash  "status": "ok",

   npm run dev  "service": "data-feeder-server",

   ```  "timestamp": "2025-09-16T12:34:56.000Z",

  "env": "development"

4. The admin user will be created automatically on first startup}

```

5. Test the health endpoint:

   ```bash## Editor recommendations (optional)

   curl http://localhost:3000/api/health

   ```In VS Code, enable format on save and ESLint fixes:



## 🔐 Authentication System```jsonc

{

The API uses JWT (JSON Web Tokens) for authentication with bcrypt password hashing and account lockout protection.  "editor.formatOnSave": true,

  "editor.defaultFormatter": "esbenp.prettier-vscode",

### User Roles  "editor.codeActionsOnSave": {

    "source.fixAll.eslint": true,

- **Admin**: Full access - can create, deactivate, activate, and delete user accounts    "source.organizeImports": true,

- **User**: Standard access - can register, login, and use protected endpoints  },

}

### Security Features```


- ✅ **Password Hashing**: bcrypt with automatic salt generation (12 rounds)
- ✅ **JWT Tokens**: 24-hour expiration
- ✅ **Account Lockout**: Account locked for 60 minutes after 5 failed login attempts
- ✅ **Role-Based Access Control**: Different permissions for Admin and User roles
- ✅ **Password Requirements**: Minimum 8 characters
- ✅ **Unique Email Constraint**: Enforced at database level
- ✅ **Secure Responses**: Password hashes never exposed in API responses

## 📡 API Endpoints

### Health Check

#### GET `/api/health`

Check if the server is running.

**Response:**
```json
{
  "status": "ok",
  "service": "data-feeder-server",
  "timestamp": "2025-10-13T12:34:56.000Z",
  "env": "development"
}
```

---

### Authentication Endpoints

#### 1. Register a New User

**POST** `/api/auth/register`

Register a new user account. Default role is `User`.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123",
  "role": "User"
}
```

**Response (201 Created):**
```json
{
  "email": "user@example.com",
  "role": "User",
  "is_active": true,
  "created_at": "2025-10-13T20:00:00.000Z"
}
```

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123",
    "role": "User"
  }'
```

---

#### 2. Login

**POST** `/api/auth/login`

Authenticate with email and password to receive a JWT token.

**Request Body:**
```json
{
  "email": "user@example.com",
  "password": "securepass123"
}
```

**Response (200 OK):**
```json
{
  "access_token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "token_type": "bearer"
}
```

**Failed Attempts:**
- After 1-4 failed attempts: Returns remaining attempts
- After 5 failed attempts: Account locked for 60 minutes

**Example with curl:**
```bash
curl -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "user@example.com",
    "password": "securepass123"
  }'
```

---

#### 3. Get Current User Profile

**GET** `/api/auth/me`

Get the profile of the currently authenticated user.

**Headers:**
```
Authorization: Bearer YOUR_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "email": "user@example.com",
  "role": "User",
  "is_active": true,
  "created_at": "2025-10-13T20:00:00.000Z"
}
```

**Example with curl:**
```bash
curl -X GET http://localhost:3000/api/auth/me \
  -H "Authorization: Bearer YOUR_TOKEN_HERE"
```

---

### Admin-Only Endpoints

These endpoints require Admin role and valid JWT token.

#### 4. List All Users

**GET** `/api/auth/users`

List all registered users (Admin only).

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "users": [
    {
      "email": "admin@example.com",
      "role": "Admin",
      "is_active": true,
      "created_at": "2025-10-13T20:00:00.000Z"
    },
    {
      "email": "user@example.com",
      "role": "User",
      "is_active": true,
      "created_at": "2025-10-13T20:01:00.000Z"
    }
  ],
  "count": 2
}
```

**Example with curl:**
```bash
curl -X GET http://localhost:3000/api/auth/users \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

#### 5. Deactivate User Account

**PATCH** `/api/auth/users/:email/deactivate`

Deactivate a user account. User will not be able to login until reactivated (Admin only).

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "message": "User user@example.com has been deactivated"
}
```

**Example with curl:**
```bash
curl -X PATCH http://localhost:3000/api/auth/users/user@example.com/deactivate \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

#### 6. Activate User Account

**PATCH** `/api/auth/users/:email/activate`

Activate a previously deactivated user account (Admin only).

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "message": "User user@example.com has been activated"
}
```

**Example with curl:**
```bash
curl -X PATCH http://localhost:3000/api/auth/users/user@example.com/activate \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

#### 7. Delete User Account

**DELETE** `/api/auth/users/:email`

Permanently delete a user account. This action cannot be undone (Admin only).

**Headers:**
```
Authorization: Bearer ADMIN_TOKEN_HERE
```

**Response (200 OK):**
```json
{
  "message": "User user@example.com has been deleted permanently"
}
```

**Example with curl:**
```bash
curl -X DELETE http://localhost:3000/api/auth/users/user@example.com \
  -H "Authorization: Bearer ADMIN_TOKEN_HERE"
```

---

## 🧪 Testing

The project includes comprehensive tests using Jest and Supertest with an in-memory MongoDB.

### Run Tests

```bash
# Run all tests
npm test

# Run tests in watch mode
npm run test:watch

# Run tests with coverage report
npm run test:coverage
```

### Test Coverage

The test suite includes 20+ tests covering:

- ✅ User registration (success, duplicate email, validation)
- ✅ User login (success, invalid credentials, deactivated account)
- ✅ Account lockout (5 failed attempts, auto-unlock)
- ✅ JWT authentication (valid token, expired token, missing token)
- ✅ Protected routes (authorization, role-based access)
- ✅ Admin operations (activate, deactivate, delete users)
- ✅ Permission checks (non-admin cannot perform admin actions)

---

## 🔒 Account Lockout Behavior

### Failed Login Protection

1. **First 4 attempts**: User receives remaining attempts count
   ```json
   {
     "message": "Invalid credentials. 3 attempts remaining."
   }
   ```

2. **5th failed attempt**: Account is locked for 60 minutes
   ```json
   {
     "message": "Account locked due to too many failed attempts. Try again in 60 minutes."
   }
   ```

3. **During lockout**: Shows remaining time in Bolivia timezone (UTC-4)
   ```json
   {
     "message": "Account locked due to too many failed attempts. Try again in 45 minutes (unlocks at 15:30:00)"
   }
   ```

4. **Auto-unlock**: After 60 minutes, lockout automatically expires

5. **Successful login**: Resets failed attempts counter to 0

---

## 📁 Project Structure

```
src/
├── app.js                    # Express app setup
├── server.js                 # Server startup & DB initialization
├── config/
│   ├── index.js             # Environment configuration
│   └── database.js          # MongoDB connection & setup
├── routes/
│   ├── index.js             # Main router
│   ├── health.js            # Health check endpoint
│   └── auth.js              # Authentication routes
├── middleware/
│   ├── errorHandler.js      # Error handling middleware
│   └── auth.js              # JWT authentication middleware
├── validators/
│   └── auth.js              # Request validation schemas
├── utils/
│   └── auth.js              # Password hashing & JWT utilities
└── tests/
    └── auth.test.js         # Authentication tests
```

---

## 🛡️ Security Best Practices

1. **Never commit `.env` file** - It contains sensitive credentials
2. **Use strong passwords** - Minimum 8 characters (enforced)
3. **Rotate JWT secrets regularly** - Especially in production
4. **Use HTTPS in production** - Protect tokens in transit
5. **Monitor failed login attempts** - Watch for brute force attacks
6. **Keep dependencies updated** - Run `npm audit` regularly

---

## Code Style and Quality

- ESLint (Flat Config) configured for Node ESM
- Prettier as the code formatter
- ESLint + Prettier integration to avoid conflicts
- Husky + lint-staged run checks on each commit

When you run `npm install`, Husky initializes automatically via the `prepare` script.

### Git Hooks

- `pre-commit`: runs `lint-staged` to lint/format staged files

If you're on CI or Docker and don't want to install hooks, you can disable Husky with `HUSKY=0`.

---

## Editor Recommendations (optional)

In VS Code, enable format on save and ESLint fixes:

```jsonc
{
  "editor.formatOnSave": true,
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": true,
    "source.organizeImports": true
  }
}
```

---

## 🚀 Deployment

### Environment Variables for Production

Make sure to set these in your production environment:

```bash
NODE_ENV=production
JWT_SECRET=<generate-a-strong-secret>
MONGO_URI=<your-production-mongodb-uri>
ADMIN_EMAIL=<your-admin-email>
ADMIN_PASSWORD=<strong-admin-password>
```

### Docker Support (Coming Soon)

A Dockerfile will be added for containerized deployments.

---

## 📝 License

This project is private and proprietary.

---

## 🤝 Contributing

Contact the development team for contribution guidelines.

---

## 📧 Support

For issues or questions, contact the CheckiBot development team.

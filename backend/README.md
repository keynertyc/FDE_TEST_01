# Backend Implementation

## Tech Stack

- **Runtime**: Node.js v22+
- **Framework**: NestJS with TypeScript
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Validation**: class-validator + class-transformer
- **Authentication**: JWT + Passport
- **Testing**: Jest (43 tests across 7 suites)

---

## Implemented Endpoints

### Authentication

```
POST   /api/auth/register    - User registration
POST   /api/auth/login       - User login
GET    /api/auth/me          - Get current user
GET    /api/auth/search      - Search users by email (for client assignment)
```

### Projects

```
GET    /api/projects         - List projects (filtered by role)
POST   /api/projects         - Create project (Admin only)
GET    /api/projects/:id     - Get project details
PATCH  /api/projects/:id     - Update project (Admin only)
DELETE /api/projects/:id     - Delete project (Admin only)
```

### Comments

```
GET    /api/projects/:id/comments  - List project comments
POST   /api/projects/:id/comments  - Add comment
```

### Dashboard

```
GET    /api/dashboard        - Stats based on user role
```

---

## Database Schema

**Users:** id (UUID), email (unique), password (hashed), name, role (ENUM: admin/client), createdAt, updatedAt

**Projects:** id (UUID), name, description, status (ENUM: active/completed/on-hold), clientId (FK, nullable), createdById (FK), createdAt, updatedAt

**Comments:** id (UUID), content, projectId (FK, CASCADE), userId (FK), createdAt

---

## Security Checklist

- [x] Passwords hashed (bcrypt/argon2) - bcrypt with salt 10
- [x] JWT with reasonable expiration - 15 minutes
- [x] Input validation - class-validator + ValidationPipe global
- [x] Role-based access control - Guards + decoradores @Auth()

---

## Environment Variables

```bash
cp .env.example .env
```

---

## API Documentation

Swagger/OpenAPI should be accessible at `/api/docs`

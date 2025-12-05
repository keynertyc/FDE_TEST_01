# Technical Decisions

## Candidate Information

| Field                | Value                              |
| -------------------- | ---------------------------------- |
| **Name**             | Keyner W. Tupac Yupanqui Caballero |
| **Date Started**     | December 4, 2025                   |
| **Date Completed**   | December 4, 2025                   |
| **Total Time Spent** | ~6-8 hours                         |

---

## Summary

Built a full-stack Client Portal application allowing consulting firms to manage projects and communicate with clients. The system features role-based access control (Admin/Client), project management, real-time commenting, and mobile-responsive design. Used NestJS for a robust backend API with TypeORM and MySQL, and React with TypeScript for a modern, component-based frontend.

---

## Technology Stack

### Backend

| Component         | Choice          | Why?                                                                                                                                                |
| ----------------- | --------------- | --------------------------------------------------------------------------------------------------------------------------------------------------- |
| Framework         | NestJS          | Provides excellent structure with dependency injection, decorators, and built-in support for TypeScript. Great for enterprise-grade applications.   |
| Database          | MySQL           | Reliable relational database perfect for structured data. Great community support and Docker compatibility.                                         |
| ORM               | TypeORM         | Seamless integration with NestJS, supports migrations, and provides type-safe database queries.                                                     |
| Validation        | class-validator | Native NestJS validation with decorators. Better integration than Zod, works seamlessly with ValidationPipe. Type-safe and follows NestJS patterns. |
| Authentication    | JWT + Passport  | Industry-standard authentication with stateless tokens (15min expiration). Passport provides strategy-based auth architecture.                      |
| API Documentation | Swagger/OpenAPI | Auto-generated interactive API documentation at `/api/docs`. Essential for frontend development.                                                    |
| Testing           | Jest            | NestJS default testing framework. 43 tests across 7 suites covering services and controllers with AAA pattern.                                      |

### Frontend

| Component        | Choice                         | Why?                                                                                                                                       |
| ---------------- | ------------------------------ | ------------------------------------------------------------------------------------------------------------------------------------------ |
| Framework        | React 19 + Vite                | Fast development with HMR, modern React features, and excellent TypeScript support. Updated to React 19 for latest features.               |
| State Management | Zustand                        | Lightweight, simple API, and perfect for authentication state. No boilerplate compared to Redux. Persistent storage with localStorage.     |
| Styling          | Tailwind CSS + shadcn/ui       | Utility-first CSS with pre-built accessible components. Rapid development without sacrificing customization. Toast notifications included. |
| Forms            | React Hook Form + Zod          | Performant form handling with minimal re-renders. Zod integration for type-safe validation. Used in all forms.                             |
| HTTP Client      | Axios                          | Interceptors for token management and 401 handling, better error handling than fetch, widespread community support.                        |
| Routing          | React Router v6                | Standard routing solution with protected routes and role-based access. ProtectedRoute component wraps authenticated views.                 |
| Testing          | Vitest + React Testing Library | Fast, Vite-native testing. 15 tests across 5 suites covering pages, components, and store with AAA pattern.                                |

---

## Architecture Decisions

### Backend Structure

```
backend/
├── src/
│   ├── entities/          # TypeORM entities (User, Project, Comment)
│   ├── auth/              # Authentication module (JWT strategies, guards)
│   ├── projects/          # Projects module (CRUD operations)
│   ├── comments/          # Comments module
│   ├── dashboard/         # Dashboard statistics
│   ├── config/            # TypeORM and app configuration
│   └── common/            # Shared decorators, pipes, guards
├── test/                  # E2E tests
└── Dockerfile
```

**Key Architectural Decisions:**

- **Modular Structure**: Each feature is a self-contained NestJS module with its own controller, service, and DTOs
- **Guards & Decorators**: Custom `@Auth()` decorator combines JWT authentication and role-based authorization
- **Repository Pattern**: TypeORM repositories provide data access layer abstraction
- **class-validator Integration**: Global ValidationPipe with class-validator decorators (@IsEmail, @MinLength, @IsEnum, etc.)
- **Entity Relationships**: Proper foreign keys and cascading deletes ensure data integrity
- **Test Coverage**: 43 tests covering services (auth, projects, comments, dashboard) and controllers

### Frontend Structure

```
frontend/
├── src/
│   ├── components/
│   │   ├── ui/           # shadcn/ui components (Button, Card, Input, etc.)
│   │   ├── Layout.tsx    # Main layout wrapper
│   │   ├── Navbar.tsx    # Navigation component
│   │   └── ProtectedRoute.tsx  # Route guard
│   ├── pages/            # Page components
│   ├── services/         # API service layer
│   ├── store/            # Zustand stores
│   ├── types/            # TypeScript interfaces
│   └── lib/              # Utilities (API client, helpers)
└── Dockerfile
```

**Key Architectural Decisions:**

- **Component-Based Architecture**: Reusable UI components with shadcn/ui for consistency (Button, Card, Input, Select, Toast)
- **Service Layer**: API calls centralized in service files, making them easy to mock for testing
- **Protected Routes**: Route guards check authentication state before rendering protected pages
- **Persistent Auth**: Zustand with localStorage persistence keeps users logged in across sessions
- **Axios Interceptors**: Automatic token injection and 401 error handling with automatic logout
- **Client Search**: Email-based client search with debounce (300ms) instead of UUID input for better UX
- **Test Coverage**: 15 tests covering LoginPage, RegisterPage, DashboardPage, ProtectedRoute, and authStore

### Database Design

**Users Table:**

- `id` (UUID): Primary key
- `email` (unique): User login
- `password`: Bcrypt hashed
- `name`: Display name
- `role`: ENUM (admin, client)
- Timestamps: `createdAt`, `updatedAt`

**Projects Table:**

- `id` (UUID): Primary key
- `name`: Project title
- `description`: Project details
- `status`: ENUM (active, completed, on-hold)
- `clientId`: Foreign key to Users (nullable)
- `createdById`: Foreign key to Users (admin who created)
- Timestamps: `createdAt`, `updatedAt`

**Comments Table:**

- `id` (UUID): Primary key
- `content`: Comment text
- `projectId`: Foreign key to Projects (CASCADE delete)
- `userId`: Foreign key to Users
- Timestamp: `createdAt`

**Relationships:**

- One-to-Many: User → Projects (as client)
- One-to-Many: User → Projects (as creator/admin)
- One-to-Many: Project → Comments
- One-to-Many: User → Comments

---

## Security

1. **Password Hashing**: Bcrypt with salt rounds (10) for secure password storage
2. **JWT Authentication**: Short-lived access tokens (15 minutes) with Bearer token authentication
3. **Role-Based Access Control**: Guards enforce admin-only endpoints and client data isolation
4. **Input Validation**: class-validator decorators validate all incoming data to prevent injection attacks
5. **CORS Configuration**: Restricted to frontend origin, prevents cross-origin attacks
6. **Helmet**: Security headers to protect against common vulnerabilities
7. **SQL Injection Prevention**: TypeORM parameterized queries prevent SQL injection
8. **Authorization Checks**: Services verify user permissions before data access (clients see only their projects)

---

## Challenges

**Most Difficult Part**: Implementing proper role-based access control while maintaining clean code architecture. The challenge was ensuring clients could only access their own projects while admins could access everything, without duplicating authorization logic across multiple endpoints.

**Solution**: Created a custom `@Auth()` decorator that combines JWT authentication and role guards. Services receive the authenticated user object and apply filtering logic based on role. This centralized approach makes the codebase maintainable and reduces authorization bugs.

---

## Trade-offs

### What Would I Do Differently with More Time?

1. **Real-Time Updates**: Implement WebSockets (Socket.io) for live comment notifications (see ANALYSIS.md for detailed approach)
2. **File Uploads**: Add ability to attach files to projects and comments
3. **Advanced Filtering**: Project filtering by status, date ranges, and client with query parameters
4. **Pagination**: Implement cursor-based pagination for projects and comments to handle large datasets
5. **Email Notifications**: Send emails when projects are assigned or comments added using SendGrid/Nodemailer
6. **Audit Logging**: Track all CRUD operations for compliance and debugging
7. **Performance Optimization**: Implement caching (Redis) for dashboard statistics and frequently accessed data
8. **CI/CD Pipeline**: GitHub Actions for automated testing and deployment
9. **Production Deployment**: Deploy to AWS/Vercel with proper environment configs and CDN
10. **E2E Tests**: Add comprehensive end-to-end tests with complete user workflows

---

## Resources Used

- **Documentation**:
  - NestJS Official Docs
  - TypeORM Documentation
  - React Router Documentation
  - Tailwind CSS Docs
  - shadcn/ui Component Library
- **AI Tools**: GitHub Copilot for code completion and boilerplate generation

- **Design Patterns**: Repository Pattern, Dependency Injection, Guard Pattern, Service Layer Pattern

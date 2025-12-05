# Client Portal - Full Stack Application

## Technical Assessment - Forward Deployed Software Engineer

A production-ready client portal for consulting firms to manage projects and communicate with customers.

## Overview

This assessment evaluates your ability to build production-ready software while demonstrating the problem-solving mindset required for a Forward Deployed Software Engineer (FDE) role.

**Time Limit:** 48 hours

**What we're looking for:**
- Build a functional full-stack application
- Make pragmatic technical decisions
- Set up containerized development environment
- Communicate decisions clearly

---

## The Scenario

A client runs a small consulting firm and needs a **Client Portal** to manage their projects and communicate with customers.

### Client's Request (verbatim)

> "We need a portal where our clients can log in and see their projects. They should be able to see what we're working on and leave comments. Our team needs to manage everything. It should work on phones too."

---

## Core Features

### 1. Authentication & Authorization
- User registration and login
- Two roles: **Admin** (consulting team) and **Client**
- JWT-based authentication
- Role-based access control (Admins see all, Clients see only their projects)

### 2. Project Management
- **Admin:** Create, read, update, delete projects
- **Admin:** Assign projects to clients
- **Admin:** Set project status: `active`, `completed`, `on-hold`
- **Client:** View assigned projects only

### 3. Comments
- Add comments to projects
- Both Admin and Client can comment
- View comment history on projects

### 4. Dashboard
- **Admin:** Overview of all projects by status
- **Client:** List of their assigned projects

### 5. Mobile Responsive
- All views functional on mobile devices

---

## Technical Requirements

### Backend
- **Runtime:** Node.js (v18+) or Python (3.10+)
- **Framework:** Express.js, Fastify, NestJS, FastAPI, or Django
- **Database:** PostgreSQL or MongoDB
- **Documentation:** Swagger/OpenAPI at `/api/docs`

### Frontend
- **Framework:** React, Vue.js, or Next.js
- **Language:** TypeScript preferred (JavaScript acceptable)
- **Styling:** Your choice (Tailwind CSS recommended)

### Infrastructure
- **Docker Compose** for local development
- Application must start with: `docker-compose up`

---

## Analysis Task

Answer these questions in `ANALYSIS.md` (keep responses concise):

1. **What are the two main performance bottlenecks** in your implementation? How would you address them?

2. **The client asks:** *"Can we add real-time updates so clients see new comments without refreshing?"* — Describe your recommended approach and why.

---

## Evaluation Criteria

| Criterion | Weight |
|-----------|--------|
| **Functionality** | 30% |
| **Code Quality** | 25% |
| **Architecture** | 20% |
| **Docker Setup** | 15% |
| **Documentation & Analysis** | 10% |

### Bonus Points (up to +20%)
- Test coverage (+10%)
- Production deployment with live URL (+5%)
- CI/CD pipeline (+5%)

---

## Deliverables

1. **Source Code** — Working implementation
2. **README.md** — Updated with setup instructions
3. **TECHNICAL_DECISIONS.md** — Key decisions explained
4. **ANALYSIS.md** — Responses to analysis questions
5. **docker-compose.yml** — One-command local setup

### Submission
1. Fork this repository
2. Create branch: `submission/{your-full-name}`
3. Complete implementation
4. Open a Pull Request

---

## Getting Started

### Prerequisites

- Docker & Docker Compose
- Node.js 22+ (if running without Docker)
- MySQL 8.0+ (if running without Docker)

### Quick Start with Docker

```bash
# Clone repository
git clone <repo-url>
cd FDE_TEST_01

# Start all services
docker-compose up
```

The application will be available at:
- **Frontend**: http://localhost:5173
- **Backend API**: http://localhost:3000
- **API Documentation**: http://localhost:3000/api/docs

### Manual Setup (Without Docker)

#### Backend Setup

```bash
cd backend
npm install
cp .env.example .env

# Update .env with your MySQL credentials
# DATABASE_HOST=localhost
# DATABASE_PORT=3306
# DATABASE_USER=your_user
# DATABASE_PASSWORD=your_password
# DATABASE_NAME=client_portal

# Start backend
npm run start:dev
```

#### Frontend Setup

```bash
cd frontend
npm install
cp .env.example .env

# Update .env with backend URL
# VITE_API_URL=http://localhost:3000/api

# Start frontend
npm run dev
```

### Default Test Users

After starting the application, you can register new users or use these test accounts:

**Admin User:**
```
Email: admin@test.com
Password: password123
```

**Client User:**
```
Email: client@test.com
Password: password123
```

(Note: You'll need to create these via the registration page first)

---

## Tech Stack

### Backend
- **Framework**: NestJS with TypeScript
- **Database**: MySQL 8.0
- **ORM**: TypeORM
- **Authentication**: JWT + Passport
- **Validation**: class-validator (NestJS native)
- **Documentation**: Swagger/OpenAPI
- **Testing**: Jest (43 tests across 7 test suites)

### Frontend
- **Framework**: React 19 + Vite
- **Language**: TypeScript
- **State Management**: Zustand
- **HTTP Client**: Axios
- **Styling**: Tailwind CSS + shadcn/ui
- **Forms**: React Hook Form + Zod
- **Routing**: React Router v6
- **Testing**: Vitest + React Testing Library (15 tests across 5 test suites)

### Infrastructure
- **Containerization**: Docker + Docker Compose
- **Database**: MySQL 8.0

---

## Project Structure

```
FDE_TEST_01/
├── backend/                 # NestJS backend application
│   ├── src/
│   │   ├── entities/       # TypeORM entities
│   │   ├── auth/           # Authentication module
│   │   ├── projects/       # Projects module
│   │   ├── comments/       # Comments module
│   │   ├── dashboard/      # Dashboard module
│   │   ├── config/         # Configuration files
│   │   └── common/         # Shared utilities
│   ├── test/               # E2E tests
│   ├── Dockerfile
│   └── package.json
│
├── frontend/               # React frontend application
│   ├── src/
│   │   ├── components/    # Reusable components
│   │   ├── pages/         # Page components
│   │   ├── services/      # API services
│   │   ├── store/         # State management
│   │   ├── types/         # TypeScript types
│   │   └── lib/           # Utilities
│   ├── Dockerfile
│   └── package.json
│
├── docker-compose.yml      # Docker orchestration
├── TECHNICAL_DECISIONS.md  # Architecture decisions
├── ANALYSIS.md            # Performance analysis
└── README.md              # This file
```

---

## API Endpoints

### Authentication
- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - Login user
- `GET /api/auth/me` - Get current user
- `GET /api/auth/search` - Search users by email (for client assignment)

### Projects
- `GET /api/projects` - List projects (filtered by role)
- `POST /api/projects` - Create project (Admin only)
- `GET /api/projects/:id` - Get project details
- `PATCH /api/projects/:id` - Update project (Admin only)
- `DELETE /api/projects/:id` - Delete project (Admin only)

### Comments
- `GET /api/projects/:id/comments` - List project comments
- `POST /api/projects/:id/comments` - Add comment

### Dashboard
- `GET /api/dashboard` - Get dashboard statistics

Full API documentation available at: http://localhost:3000/api/docs

---

## Testing

### Backend Tests

```bash
cd backend

# Unit tests
npm run test

# E2E tests
npm run test:e2e

# Test coverage
npm run test:cov
```

### Frontend Tests

```bash
cd frontend

# Run tests
npm run test

# Run tests with UI
npm run test:ui

# Test coverage
npm run test:coverage
```

---

## Development

### Backend Development

```bash
cd backend
npm run start:dev    # Start with hot reload
npm run lint         # Run ESLint
npm run format       # Format code with Prettier
```

### Frontend Development

```bash
cd frontend
npm run dev          # Start dev server
npm run build        # Build for production
npm run preview      # Preview production build
```

---

## Production Build

```bash
# Build backend
cd backend
npm run build

# Build frontend
cd frontend
npm run build
```

---

## Questions?

Make reasonable assumptions and document them. This mirrors real FDE work.

---

Good luck!

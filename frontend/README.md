# Frontend Implementation

## Tech Stack

- **Framework:** React 19 + Vite
- **Language:** TypeScript
- **Build Tool:** Vite 7.2
- **Styling:** Tailwind CSS + shadcn/ui
- **State Management:** Zustand
- **Forms:** React Hook Form + Zod
- **HTTP Client:** Axios
- **Testing:** Vitest + React Testing Library (15 tests across 5 suites)

---

## Implemented Views

### Public
- [x] Login page
- [x] Registration page

### Admin
- [x] Dashboard (project stats overview)
- [x] Projects list (all projects)
- [x] Project detail (with comments)
- [x] Create project form
- [x] Edit project form

### Client
- [x] Dashboard (my projects)
- [x] Projects list (assigned projects)
- [x] Project detail (view + comment)

### Shared
- [x] 404 Not Found page
- [x] Protected routes with authentication
- [x] Responsive Navbar

---

## Key Requirements

- [x] Protected routes (auth required)
- [x] Role-based access (Admin vs Client views)
- [x] Form validation
- [x] Loading and error states
- [x] Mobile responsive

---

## Environment Variables

```bash
cp .env.example .env
```

---

## Getting Started

```bash
npm install
npm run dev          # Start dev server at http://localhost:5173
npm run build        # Build for production
npm run test         # Run tests
npm run test:ui      # Run tests with UI
```

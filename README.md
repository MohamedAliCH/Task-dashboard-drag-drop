# TaskFlow — Task Management Dashboard

A premium task management application with drag-and-drop Kanban boards, built with React and Node.js.

![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)
![Vite](https://img.shields.io/badge/Vite-7-646CFF?logo=vite&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-06B6D4?logo=tailwindcss&logoColor=white)
![Express](https://img.shields.io/badge/Express-5-000000?logo=express&logoColor=white)
![MongoDB](https://img.shields.io/badge/MongoDB-9-47A248?logo=mongodb&logoColor=white)

---

## ✨ Features

- **Kanban Board** — Drag-and-drop tasks between To Do, In Progress, and Done columns
- **Task Management** — Create, edit, delete tasks with priority levels and due dates
- **Search & Filters** — Real-time search, priority filters, and sort options
- **Analytics Dashboard** — Visual breakdown of tasks by status and priority
- **User Authentication** — Secure JWT-based login and registration
- **Dark Mode** — System-aware theme toggle with smooth transitions
- **Responsive Design** — Works seamlessly on desktop, tablet, and mobile

## 🎨 Design

Built with an **Ethereal Glassmorphism** design system featuring:

- Frosted glass panels with `backdrop-blur`
- Ambient aurora gradient background
- **Sora** geometric sans-serif typography
- Strict design tokens: 2 border radii, 1 max-width, 8px spacing grid
- Subtle micro-interactions (hover, drag, page transitions)

---

## 🛠️ Tech Stack

### Frontend
| Tech | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool & dev server |
| Tailwind CSS 4 | Utility-first styling |
| @dnd-kit | Drag-and-drop |
| React Hook Form + Zod | Form handling & validation |
| React Router 6 | Client-side routing |
| Lucide React | Icon library |

### Backend
| Tech | Purpose |
|---|---|
| Express 5 | REST API server |
| MongoDB + Mongoose 9 | Database & ODM |
| JWT | Authentication |
| bcryptjs | Password hashing |

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** 18+
- **MongoDB** (local or Atlas connection string)

### 1. Clone the repository

```bash
git clone https://github.com/MohamedAliCH/Task-dashboard-drag-drop.git
cd Task-dashboard-drag-drop
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create a `.env` file in the `backend/` directory:

```env
MONGO_URI=your_mongodb_connection_string
JWT_SECRET=your_jwt_secret_key
PORT=5000
```

Start the server:

```bash
npm run dev
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create a `.env` file in the `frontend/` directory:

```env
VITE_API_URL=http://localhost:5000/api
```

Start the dev server:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

### 4. Seed sample data (optional)

```bash
cd backend
npm run seed
```

---

## 📁 Project Structure

```
Task-dashboard-drag-drop/
├── backend/
│   ├── config/          # Database connection
│   ├── middleware/       # Auth & error handling middleware
│   ├── models/          # Mongoose schemas (User, Task)
│   ├── routes/          # API routes (auth, tasks)
│   ├── index.js         # Express server entry point
│   └── seed.js          # Sample data seeder
│
├── frontend/
│   ├── src/
│   │   ├── components/  # Reusable UI components
│   │   │   ├── Navbar.jsx
│   │   │   ├── TaskCard.jsx
│   │   │   ├── TaskFormModal.jsx
│   │   │   ├── ConfirmModal.jsx
│   │   │   ├── SkeletonCard.jsx
│   │   │   ├── SortableItem.jsx
│   │   │   ├── DroppableColumn.jsx
│   │   │   └── PageTransition.jsx
│   │   ├── features/
│   │   │   ├── auth/        # Login, Register, Dashboard, Profile
│   │   │   └── analytics/   # Stats page
│   │   ├── contexts/    # Auth & Theme context providers
│   │   ├── lib/         # API client & Zod schemas
│   │   ├── index.css    # Design system & glass utilities
│   │   └── App.jsx      # Root component & routing
│   └── index.html
```

---

## 📝 API Endpoints

### Auth
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/register` | Create a new account |
| POST | `/api/auth/login` | Sign in & get JWT |

### Tasks (Protected)
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tasks` | Get all user tasks |
| POST | `/api/tasks` | Create a new task |
| PUT | `/api/tasks/:id` | Update a task |
| DELETE | `/api/tasks/:id` | Delete a task |

---

## 👤 Author

**Mohamed Ali Chouchane Hmila**

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

# DevTrack Pro

**Enterprise Project & Task Management Platform**

DevTrack Pro is a modern full-stack project management application designed to help individuals and teams efficiently manage projects, tasks, deadlines, and collaboration within a centralized workspace. The application provides an intuitive interface for project planning, task tracking, team management, analytics, and productivity monitoring.

---

## Overview

DevTrack Pro streamlines project execution by combining project management, task organization, analytics, and team collaboration into a single platform. It offers a clean, responsive interface backed by a secure authentication system and scalable backend architecture.

The application is built using modern web technologies with a focus on performance, maintainability, and user experience.

---

## Features

### Authentication & Security

- Secure user registration and login
- JWT-based authentication
- Protected API routes
- Password hashing using bcrypt
- Refresh token support
- Input validation with Zod

### Dashboard

- Personalized welcome dashboard
- Project overview
- Productivity statistics
- Recent activity
- Upcoming deadlines
- Quick actions
- Performance insights

### Project Management

- Create, edit, and delete projects
- Project status tracking
- Project categorization
- Search and filtering
- Team member management
- Project analytics

### Task Management

- Create and assign tasks
- Priority management
- Due date tracking
- Status management
- Task filtering
- Search functionality
- Pagination support

### Kanban Board

- Drag-and-drop workflow
- Status-based task organization
- Real-time task movement
- Visual project tracking

### Analytics

- Productivity charts
- Task completion statistics
- Performance metrics
- Project progress visualization
- Activity insights

### Notifications

- User notifications
- Task reminders
- Activity updates

### User Experience

- Responsive design
- Modern dark theme
- Clean UI
- Mobile-friendly layout
- Fast page loading
- Intuitive navigation

---

# Tech Stack

## Frontend

- React 18
- Vite
- Tailwind CSS
- React Router
- Axios
- Context API

## Backend

- Node.js
- Express.js
- Prisma ORM
- JWT Authentication
- Zod Validation
- bcrypt
- Morgan

## Database

- PostgreSQL
- Neon Database

## Development Tools

- Git
- GitHub
- VS Code
- Postman
- Prisma Studio

---

# Project Structure

```
devtrack-pro/
│
├── client/
│   ├── src/
│   ├── public/
│   └── package.json
│
├── server/
│   ├── prisma/
│   ├── src/
│   ├── server.js
│   └── package.json
│
├── README.md
└── .gitignore
```

---

# Key Functionalities

- User Authentication
- Dashboard
- Project Management
- Task Management
- Kanban Board
- Team Collaboration
- Analytics Dashboard
- Notifications
- Search & Filters
- Responsive UI

---

# Installation

## Clone Repository

```bash
git clone https://github.com/priyalllll/devtrack-pro.git
```

---

## Navigate to Project

```bash
cd devtrack-pro
```

---

## Install Frontend

```bash
cd client
npm install
```

---

## Install Backend

```bash
cd ../server
npm install
```

---

## Configure Environment Variables

Create a `.env` file inside the `server` directory.

Example:

```env
DATABASE_URL=your_database_url
JWT_ACCESS_SECRET=your_access_secret
JWT_REFRESH_SECRET=your_refresh_secret
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

## Generate Prisma Client

```bash
npx prisma generate
```

---

## Run Database Migration

```bash
npx prisma migrate deploy
```

---

## Start Backend

```bash
npm run dev
```

---

## Start Frontend

```bash
cd ../client
npm run dev
```

---

# Screenshots

Add screenshots of the following pages:

- Login
- Register
- Dashboard
- Projects
- Tasks
- Kanban Board
- Analytics
- Profile

---

# Future Enhancements

- Real-time collaboration using WebSockets
- Calendar integration
- Email notifications
- File attachments
- Role-based access control
- Dark/Light theme toggle
- Activity timeline
- AI-powered productivity insights
- Mobile application
- Third-party integrations

---

# Learning Outcomes

This project strengthened my understanding of:

- Full Stack Web Development
- REST API Design
- Authentication & Authorization
- Database Design
- Prisma ORM
- PostgreSQL
- State Management
- Responsive UI Development
- Secure Backend Development
- Git & GitHub Workflow

---

# Author

**Priyal Rathore**

Computer Engineering Student  
SVKM's NMIMS Indore

GitHub: https://github.com/priyalllll

LinkedIn: *(Add your LinkedIn profile here)*

Portfolio: *(Add after deployment)*

---

# License

This project is developed for educational and portfolio purposes.

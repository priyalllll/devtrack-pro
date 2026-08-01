<div align="center">

# DevTrack Pro

### Enterprise Project & Task Management Platform

A modern full-stack project management application designed to help individuals and teams efficiently organize projects, manage tasks, visualize workflows, and improve productivity through an intuitive dashboard and analytics.

---

![React](https://img.shields.io/badge/React-18-61DAFB?style=for-the-badge&logo=react&logoColor=white)
![Node.js](https://img.shields.io/badge/Node.js-20-339933?style=for-the-badge&logo=node.js&logoColor=white)
![Express](https://img.shields.io/badge/Express.js-000000?style=for-the-badge&logo=express)
![Prisma](https://img.shields.io/badge/Prisma-2D3748?style=for-the-badge&logo=prisma)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-336791?style=for-the-badge&logo=postgresql)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-06B6D4?style=for-the-badge&logo=tailwindcss)



</div>

---

# Overview

DevTrack Pro is a full-stack SaaS-inspired project management platform developed to streamline project planning, task tracking, workflow management, and productivity monitoring.

The application provides a secure and scalable environment where users can manage multiple projects, organize tasks using Kanban boards, monitor progress through analytics dashboards, and collaborate within a centralized workspace.

Built using modern web technologies, DevTrack Pro follows industry-standard software architecture with a focus on clean design, scalability, maintainability, and security.

---
---

## Dashboard Preview

<p align="center">
  <img src="./assets/dashboard.png" alt="DevTrack Pro Dashboard" width="100%">
</p>

---


# Key Features

## Authentication & Security

- Secure User Registration & Login
- JWT Authentication
- Refresh Token Support
- Password Hashing with bcrypt
- Protected API Routes
- Secure Input Validation using Zod

---

## Dashboard

- Personalized Dashboard
- Project Statistics
- Productivity Overview
- Recent Activity
- Today's Tasks
- Upcoming Deadlines
- Interactive Charts
- Quick Actions Panel

---

## Project Management

- Create Projects
- Update Projects
- Delete Projects
- Project Search
- Project Filters
- Status Management
- Progress Tracking

---

## Task Management

- Create Tasks
- Edit Tasks
- Delete Tasks
- Task Priorities
- Due Dates
- Task Status Tracking
- Search & Filters
- Pagination

---

## Kanban Workflow

- Drag & Drop Task Management
- Status Based Workflow
- Real-Time Task Updates
- Visual Progress Tracking

---

## Analytics

- Project Statistics
- Productivity Charts
- Task Completion Insights
- Performance Metrics
- Progress Visualization

---

## User Experience

- Modern SaaS Dashboard
- Responsive Design
- Dark Theme
- Smooth User Interface
- Mobile Friendly Layout
- Optimized Navigation

---

# Tech Stack

| Layer | Technologies |
|--------|--------------|
| Frontend | React 18, Vite, Tailwind CSS, React Router, Axios |
| Backend | Node.js, Express.js |
| Database | PostgreSQL (Neon) |
| ORM | Prisma ORM |
| Authentication | JWT, bcrypt |
| Validation | Zod |
| Charts | Recharts |
| Version Control | Git & GitHub |

---

# System Architecture

```
                     User
                       │
                       ▼
              React + Vite Frontend
                       │
                 REST API Requests
                       │
                       ▼
             Express.js Backend API
                       │
               Authentication Layer
                       │
                    Prisma ORM
                       │
                       ▼
             PostgreSQL (Neon Database)
```

---

# Folder Structure

```
devtrack-pro
│
├── client
│   ├── src
│   │   ├── components
│   │   ├── pages
│   │   ├── hooks
│   │   ├── services
│   │   ├── layouts
│   │   └── utils
│   │
│   └── public
│
├── server
│   ├── prisma
│   ├── middleware
│   ├── controllers
│   ├── services
│   ├── routes
│   ├── validators
│   ├── config
│   └── server.js
│
├── README.md
└── .gitignore
```

---

# Core Modules

- Authentication System
- Dashboard
- Project Management
- Task Management
- Kanban Board
- Analytics
- Notifications
- Search & Filtering
- Responsive UI

---

# Installation

## Clone Repository

```bash
git clone https://github.com/priyalllll/devtrack-pro.git
```

## Navigate

```bash
cd devtrack-pro
```

## Backend

```bash
cd server
npm install
npm run dev
```

## Frontend

```bash
cd client
npm install
npm run dev
```

---

# Environment Variables

Create a `.env` file inside the `server` directory.

```env
DATABASE_URL=
JWT_ACCESS_SECRET=
JWT_REFRESH_SECRET=
JWT_ACCESS_EXPIRES_IN=
JWT_REFRESH_EXPIRES_IN=
PORT=5000
CLIENT_URL=http://localhost:5173
```

---

# Screenshots

> Add screenshots here after capturing them.

- Login Page
- Dashboard
- Projects
- Tasks
- Kanban Board
- Analytics

---

# Skills Demonstrated

- Full Stack Development
- REST API Development
- Authentication & Authorization
- Database Design
- Prisma ORM
- PostgreSQL
- React Development
- Backend Architecture
- Responsive UI Development
- Secure API Design
- Git Version Control

---

# Future Enhancements

- Team Collaboration
- Role-Based Access Control
- Calendar Integration
- File Attachments
- Email Notifications
- Activity Timeline
- AI Task Recommendations
- AI Productivity Insights
- Mobile Application
- Cloud Deployment

---

# Learning Outcomes

Through this project, I strengthened my understanding of:

- Modern Full Stack Development
- RESTful API Design
- Database Modeling
- Authentication using JWT
- Prisma ORM
- PostgreSQL
- State Management
- Responsive UI Development
- Software Architecture
- Version Control using Git

---

# Project Status

Current Version: **v1.0**

Status:

- Authentication Completed
- Dashboard Completed
- Project Management Completed
- Task Management Completed
- Kanban Board Completed
- Analytics Completed
- Deployment in Progress

---

# Author

**Priyal Rathore**

B.Tech Computer Engineering  
SVKM's NMIMS Indore

GitHub: https://github.com/priyalllll


---

# License

This project is licensed under the MIT License.

---

### If you found this project interesting, consider giving it a ⭐ on GitHub.

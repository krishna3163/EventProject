# Event Management & Coding Platform 🚀

A comprehensive platform for managing coding contests, quizzes, and events with robust authentication and real-time features.

## 🌟 Key Features

### 🔐 Advanced Authentication
- **Firebase Integration**: Supports Google, Phone (OTP), and Anonymous login.
- **Auto-Sync**: New users from Firebase are automatically registered in MongoDB.
- **Role-Based Access**: dedicated dashboards for Students, Organization Admins, and Super Admins.

### 🏆 Contests & Quizzes
- **Live Coding Arena**: Real-time code execution with support for Java, Python, C++, and Node.js.
- **Secure Quiz Zone**: Fullscreen enforcement and tab-switch detection for fair exams.
- **Real-Time Timers**: Countdown timers on dashboards and inside contests.
- **Leaderboards**: Competitive ranking system.

### 📊 Performance Tracking
- **Dual Database Architecture**: 
  - **MongoDB**: For core user data and event management.
  - **Supabase**: For efficient analytics and participation history.
- **Student Dashboard**: Track your progress, recent scores, and upcoming events.

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java JDK 17+
- MongoDB (Local or Atlas)
- Firebase Project Configured

### Running the Application

1. **Backend (Spring Boot)**
   ```bash
   cd EventProject-main
   ./mvnw.cmd spring-boot:run
   ```
   Server runs on: `http://localhost:8080`

2. **Frontend (React + Vite)**
   ```bash
   cd event-frontend
   npm run dev
   ```
   Client runs on: `http://localhost:3001` (or 5173)

## 🔑 Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| **Admin** | `admin@eventhub.com` | `admin123` |
| **Student** | `student@demo.com` | `student123` |

## 🛠️ Tech Stack
- **Frontend**: React, Vite, TailwindCSS, Monaco Editor, Firebase Auth
- **Backend**: Spring Boot, Spring Security, MongoDB, Supabase
- **DevOps**: Docker ready

---
*Built with ❤️ for coders.*

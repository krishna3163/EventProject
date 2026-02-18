<div align="center">

# 🎯 EventProject

### _The Modern Event Management Platform for Universities & Organizations_

[![Vite](https://img.shields.io/badge/Vite-5.x-646CFF?style=for-the-badge&logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-18.x-61DAFB?style=for-the-badge&logo=react&logoColor=white)](https://reactjs.org/)
[![Spring Boot](https://img.shields.io/badge/Spring_Boot-3.x-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)](https://spring.io/projects/spring-boot)
[![MongoDB](https://img.shields.io/badge/MongoDB-7.x-47A248?style=for-the-badge&logo=mongodb&logoColor=white)](https://www.mongodb.com/)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow?style=for-the-badge)](LICENSE)

<br />

**Create quizzes. Host coding contests. Track leaderboards. Generate certificates.**  
All in one beautifully designed, real-time platform.

[🚀 Live Demo](#) &nbsp;•&nbsp; [📖 Documentation](#getting-started) &nbsp;•&nbsp; [🐛 Report Bug](../../issues) &nbsp;•&nbsp; [💡 Request Feature](../../issues)

---

</div>

## ✨ Features

| Feature | Description |
|---------|-------------|
| 🏛️ **Organization Management** | Multi-tenant support — each org gets its own dashboard, events, and student roster |
| 📝 **MCQ Quiz Engine** | Create timed quizzes with single/multiple-choice questions, auto-grading, and analytics |
| 💻 **Coding Contests** | Full-featured coding contest system with problem management, test cases, and submissions |
| 📊 **Real-time Leaderboards** | WebSocket-powered live leaderboards that update as students submit |
| 🏆 **Certificate Generation** | Auto-generate participation & rank certificates (PDF-ready) |
| 👤 **Editable Profiles** | Students can edit their username, full name, roll number, university/college, and academic year |
| 🔐 **Role-Based Access** | Student, Org Admin, and Super Admin roles with fine-grained permissions |
| 🌗 **Dark / Light Theme** | Premium glassmorphism UI with automatic theme switching |
| 📱 **Fully Responsive** | Works beautifully on desktop, tablet, and mobile |

---

## 🛠️ Tech Stack

### Frontend
- **React 18** — Component-based UI with hooks
- **Vite 5** — Lightning-fast HMR and build
- **React Router v6** — Client-side routing
- **Axios** — HTTP client with interceptors
- **SockJS + STOMP** — WebSocket real-time communication
- **React Toastify** — Toast notifications
- **TailwindCSS** — Utility-first CSS framework
- **Custom CSS** — Glassmorphism, gradients, micro-animations

### Backend
- **Spring Boot 3** — RESTful API framework
- **Spring Security + JWT** — Authentication & authorization
- **MongoDB** — NoSQL document database
- **WebSocket (STOMP)** — Real-time event broadcasting
- **Lombok** — Boilerplate reduction

---

## 📂 Project Structure

```
EventProject/
├── event-frontend/             # React + Vite frontend
│   ├── src/
│   │   ├── components/         # Reusable components (Navbar, etc.)
│   │   ├── context/            # Auth context provider
│   │   ├── pages/              # Route pages (Dashboard, Profile, Quiz…)
│   │   ├── services/           # API service layer
│   │   └── styles/             # Custom CSS modules
│   ├── index.html
│   └── vite.config.js
│
├── src/main/java/com/company/event/   # Spring Boot Backend
│   ├── user/                   # User entity, controller, service
│   ├── quiz/                   # MCQ quiz engine
│   ├── contestPackage/         # Coding contest system
│   ├── organization/           # Organization management
│   ├── security/               # JWT auth, filters, config
│   └── websocket/              # Real-time WebSocket service
│
├── pom.xml                     # Maven dependencies
└── README.md
```

---

## 🚀 Getting Started

### Prerequisites

Ensure you have the following installed:

| Tool | Version | Download |
|------|---------|----------|
| **Node.js** | ≥ 18.x | [nodejs.org](https://nodejs.org/) |
| **npm** | ≥ 9.x | Comes with Node.js |
| **Java JDK** | ≥ 17 | [adoptium.net](https://adoptium.net/) |
| **Maven** | ≥ 3.8 | [maven.apache.org](https://maven.apache.org/) |
| **MongoDB** | ≥ 6.x | [mongodb.com](https://www.mongodb.com/try/download/community) |

### 1️⃣ Clone the Repository

```bash
git clone https://github.com/krishna3163/EventProject.git
cd EventProject
```

### 2️⃣ Backend Setup

```bash
# Set environment variables (or add to application.properties)
# SPRING_DATA_MONGODB_URI=mongodb://localhost:27017/eventdb
# JWT_SECRET=your-secret-key

# Build & run the Spring Boot server
mvn clean install -DskipTests
mvn spring-boot:run
```

The backend will start on **http://localhost:8080**.

### 3️⃣ Frontend Setup

```bash
cd event-frontend

# Install dependencies
npm install

# Create .env file (optional — defaults to localhost:8080)
echo "VITE_API_BASE_URL=http://localhost:8080" > .env

# Start the dev server
npm run dev
```

The frontend will start on **http://localhost:5173**.

### 4️⃣ Default Admin Access

| Field | Value |
|-------|-------|
| Username | `admin` |
| Password | `admin123` |

> ⚠️ **Change the default admin password** in production!

---

## 👤 Profile Fields (Editable)

Users can edit the following fields from their profile page:

| Field | Description | Example |
|-------|-------------|---------|
| **Username** | Unique identifier | `john_doe` |
| **First Name** | Given name | `John` |
| **Last Name** | Family name | `Doe` |
| **Email** | Contact email | `john@university.edu` |
| **University / College** | Institution name | `IIT Delhi` |
| **Roll Number** | Student ID | `22CS104` |
| **Academic Year** | Current year of study | `3rd Year` |
| **Department** | Branch/major | `Computer Science` |

### How to Edit

1. Log in to your account
2. Click on your **avatar** or navigate to `/profile`
3. Click the **✏️ Edit Profile** button
4. Modify any editable field
5. Click **Save Changes** — updates are sent to the backend via `PATCH /api/users/me/profile`

---

## 🔌 API Reference

### Authentication
| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/auth/login` | Login with username/email + password |
| POST | `/api/auth/register/student` | Register a new student |
| POST | `/api/auth/register/organization` | Register a new organization |

### User Profile
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/users/me` | Get current user profile |
| PATCH | `/api/users/me/profile` | Update own profile fields |
| GET | `/user/getById/{id}` | Get user by ID |

### Events & Quizzes
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/events/getAllEvent` | List all events |
| POST | `/api/events/createEvent` | Create a new event (admin) |
| POST | `/api/mcq/start/{eventId}` | Start a quiz |
| POST | `/api/mcq/submit/{eventId}` | Submit quiz answers |

### Coding Contests
| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/contest/getAll` | List all contests |
| POST | `/submission/run` | Run code against test cases |
| POST | `/submission` | Submit a solution |
| GET | `/leaderboard/{contestId}` | Get contest leaderboard |

---

## 🧩 Contributing

We welcome contributions! Here's how to get started:

1. **Fork** the repository
2. **Create** a feature branch: `git checkout -b feature/amazing-feature`
3. **Commit** your changes: `git commit -m 'Add amazing feature'`
4. **Push** to the branch: `git push origin feature/amazing-feature`
5. **Open** a Pull Request

### Development Tips

- Frontend hot-reload is enabled via Vite — just save your files
- Backend changes require a restart (or use Spring DevTools for auto-reload)
- The API service layer (`src/services/api.js`) centralizes all API calls — add new endpoints there
- CSS styles follow a glassmorphism design system — check `styles/LandingPage.css` for patterns

---

## 🌐 Deployment

### Vercel (Frontend)

The frontend is Vercel-ready:

```bash
cd event-frontend
npm run build
# Deploy the 'dist' folder to Vercel
```

### Backend

Deploy the Spring Boot JAR to any cloud provider:

```bash
mvn clean package -DskipTests
java -jar target/event-0.0.1-SNAPSHOT.jar
```

Set these environment variables in production:
- `SPRING_DATA_MONGODB_URI` — MongoDB connection string
- `JWT_SECRET` — Secret key for JWT tokens
- `SPRING_PROFILES_ACTIVE=prod`

---

## 📄 License

This project is licensed under the **MIT License** — see the [LICENSE](LICENSE) file for details.

---

<div align="center">

**Built with ❤️ for the developer community**

⭐ Star this repo if you found it useful!

</div>

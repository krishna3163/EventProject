# ⚡ EventHub — College Event Management & Coding Contest Platform

> A modern, full-stack platform for managing college events, MCQ quizzes, and coding contests — with real-time leaderboards, analytics, PDF exports, and 4 stunning themes.

> 🚧 **Status:** Currently in the **Developer Phase** — actively improving security, features, and code quality.
>
> 🌐 **Live Preview:** [View Demo](https://event-project-4kaj2qtva-krishna3163s-projects.vercel.app/)

![React](https://img.shields.io/badge/React-18-61DAFB?logo=react)
![Spring Boot](https://img.shields.io/badge/Spring%20Boot-3.5-6DB33F?logo=springboot)
![MongoDB](https://img.shields.io/badge/MongoDB-7.0-47A248?logo=mongodb)
![JWT](https://img.shields.io/badge/Auth-JWT-000000?logo=jsonwebtokens)
![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)

---

## ✨ Features

### 🎨 Themes
Switch between **4 built-in themes** instantly — without page reload:
| ☀️ Light | 🌙 Dark | 🌌 Midnight | 🍃 Forest |
|----------|---------|-------------|-----------|

### 👤 For Participants
- **Dashboard** with filters (Live / Upcoming / Completed), search, grid/list toggle
- **Favorites** — bookmark your favorite events
- **Live countdown timers** before contest starts
- **MCQ quizzes** with timed sessions and auto-submission
- **Coding arena** with multi-language support (Python, Java, C, C++)
- **Leaderboard** with real-time ranking
- **Beautiful profile page** with activity tracking

### 🛠️ For Admins
- **Event CRUD** — create, edit, delete MCQ and coding events
- **Problem Studio** — design coding problems with test cases and JSON import
- **Analytics dashboard** — per-event statistics, scores, participation rates
- **PDF exports** — downloadable analytics reports
- **Certificate management**

### 🔐 Security
- **JWT-based authentication** (no more insecure Basic Auth)
- **Role-based authorization** (ADMIN / USER)
- **BCrypt password hashing**
- **Protected API endpoints** with `@PreAuthorize`
- **Environment variable configuration** — no hardcoded secrets

---

## 📁 Project Structure

```
EventHub/
├── README.md
├── PROJECT_AUDIT.md              # Full-stack audit document
├── docker-compose.yml            # Full stack deployment
│
├── EventProject-main/            # ☕ Spring Boot Backend
│   ├── pom.xml
│   ├── Dockerfile
│   ├── .env.example
│   └── src/main/java/com/company/event/
│       ├── security/             # JWT, Auth, Security config
│       ├── user/                 # User domain
│       ├── quiz/                 # MCQ events, questions, analytics
│       └── contestPackage/       # Coding contests, problems, submissions
│
└── event-frontend/               # ⚛️ React + Vite Frontend
    ├── Dockerfile
    ├── .env.example
    └── src/
        ├── components/           # Navbar, EventCard, EventForm, Loader
        ├── pages/                # Dashboard, Login, Signup, Profile, etc.
        ├── context/              # AuthContext (JWT), ThemeContext
        └── services/             # API service layer (axios)
```

---

## 🚀 Quick Start

### Prerequisites
- **Node.js** 18+ and **npm**
- **Java** 21 (JDK)
- **MongoDB** 7.0 (running locally or via Docker)

### Option 1: Run Locally

**1. Start MongoDB** (if not running already):
```bash
# Using Docker (recommended)
docker run -d --name mongodb -p 27017:27017 mongo:7.0

# Or start your local MongoDB service
```

**2. Start the Backend:**
```bash
cd EventProject-main
.\mvnw.cmd spring-boot:run        # Windows
./mvnw spring-boot:run             # Mac/Linux
```
Backend runs at: `http://localhost:8080`
Swagger UI: `http://localhost:8080/swagger-ui.html`

> ℹ️ On first startup, a default admin user is created with username `admin` and password `admin123`. You can change these via environment variables.

**3. Start the Frontend:**
```bash
cd event-frontend
npm install
npm run dev
```
Frontend runs at: `http://localhost:3000`

### Option 2: Docker Compose (Full Stack)

```bash
docker-compose up --build
```
This starts MongoDB + Backend + Frontend automatically.

| Service   | URL                          |
|-----------|------------------------------|
| Frontend  | http://localhost:3000         |
| Backend   | http://localhost:8080         |
| Swagger   | http://localhost:8080/swagger-ui.html |
| MongoDB   | localhost:27017              |

---

## ⚙️ Configuration

All secrets and configuration are driven by **environment variables** (with sensible defaults for development):

| Variable | Default | Description |
|----------|---------|-------------|
| `MONGODB_URI` | `mongodb://localhost:27017/mydb` | MongoDB connection URI |
| `SERVER_PORT` | `8080` | Backend server port |
| `JWT_SECRET` | *(dev default)* | Base64-encoded HMAC-SHA256 secret key |
| `JWT_EXPIRATION` | `86400000` | Token validity (24h in ms) |
| `ADMIN_USERNAME` | `admin` | Default admin username |
| `ADMIN_PASSWORD` | `admin123` | Default admin password |
| `ADMIN_EMAIL` | `admin@eventhub.com` | Default admin email |
| `JDOODLE_CLIENT_ID` | `dummy_id` | JDoodle API client ID |
| `JDOODLE_CLIENT_SECRET` | `dummy_secret` | JDoodle API client secret |
| `VITE_API_BASE_URL` | `http://localhost:8080` | Backend URL for frontend |

See `.env.example` files in both `EventProject-main/` and `event-frontend/`.

---

## 🔑 API Documentation

### Authentication Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `POST` | `/api/auth/login` | Login, returns JWT | Public |
| `POST` | `/api/auth/register` | Register new user, returns JWT | Public |
| `GET`  | `/api/auth/me` | Get current user profile | Bearer |

### Event Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/api/events/getAllEvent` | List all events | Bearer |
| `GET` | `/api/events/getEventById/{id}` | Get event details | Bearer |
| `POST` | `/api/events/createEvent` | Create event | Admin |
| `PUT` | `/api/events/updateEvent/{id}` | Update event | Admin |
| `DELETE` | `/api/events/deleteEvent/{id}` | Delete event | Admin |

### Contest Endpoints
| Method | Path | Description | Auth |
|--------|------|-------------|------|
| `GET` | `/contest/getAll` | List all contests | Bearer |
| `POST` | `/contest/insert` | Create contest | Admin |
| `GET` | `/leaderboard/{contestId}` | Get leaderboard | Bearer |
| `POST` | `/submission` | Submit code | Bearer |

> 📖 Full interactive docs available at `/swagger-ui.html` when backend is running.

---

## 🧪 Tech Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | React 18, Vite, Tailwind CSS, React Router, Axios, React-Toastify |
| **Backend** | Spring Boot 3.5, Spring Security, Spring Data MongoDB |
| **Auth** | JWT (JJWT), BCrypt |
| **Database** | MongoDB 7.0 |
| **Code Execution** | JDoodle API |
| **PDF Generation** | OpenPDF |
| **API Docs** | SpringDoc OpenAPI (Swagger UI) |
| **DevOps** | Docker, Docker Compose |

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/Dashboard.png)

### Create Event
![Create Event](screenshots/create.png)

### Analytics
![Analytics](screenshots/analytic.png)

### Profile
![Profile](screenshots/profile.png)

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

**Developed with ❤️ and a lot of caffeine by [krishna3163](https://github.com/krishna3163)**

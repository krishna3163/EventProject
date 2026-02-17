# 🚀 EventHub - Modern Event Management System

EventHub is a comprehensive, full-stack platform designed to manage and participate in technical events, including **MCQ Quizzes** and **Coding Contests**. It features a stunning, premium UI with multiple color themes and advanced management tools for both students and administrators.

---

## ✨ Features

### 🎨 Design & Aesthetics
- **Multi-Theme Support**: Instant switching between **Light**, **Dark**, **Midnight** (Deep Blue), and **Forest** (Green) themes.
- **Glassmorphic UI**: Modern, premium design with blur effects and smooth transitions.
- **Responsive Layout**: Fully optimized for mobile, tablet, and desktop views.

### 🏆 Participant Experience
- **Dashboard**: Filter events by status (Live, Upcoming, Past) and sort by newest or duration.
- **Search & Filter**: Find your favorite quizzes or contests easily.
- **Favorites System**: Save events to your personal collection for quick access.
- **Live Countdown**: Real-time timer for upcoming events.
- **Calendar Integration**: Export event details to your calendar (.ics format).
- **Activity Tracking**: Monitor your progress (Registered, Completed, In-Progress) on your profile.

### 🛠️ Admin & Tooling
- **Event Creation**: Intuitive forms for posting MCQs and Coding challenges.
- **Problem Studio**: Advanced tool for engineering coding challenges with **JSON Import** support for bulk uploads.
- **Analytics**: View statistics and results for managed events.
- **Certificate Vault**: Automated certificate generation for top performers.

---

## 💻 Tech Stack

**Frontend:**
- [React.js](https://reactjs.org/) (Vite)
- [Tailwind CSS](https://tailwindcss.com/)
- [React Router 6](https://reactrouter.com/)
- [Axios](https://axios-http.com/)
- [Context API](https://reactjs.org/docs/context.html) (State & Theme Management)

**Backend:**
- [Spring Boot 3](https://spring.io/projects/spring-boot)
- [MongoDB](https://www.mongodb.com/)
- [Maven](https://maven.apache.org/)
- [Spring Security](https://spring.io/projects/spring-security) (JWT Authentication)

---

## 🚀 Getting Started

### Prerequisites
- Node.js (v18+)
- Java 21+
- MongoDB (Running locally or via Docker)

### 1. Installation
Clone the repository:
```bash
git clone https://github.com/yourusername/eventhub.git
cd eventhub
```

### 2. Frontend Setup
```bash
cd event-frontend
npm install
npm run dev
```
Accessible at: `http://localhost:3000`

### 3. Backend Setup
Configure your MongoDB URI in `EventProject-main/src/main/resources/application.yaml`.
```bash
cd EventProject-main
.\mvnw.cmd spring-boot:run
```
Accessible at: `http://localhost:8080`

---

## 📸 Screenshots

### Dashboard
![Dashboard](screenshots/dashboard.png)

### Host New Challenge
![Create Event](screenshots/create_event.png)

---

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

1. Fork the Project
2. Create your Feature Branch (`git checkout -b feature/AmazingFeature`)
3. Commit your Changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the Branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for more information.

---

**Developed with ❤️ by EventHub Team**

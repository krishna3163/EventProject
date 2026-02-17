# 🎉 Event Management System - Frontend

A modern, responsive frontend application for managing events built with React, Vite, and Tailwind CSS.

![React](https://img.shields.io/badge/React-18.2.0-blue)
![Vite](https://img.shields.io/badge/Vite-5.0.8-646CFF)
![TailwindCSS](https://img.shields.io/badge/TailwindCSS-3.4.0-38B2AC)

## ✨ Features

- 📊 **Dashboard** - View all events in a beautiful card-based grid layout
- ➕ **Create Events** - Easy-to-use form with validation
- 👁️ **Event Details** - Comprehensive view of event information
- ✏️ **Edit Events** - Update event details seamlessly
- 🗑️ **Delete Events** - Remove events with confirmation
- 🔍 **Search Functionality** - Search events by title, description, or location
- 📱 **Responsive Design** - Works perfectly on mobile, tablet, and desktop
- 🎨 **Modern UI** - Gradient colors, glass morphism effects, and smooth animations
- 🔔 **Toast Notifications** - Real-time feedback for all actions
- ⚡ **Fast Performance** - Built with Vite for lightning-fast development

## 🛠️ Tech Stack

- **React 18.2** - UI library
- **Vite 5.0** - Build tool and dev server
- **React Router DOM 6.21** - Client-side routing
- **Axios** - HTTP client for API calls
- **Tailwind CSS 3.4** - Utility-first CSS framework
- **React Toastify** - Toast notifications

## 📋 Prerequisites

Before you begin, ensure you have the following installed:
- **Node.js** (v16 or higher)
- **npm** (v7 or higher)
- **Java Spring Boot Backend** running on `http://localhost:8080`

## 🚀 Getting Started

### 1. Installation

```bash
# Navigate to the frontend directory
cd event-frontend

# Install dependencies
npm install
```

### 2. Configuration

The application is pre-configured to connect to the backend at `http://localhost:8080`. If your backend runs on a different port, update the `baseURL` in `src/services/api.js`:

```javascript
const api = axios.create({
  baseURL: 'http://localhost:YOUR_PORT', // Change this
  // ...
});
```

### 3. Running the Application

```bash
# Start the development server
npm run dev
```

The application will open automatically at `http://localhost:3000`

### 4. Building for Production

```bash
# Create production build
npm run build

# Preview production build
npm run preview
```

## 📁 Project Structure

```
event-frontend/
├── public/
├── src/
│   ├── components/
│   │   ├── Navbar.jsx          # Navigation bar
│   │   ├── EventCard.jsx       # Event card component
│   │   ├── EventForm.jsx       # Reusable form component
│   │   └── Loader.jsx          # Loading spinner
│   ├── pages/
│   │   ├── Dashboard.jsx       # Home page with event list
│   │   ├── CreateEvent.jsx     # Create new event
│   │   ├── EventDetails.jsx    # View event details
│   │   └── EditEvent.jsx       # Edit existing event
│   ├── services/
│   │   └── api.js              # Axios configuration & API calls
│   ├── App.jsx                 # Main app component with routes
│   ├── main.jsx                # Application entry point
│   └── index.css               # Global styles & Tailwind
├── index.html
├── package.json
├── vite.config.js
├── tailwind.config.js
└── postcss.config.js
```

## 🔗 API Endpoints

The frontend expects the following REST API endpoints from the backend:

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/events` | Get all events |
| GET | `/events/{id}` | Get event by ID |
| POST | `/events` | Create new event |
| PUT | `/events/{id}` | Update event |
| DELETE | `/events/{id}` | Delete event |

### Expected Event Object Structure

```json
{
  "id": 1,
  "title": "Event Title",
  "description": "Event Description",
  "date": "2026-02-20",
  "time": "14:30",
  "location": "Event Location"
}
```

## 🎨 UI Components

### Navbar
- Logo with gradient effect
- Navigation links (Dashboard, Create Event)
- Active route highlighting

### EventCard
- Event title with gradient icon
- Date, time, and location display
- Description preview
- View, Edit, and Delete actions
- Smooth hover animations

### EventForm
- All required fields with validation
- Real-time error messages
- Loading states
- Reusable for Create and Edit operations

### Dashboard
- Search functionality
- Responsive grid layout
- Empty state with call-to-action
- Event count display

## 🔧 Customization

### Colors

Edit `tailwind.config.js` to customize the color scheme:

```javascript
theme: {
  extend: {
    colors: {
      primary: { ... },
      secondary: { ... }
    }
  }
}
```

### Styles

Global styles and custom utilities are in `src/index.css`

## 🐛 Troubleshooting

### Backend Connection Issues

If you see "Unable to connect to server" errors:

1. Ensure Spring Boot backend is running on `http://localhost:8080`
2. Check CORS configuration on the backend
3. Verify the API endpoints are accessible

### Build Issues

If you encounter build errors:

```bash
# Clear node_modules and reinstall
rm -rf node_modules package-lock.json
npm install
```

### PowerShell Script Execution Policy

If you encounter PowerShell execution policy errors on Windows:

```powershell
# Run PowerShell as Administrator
Set-ExecutionPolicy RemoteSigned -Scope CurrentUser
```

Or use Command Prompt instead of PowerShell.

## 📸 Screenshots

### Dashboard
- Grid layout of event cards
- Search bar for filtering
- Event count display

### Create Event
- Clean form interface
- Required field validation
- Helpful information card

### Event Details
- Comprehensive event information
- Color-coded info cards
- Edit and Delete actions

## 🚀 Deployment

### Deploying to Vercel

```bash
npm install -g vercel
vercel
```

### Deploying to Netlify

```bash
npm run build
# Upload the 'dist' folder to Netlify
```

Remember to update the API base URL for production!

## 📝 License

This project is open source and available under the MIT License.

## 👨‍💻 Developer

Created with ❤️ for Event Management

---

## 🆘 Support

If you encounter any issues or have questions:

1. Check that the backend is running
2. Verify all dependencies are installed
3. Check the browser console for errors
4. Ensure you're using a supported Node.js version

Happy Event Managing! 🎉

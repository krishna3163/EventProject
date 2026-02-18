import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Context
import { AuthProvider, useAuth } from './context/AuthContext';

// Components
import Navbar from './components/Navbar';

// Pages
import Dashboard from './pages/Dashboard';
import CreateEvent from './pages/CreateEvent';
import { ThemeProvider } from './context/ThemeContext';
import EditEvent from './pages/EditEvent';
import FaviconAnimator from './components/FaviconAnimator';
import EventDetails from './pages/EventDetails';
import ManageQuestions from './pages/ManageQuestions';
import AddQuestion from './pages/AddQuestion';
import ProblemStudio from './pages/ProblemStudio';
import QuizZone from './pages/QuizZone';
import CodeArena from './pages/CodeArena';
import QuizResult from './pages/QuizResult';
import AdminAnalytics from './pages/AdminAnalytics';
import Leaderboard from './pages/Leaderboard';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Profile from './pages/Profile';
import Certificates from './pages/Certificates';

// Protected Route Component
const ProtectedRoute = ({ children, adminOnly = false }) => {
    const { user, isAdmin, loading } = useAuth();

    if (loading) return (
        <div className="flex items-center justify-center min-h-screen">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
    );

    if (!user) return <Navigate to="/login" />;
    if (adminOnly && !isAdmin) return <Navigate to="/" />;

    return children;
};

const AppRoutes = () => {
    const { user } = useAuth();
    const location = useLocation();

    const isExamView = location.pathname.includes('/quiz/') || location.pathname.includes('/contest/');

    return (
        <div className="min-h-screen flex flex-col font-sans transition-colors duration-300">
            {!isExamView && <Navbar />}
            <main className={`flex-grow ${user && !isExamView ? 'container mx-auto px-4 py-8' : ''}`}>
                <Routes>
                    {/* Public Routes */}
                    <Route path="/login" element={<Login />} />
                    <Route path="/signup" element={<Signup />} />
                    <Route path="/forgot-password" element={<ForgotPassword />} />

                    {/* User Protected Routes */}
                    <Route path="/" element={
                        <ProtectedRoute>
                            <Dashboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/event/:id" element={
                        <ProtectedRoute>
                            <EventDetails />
                        </ProtectedRoute>
                    } />
                    <Route path="/event/:eventId/result" element={
                        <ProtectedRoute>
                            <QuizResult />
                        </ProtectedRoute>
                    } />
                    <Route path="/quiz/:eventId" element={
                        <ProtectedRoute>
                            <QuizZone />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/:id" element={
                        <ProtectedRoute>
                            <CodeArena />
                        </ProtectedRoute>
                    } />
                    <Route path="/contest/:contestId/leaderboard" element={
                        <ProtectedRoute>
                            <Leaderboard />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/profile/:userId" element={
                        <ProtectedRoute>
                            <Profile />
                        </ProtectedRoute>
                    } />
                    <Route path="/certificate/:eventId" element={
                        <ProtectedRoute>
                            <Certificates />
                        </ProtectedRoute>
                    } />

                    {/* Admin Protected Routes */}
                    <Route path="/create" element={
                        <ProtectedRoute adminOnly>
                            <CreateEvent />
                        </ProtectedRoute>
                    } />
                    <Route path="/edit/:id" element={
                        <ProtectedRoute adminOnly>
                            <EditEvent />
                        </ProtectedRoute>
                    } />
                    <Route path="/event/:eventId/analytics" element={
                        <ProtectedRoute adminOnly>
                            <AdminAnalytics />
                        </ProtectedRoute>
                    } />
                    <Route path="/event/:eventId/questions" element={
                        <ProtectedRoute adminOnly>
                            <ManageQuestions />
                        </ProtectedRoute>
                    } />
                    <Route path="/event/:eventId/add-question" element={
                        <ProtectedRoute adminOnly>
                            <AddQuestion />
                        </ProtectedRoute>
                    } />
                    <Route path="/problems" element={
                        <ProtectedRoute adminOnly>
                            <ProblemStudio />
                        </ProtectedRoute>
                    } />
                    <Route path="/organization/:id" element={
                        <ProtectedRoute>
                            <OrganizationProfile />
                        </ProtectedRoute>
                    } />

                    {/* Default Redirect */}
                    <Route path="*" element={<Navigate to="/" />} />
                </Routes>
            </main>
            <ToastContainer position="top-right" autoClose={3000} theme="colored" />
        </div>
    );
};

function App() {
    return (
        <AuthProvider>
            <ThemeProvider>
                <FaviconAnimator />
                <Router>
                    <AppRoutes />
                </Router>
            </ThemeProvider>
        </AuthProvider>
    );
}

export default App;

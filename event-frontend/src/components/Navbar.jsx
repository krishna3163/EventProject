import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 nav-blur shadow-sm border-b border-card-border transition-all duration-300">
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-blue-600 to-purple-600 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                            EventHub
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-6">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-6 mr-4">
                                    <Link
                                        to="/"
                                        className={`font-semibold transition-all duration-300 hover:text-accent-primary ${isActive('/') ? 'text-accent-primary scale-105' : 'text-text-secondary'}`}
                                    >
                                        Dashboard
                                    </Link>

                                    {isAdmin && (
                                        <>
                                            <Link
                                                to="/create"
                                                className={`font-semibold transition-all duration-300 hover:text-accent-primary ${isActive('/create') ? 'text-accent-primary scale-105' : 'text-text-secondary'}`}
                                            >
                                                Create
                                            </Link>
                                            <Link
                                                to="/problems"
                                                className={`font-semibold transition-all duration-300 hover:text-accent-secondary ${isActive('/problems') ? 'text-accent-secondary scale-105' : 'text-text-secondary'}`}
                                            >
                                                Problem Studio
                                            </Link>
                                        </>
                                    )}
                                </div>

                                <div className="h-6 w-px bg-card-border mx-2"></div>

                                {/* Theme Switcher */}
                                <ThemeSwitcher />

                                {/* User Profile & Logout */}
                                <div className="flex items-center gap-4 pl-2">
                                    <Link to="/profile" className="flex items-center gap-3 group cursor-pointer hover:bg-bg-tertiary p-2 rounded-xl transition-all">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-blue-500 to-purple-500 shadow-md flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
                                            {user.firstName ? user.firstName[0] : 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold text-text-primary leading-none group-hover:text-accent-primary transition-colors">
                                                {user.firstName}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest font-bold text-text-secondary mt-0.5">
                                                {user.role}
                                            </span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2 text-text-secondary hover:text-status-error hover:bg-status-error/10 rounded-lg transition-all duration-200"
                                        title="Logout"
                                    >
                                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <ThemeSwitcher />
                                <Link to="/login" className="font-bold text-text-secondary hover:text-accent-primary transition-colors">Login</Link>
                                <Link to="/signup" className="btn-primary">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center gap-4">
                        {/* Show ThemeSwitcher on Mobile Header too or in menu? Usually better in menu but convenient here. */}
                        {!user && <ThemeSwitcher />}
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 text-text-secondary hover:text-accent-primary transition-colors"
                        >
                            <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                {isMenuOpen ? (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                                ) : (
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                                )}
                            </svg>
                        </button>
                    </div>
                </div>
            </div>

            {/* Mobile Navigation */}
            {isMenuOpen && (
                <div className="md:hidden bg-bg-secondary border-t border-card-border px-4 py-6 space-y-4 shadow-xl animate-fade-in-down">
                    {/* Mobile Theme Switcher if needed explicitly or handle via component usage */}
                    <div className="flex justify-between items-center px-4">
                        <span className="font-bold text-text-secondary uppercase text-xs tracking-widest">Theme</span>
                        <ThemeSwitcher />
                    </div>

                    {user ? (
                        <>
                            <Link to="/" className="block py-3 px-4 font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            {isAdmin && (
                                <>
                                    <Link to="/create" className="block py-3 px-4 font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Create Event</Link>
                                    <Link to="/problems" className="block py-3 px-4 font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Problem Studio</Link>
                                </>
                            )}
                            <div className="pt-4 border-t border-card-border">
                                <Link to="/profile" className="flex items-center gap-3 px-4 py-3 hover:bg-bg-tertiary rounded-xl mb-2" onClick={() => setIsMenuOpen(false)}>
                                    <div className="w-8 h-8 rounded-full bg-accent-primary flex items-center justify-center text-white font-bold">
                                        {user.firstName ? user.firstName[0] : 'U'}
                                    </div>
                                    <span className="font-bold text-text-primary">Profile</span>
                                </Link>
                                <button
                                    onClick={() => { handleLogout(); setIsMenuOpen(false); }}
                                    className="w-full text-left py-3 px-4 font-bold text-status-error hover:bg-status-error/10 rounded-xl transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-4">
                            <Link to="/login" className="block py-3 px-4 font-bold text-text-primary hover:bg-bg-tertiary rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="block w-full text-center py-3 px-4 btn-primary" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                        </div>
                    )}
                </div>
            )}
        </nav>
    );
};

export default Navbar;


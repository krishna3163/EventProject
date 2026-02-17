import React, { useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const { theme, setTheme, themes } = useTheme();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [isThemeMenuOpen, setIsThemeMenuOpen] = useState(false);

    const isActive = (path) => location.pathname === path;

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <nav className="sticky top-0 z-50 glass-effect shadow-sm transition-all duration-300">
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
                    <div className="hidden md:flex items-center space-x-8">
                        {user ? (
                            <>
                                <Link
                                    to="/"
                                    className={`font-bold transition-all duration-300 ${isActive('/') ? 'text-blue-600 scale-105' : 'theme-text-secondary hover:text-blue-600'}`}
                                >
                                    Dashboard
                                </Link>

                                {isAdmin && (
                                    <>
                                        <Link
                                            to="/create"
                                            className={`font-bold transition-all duration-300 ${isActive('/create') ? 'text-blue-600 scale-105' : 'theme-text-secondary hover:text-blue-600'}`}
                                        >
                                            Create
                                        </Link>
                                        <Link
                                            to="/problems"
                                            className={`font-bold transition-all duration-300 ${isActive('/problems') ? 'text-purple-600 scale-105' : 'theme-text-secondary hover:text-purple-600'}`}
                                        >
                                            Problem Studio
                                        </Link>
                                    </>
                                )}

                                {/* Theme Switcher - Desktop */}
                                <div className="relative">
                                    <button
                                        onClick={() => setIsThemeMenuOpen(!isThemeMenuOpen)}
                                        className="p-2 rounded-xl theme-text-secondary hover:text-blue-600 transition-all"
                                        title="Switch Theme"
                                    >
                                        <span className="text-xl">{themes.find(t => t.id === theme)?.icon}</span>
                                    </button>

                                    {isThemeMenuOpen && (
                                        <div className="absolute top-12 right-0 w-48 theme-bg-secondary backdrop-blur-xl border border-[var(--card-border)] rounded-2xl shadow-2xl p-2 animate-fade-in flex flex-col gap-1 z-50">
                                            {themes.map(t => (
                                                <button
                                                    key={t.id}
                                                    onClick={() => { setTheme(t.id); setIsThemeMenuOpen(false); }}
                                                    className={`flex items-center space-x-3 w-full px-4 py-3 rounded-xl transition-all font-bold text-sm ${theme === t.id ? 'bg-blue-500/20 text-blue-500 shadow-sm' : 'theme-text-secondary hover:theme-bg-tertiary'}`}
                                                >
                                                    <span className="text-lg">{t.icon}</span>
                                                    <span>{t.name}</span>
                                                    {theme === t.id && <span className="ml-auto text-blue-500">✓</span>}
                                                </button>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                {/* User Profile & Logout */}
                                <div className="flex items-center space-x-6 border-l border-[var(--card-border)] pl-8">
                                    <Link to="/profile" className="flex items-center space-x-3 group cursor-pointer hover:theme-bg-tertiary p-2 rounded-2xl transition-all">
                                        <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-100 to-purple-100 border-2 border-white shadow-sm flex items-center justify-center text-blue-600 font-bold group-hover:scale-110 transition-transform">
                                            {user.firstName ? user.firstName[0] : 'U'}
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-sm font-bold theme-text-primary leading-none group-hover:text-blue-600 transition-colors">{user.firstName} {user.lastName}</span>
                                            <span className="text-[10px] uppercase tracking-widest font-extrabold text-blue-500 mt-1">{user.role}</span>
                                        </div>
                                    </Link>
                                    <button
                                        onClick={handleLogout}
                                        className="p-2.5 theme-text-secondary hover:text-red-500 hover:bg-red-500/10 rounded-xl transition-all duration-300 group"
                                        title="Logout"
                                    >
                                        <svg className="w-6 h-6 transform group-hover:translate-x-1 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                        </svg>
                                    </button>
                                </div>
                            </>
                        ) : (
                            <div className="flex items-center space-x-4">
                                <Link to="/login" className="font-bold theme-text-secondary hover:text-blue-600 transition-colors">Login</Link>
                                <Link to="/signup" className="px-6 py-2.5 bg-blue-600 text-white font-bold rounded-xl shadow-lg shadow-blue-100 hover:bg-blue-700 transition-all active:scale-95">Sign Up</Link>
                            </div>
                        )}
                    </div>

                    {/* Mobile menu button */}
                    <div className="md:hidden flex items-center">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="p-2 theme-text-secondary hover:text-blue-600 transition-colors"
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
                <div className="md:hidden theme-bg-secondary border-t border-[var(--card-border)] px-4 py-6 space-y-4 shadow-xl rounded-b-3xl">
                    {user ? (
                        <>
                            <Link to="/" className="block py-3 px-4 font-bold theme-text-primary hover:bg-blue-500/10 rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Dashboard</Link>
                            {isAdmin && (
                                <>
                                    <Link to="/create" className="block py-3 px-4 font-bold theme-text-primary hover:bg-blue-500/10 rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Create Event</Link>
                                    <Link to="/problems" className="block py-3 px-4 font-bold theme-text-primary hover:bg-purple-500/10 rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Problem Studio</Link>
                                </>
                            )}
                            <div className="pt-4 border-t border-[var(--card-border)]">
                                <button
                                    onClick={handleLogout}
                                    className="w-full text-left py-3 px-4 font-bold text-red-500 hover:bg-red-500/10 rounded-xl transition-all"
                                >
                                    Logout
                                </button>
                            </div>
                        </>
                    ) : (
                        <div className="space-y-2">
                            <Link to="/login" className="block py-3 px-4 font-bold theme-text-primary hover:bg-blue-500/10 rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Login</Link>
                            <Link to="/signup" className="block py-3 px-4 font-bold text-blue-600 hover:bg-blue-500/10 rounded-xl transition-all" onClick={() => setIsMenuOpen(false)}>Sign Up</Link>
                        </div>
                    )}

                    {/* Theme Switcher - Mobile */}
                    <div className="pt-4 border-t border-[var(--card-border)]">
                        <p className="px-4 text-xs font-bold theme-text-secondary uppercase tracking-widest mb-2">Theme</p>
                        <div className="flex px-4 gap-2 overflow-x-auto pb-2">
                            {themes.map(t => (
                                <button
                                    key={t.id}
                                    onClick={() => setTheme(t.id)}
                                    className={`flex items-center space-x-2 px-3 py-2 rounded-lg border ${theme === t.id ? 'border-blue-500 bg-blue-500/20 text-blue-500' : 'border-[var(--card-border)] theme-text-secondary'}`}
                                >
                                    <span>{t.icon}</span>
                                    <span className="text-sm font-medium">{t.name}</span>
                                </button>
                            ))}
                        </div>
                    </div>
                </div>
            )}
        </nav>
    );
};

export default Navbar;

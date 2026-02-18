import React, { useState, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import ThemeSwitcher from './ThemeSwitcher';

const Navbar = () => {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout, isAdmin } = useAuth();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    const isActive = (path) => location.pathname === path;

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Student navigation links
    const studentLinks = [
        { to: '/', label: 'Dashboard', icon: '🏠' },
        { to: '/?tab=events', label: 'Events', icon: '📋' },
        { to: '/?tab=contests', label: 'Contests', icon: '⚔️' },
        { to: '/?tab=history', label: 'My History', icon: '📈' },
        { to: '/profile', label: 'Profile', icon: '👤' },
    ];

    // Admin navigation links  
    const adminLinks = [
        { to: '/', label: 'Dashboard', icon: '🏠' },
        { to: '/create', label: 'Create Event', icon: '➕' },
        { to: '/problems', label: 'Problem Studio', icon: '💻' },
    ];

    const navLinks = user ? (isAdmin ? adminLinks : studentLinks) : [];

    return (
        <nav className={`sticky top-0 z-50 transition-all duration-500 ${scrolled
            ? 'nav-blur shadow-lg border-b border-card-border'
            : 'nav-blur shadow-sm border-b border-card-border'
            }`}>
            <div className="container mx-auto px-4">
                <div className="flex items-center justify-between h-20">
                    {/* Logo */}
                    <Link to="/" className="flex items-center space-x-3 group">
                        <div className="bg-gradient-to-br from-indigo-500 to-blue-500 p-2.5 rounded-xl shadow-lg group-hover:scale-110 transition-transform duration-300 group-hover:shadow-indigo-500/30">
                            <svg className="w-7 h-7 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                            </svg>
                        </div>
                        <span className="text-2xl font-black bg-gradient-to-r from-indigo-500 to-blue-500 bg-clip-text text-transparent">
                            EventProject
                        </span>
                    </Link>

                    {/* Desktop Navigation */}
                    <div className="hidden md:flex items-center space-x-1">
                        {user ? (
                            <>
                                <div className="flex items-center space-x-1 mr-4">
                                    {navLinks.map(link => (
                                        <Link
                                            key={link.to}
                                            to={link.to}
                                            className={`px-3 py-2 rounded-xl font-semibold text-sm transition-all duration-300 hover:bg-bg-tertiary ${isActive(link.to)
                                                ? 'text-accent-primary bg-accent-primary/10'
                                                : 'text-text-secondary hover:text-text-primary'
                                                }`}
                                        >
                                            <span className="mr-1">{link.icon}</span>
                                            {link.label}
                                        </Link>
                                    ))}
                                </div>

                                <div className="h-6 w-px bg-card-border mx-2"></div>

                                {/* Theme Switcher */}
                                <ThemeSwitcher />

                                {/* User Profile & Logout */}
                                <div className="flex items-center gap-4 pl-2">
                                    <Link to="/profile" className="flex items-center gap-3 group cursor-pointer hover:bg-bg-tertiary p-2 rounded-xl transition-all">
                                        <div className="w-9 h-9 rounded-full bg-gradient-to-br from-indigo-500 to-blue-500 shadow-md flex items-center justify-center text-white font-bold group-hover:scale-110 transition-transform">
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
                <div className="md:hidden bg-bg-secondary border-t border-card-border px-4 py-6 space-y-2 shadow-xl animate-fade-in-down">
                    {/* Mobile Theme Switcher */}
                    <div className="flex justify-between items-center px-4 mb-4">
                        <span className="font-bold text-text-secondary uppercase text-xs tracking-widest">Theme</span>
                        <ThemeSwitcher />
                    </div>

                    {user ? (
                        <>
                            {navLinks.map(link => (
                                <Link
                                    key={link.to}
                                    to={link.to}
                                    className={`block py-3 px-4 font-bold rounded-xl transition-all ${isActive(link.to)
                                        ? 'text-accent-primary bg-accent-primary/10'
                                        : 'text-text-primary hover:bg-bg-tertiary'
                                        }`}
                                    onClick={() => setIsMenuOpen(false)}
                                >
                                    <span className="mr-2">{link.icon}</span>
                                    {link.label}
                                </Link>
                            ))}

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
                                    🚪 Logout
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

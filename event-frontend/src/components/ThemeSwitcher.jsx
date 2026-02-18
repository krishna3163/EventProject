import React, { useState, useRef, useEffect } from 'react';
import { useTheme } from '../context/ThemeContext';

const ThemeSwitcher = () => {
    const { theme, setTheme, themes } = useTheme();
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    // Close on click outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    const activeTheme = themes.find(t => t.id === theme) || themes[0];

    return (
        <div className="relative" ref={dropdownRef}>
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="flex items-center gap-2 px-3 py-2 rounded-lg hover:bg-bg-tertiary transition-colors border border-transparent hover:border-card-border focus:outline-none focus:ring-2 focus:ring-accent-primary/50"
                aria-label="Switch Theme"
            >
                <span className="text-xl">{activeTheme.icon}</span>
                <span className="hidden md:block text-sm font-medium text-text-primary">{activeTheme.name}</span>
                <svg className={`w-4 h-4 text-text-secondary transition-transform duration-200 ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && (
                <div className="absolute right-0 mt-2 w-48 rounded-xl shadow-xl bg-bg-secondary border border-card-border overflow-hidden z-50 animate-fade-in-down origin-top-right ring-1 ring-black/5 focus:outline-none">
                    <div className="py-1">
                        {themes.map((t) => (
                            <button
                                key={t.id}
                                onClick={() => {
                                    setTheme(t.id);
                                    setIsOpen(false);
                                }}
                                className={`w-full flex items-center gap-3 px-4 py-2.5 text-sm transition-colors text-left
                                    ${theme === t.id ? 'bg-accent-primary/10 text-accent-primary font-semibold' : 'text-text-primary hover:bg-bg-tertiary'}
                                `}
                            >
                                <span className="text-lg">{t.icon}</span>
                                <span>{t.name}</span>
                                {theme === t.id && (
                                    <svg className="w-4 h-4 ml-auto text-accent-primary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                                    </svg>
                                )}
                            </button>
                        ))}
                    </div>
                </div>
            )}
        </div>
    );
};

export default ThemeSwitcher;

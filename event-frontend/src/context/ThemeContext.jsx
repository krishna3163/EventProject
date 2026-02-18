import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    const themes = [
        { id: 'light', name: 'Light', icon: '☀️', type: 'light' },
        { id: 'dark', name: 'Dark', icon: '🌙', type: 'dark' },
        { id: 'glass', name: 'Glass', icon: '🧊', type: 'light' },
        { id: 'cyberpunk', name: 'Cyberpunk', icon: '🤖', type: 'dark' },
        { id: 'classic', name: 'Classic', icon: '👔', type: 'light' },
    ];

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old theme classes (except 'dark' which is managed separately below)
        themes.forEach(t => {
            if (t.id !== 'dark') root.classList.remove(t.id);
        });

        // Also remove 'dark' initially to reset state
        root.classList.remove('dark');

        // Add current theme class
        // Example: class="cyberpunk dark"
        if (theme !== 'light') {
            root.classList.add(theme);
        }

        // Manage 'dark' class for Tailwind utilities
        const currentThemeObj = themes.find(t => t.id === theme);
        if (currentThemeObj?.type === 'dark') {
            root.classList.add('dark');
        }

        localStorage.setItem('theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes
    };

    return (
        <ThemeContext.Provider value={value}>
            {children}
        </ThemeContext.Provider>
    );
};

export const useTheme = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error('useTheme must be used within a ThemeProvider');
    }
    return context;
};

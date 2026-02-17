import React, { createContext, useContext, useEffect, useState } from 'react';

const ThemeContext = createContext();

export const ThemeProvider = ({ children }) => {
    // Check localStorage or system preference
    const [theme, setTheme] = useState(() => {
        const savedTheme = localStorage.getItem('theme');
        return savedTheme || 'light';
    });

    // Preset themes (optional, can just be light/dark for now but structure allows expansion)
    // For now we will stick to 'light' and 'dark' classes, but maybe 'blue-theme' etc in future
    // actually user asked for "different colour themes". 
    // Let's implement 'light', 'dark', 'midnight', 'nature'.

    useEffect(() => {
        const root = window.document.documentElement;

        // Remove old themes
        root.classList.remove('light', 'dark', 'midnight', 'nature');

        // Add new theme
        root.classList.add(theme);

        // Intelligently add 'dark' class for dark-based themes to enable Tailwind utilities
        if (theme === 'dark' || theme === 'midnight') {
            root.classList.add('dark');
        } else {
            root.classList.remove('dark');
        }

        // Persist
        localStorage.setItem('theme', theme);
    }, [theme]);

    const value = {
        theme,
        setTheme,
        themes: [
            { id: 'light', name: 'Light', icon: '☀️' },
            { id: 'dark', name: 'Dark', icon: '🌙' },
            { id: 'midnight', name: 'Midnight', icon: '🌌' },
            { id: 'nature', name: 'Forest', icon: '🍃' },
        ]
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

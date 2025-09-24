import React, { createContext, useState, useEffect, ReactNode } from 'react';

export enum Theme {
    LIGHT = 'light',
    DARK = 'dark',
}

interface ThemeContextProps {
    theme: Theme;
    toggleTheme: () => void;
}

export const ThemeContext = createContext<ThemeContextProps | undefined>(undefined);

export const ThemeProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
    const [theme, setTheme] = useState<Theme>(() => {
        const storedTheme = localStorage.getItem('theme');
        if (storedTheme) {
            return storedTheme as Theme;
        }
        // If no stored theme, check system preference
        const prefersDark = window.matchMedia && window.matchMedia('(prefers-color-scheme: dark)').matches;
        return prefersDark ? Theme.DARK : Theme.LIGHT;
    });

    useEffect(() => {
        localStorage.setItem('theme', theme);
        const root = window.document.documentElement;
        root.classList.remove(theme === Theme.LIGHT ? 'dark' : 'light');
        root.classList.add(theme);
    }, [theme]);

    const toggleTheme = () => {
        setTheme((prevTheme) => (prevTheme === Theme.LIGHT ? Theme.DARK : Theme.LIGHT));
    };

    return (
        <ThemeContext.Provider value={{ theme, toggleTheme }}>
            {children}
        </ThemeContext.Provider>
    );
};

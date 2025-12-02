import React, { createContext, useContext } from 'react';

const ThemeContext = createContext();

export const useTheme = () => useContext(ThemeContext);

export const ThemeProvider = ({ children }) => {
    const colors = {
        darkTeal: "#0a615c",
        cardBg: "#e9fbf8",
        iconBg: "#d6f4f0",
        primary: "#00bfb3",
        lightTeal: "#d7efee",
    };

    return (
        <ThemeContext.Provider value={{ colors }}>
            {children}
        </ThemeContext.Provider>
    );
};
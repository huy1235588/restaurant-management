'use client'

import { createContext, useState, ReactNode, useContext } from "react";
import { PaletteMode, Theme, createTheme, ThemeProvider as MUIThemeProvider } from "@mui/material/styles";

interface ThemeContextType {
    toggleTheme: () => void;
    mode: PaletteMode;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useThemeContext = () => {
    const context = useContext(ThemeContext);
    if (!context) {
        throw new Error("useThemeContext must be used within a ThemeProvider");
    }
    return context;
};

export const ThemeContextProvider = ({ children }: { children: ReactNode }) => {
    const [mode, setMode] = useState<PaletteMode>("dark");

    const toggleTheme = () => {
        setMode((prevMode) => (prevMode === "light" ? "dark" : "light"));
    };

    const theme: Theme = createTheme({
        palette: {
            mode: mode,
        },
    });

    return (
        <ThemeContext.Provider value={{ toggleTheme, mode }}>
            <MUIThemeProvider theme={theme}>
                {children}
            </MUIThemeProvider>
        </ThemeContext.Provider>
    );
};

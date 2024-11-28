import { useThemeContext } from "@/context/themeContext";
import { Button } from "@mui/material";
import { IoMoonOutline, IoSunnyOutline } from "react-icons/io5";

const ThemeToggleButton = () => {
    const { toggleTheme, mode } = useThemeContext();

    return (
        <Button className="theme-toggle-button"
            onClick={toggleTheme}
            startIcon={mode === "light" ? <IoMoonOutline /> : <IoSunnyOutline />}
        />
    );
};

export default ThemeToggleButton;


const THEME_KEY = "theme";


function readSavedTheme() {
    try {
        const saved = localStorage.getItem(THEME_KEY);
        if (saved === "light" || saved === "dark") {
            return saved;
        }
    } catch (error) {
        console.warn("The saved theme could not be read.", error);
    }
    return null;
}


function saveTheme(theme) {
    try {
        localStorage.setItem(THEME_KEY, theme);
    } catch (error) {
        console.warn("The theme preference could not be saved.", error);
    }
}

function getCurrentTheme() {
    return document.documentElement.dataset.theme === "light" ? "light" : "dark";
}

function getOtherTheme() {
    return getCurrentTheme() === "dark" ? "light" : "dark";
}


function updateThemeButton() {
    const button = document.querySelector("#theme-toggle");
    if (button === null) {
        return;
    }
    button.textContent = "Switch to " + getOtherTheme() + " theme";
}

function applyTheme(theme) {
    document.documentElement.dataset.theme = theme;
    updateThemeButton();
}

function toggleTheme() {
    const nextTheme = getOtherTheme();
    applyTheme(nextTheme);
    saveTheme(nextTheme);
}

function handleThemeClick() {
    const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (document.startViewTransition && !reduceMotion) {
        document.startViewTransition(toggleTheme);
    } else {
        toggleTheme();
    }
}

function setUpThemeToggle() {
    const button = document.querySelector("#theme-toggle");
    if (button === null) {
        return;
    }

    updateThemeButton();
    button.hidden = false;
    button.addEventListener("click", handleThemeClick);
}


const savedTheme = readSavedTheme();
if (savedTheme !== null) {
    document.documentElement.dataset.theme = savedTheme;
}

document.addEventListener("DOMContentLoaded", setUpThemeToggle);

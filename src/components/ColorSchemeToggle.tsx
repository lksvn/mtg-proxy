import { useEffect, useState } from "react";
import { Icon } from "./Icon";

type ColorScheme = "light" | "dark";

type ColorSchemeToggleProps = {
    labels?: Record<ColorScheme, string>;
}

const defaultLabels: Record<ColorScheme, string> = {
    light: "Use light color scheme",
    dark: "Use dark color scheme",
};

function getInitialColorScheme(): ColorScheme {
    try {
        const stored = localStorage.getItem("color-scheme");

        if (stored === "light" || stored === "dark") {
            return stored;
        }
    } catch {
        // Use the system preference if localStorage is not available.
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorSchemeToggle({ labels = defaultLabels }: ColorSchemeToggleProps) {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme);
    const nextColorScheme = colorScheme === "light" ? "dark" : "light";

    useEffect(() => {
        document.documentElement.dataset.theme = colorScheme;
        try {
            localStorage.setItem("color-scheme", colorScheme);
        } catch {
            // The theme still works for the current tab
        }
    }, [colorScheme]);

    return (
        <button
            type="button"
            className="color-scheme-toggle"
            aria-label={labels[nextColorScheme]}
            onClick={() => setColorScheme(nextColorScheme)}
        >
            <Icon name="sun-moon" />
        </button>
    );
}

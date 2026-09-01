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
    const stored = localStorage.getItem("color-scheme");

    if (stored === "light" || stored === "dark") {
        return stored;
    }

    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
}

export function ColorSchemeToggle({ labels = defaultLabels }: ColorSchemeToggleProps) {
    const [colorScheme, setColorScheme] = useState<ColorScheme>(getInitialColorScheme);
    const nextColorScheme = colorScheme === "light" ? "dark" : "light";

    useEffect(() => {
        document.documentElement.dataset.theme = colorScheme;
        localStorage.setItem("color-scheme", colorScheme);
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

import { createContext, useEffect, useState } from "react";

type Theme = "dark" | "light" | "system";

type ThemeProviderProps = {
	children: React.ReactNode;
	defaultTheme?: Theme;
	storageKey?: string;
};

type ThemeProviderState = {
	theme: Theme;
	setTheme: (theme: Theme) => void;
	resolvedTheme: "dark" | "light";
};

const initialState: ThemeProviderState = {
	theme: "system",
	setTheme: () => null,
	resolvedTheme: "dark",
};

const ThemeProviderContext = createContext<ThemeProviderState>(initialState);

export const ThemeProvider = ({
	children,
	defaultTheme = "system",
	storageKey = "luxepass-theme",
	...props
}: ThemeProviderProps) => {
	const [theme, setTheme] = useState<Theme>(
		() => (localStorage.getItem(storageKey) as Theme) || defaultTheme
	);

	const [resolvedTheme, setResolvedTheme] = useState<"dark" | "light">("dark");

	useEffect(() => {
		const root = window.document.documentElement;

		root.classList.remove("light", "dark");

		let effectiveTheme: "dark" | "light" = "dark";

		if (theme === "system") {
			const systemTheme = window.matchMedia("(prefers-color-scheme: dark)").matches
				? "dark"
				: "light";
			effectiveTheme = systemTheme;
		} else {
			effectiveTheme = theme;
		}

		root.classList.add(effectiveTheme);
		// eslint-disable-next-line react-hooks/set-state-in-effect
		setResolvedTheme(effectiveTheme);
	}, [theme]);

	useEffect(() => {
		if (theme === "system") {
			const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");

			const handleChange = (e: MediaQueryListEvent) => {
				const systemTheme = e.matches ? "dark" : "light";
				const root = window.document.documentElement;
				root.classList.remove("light", "dark");
				root.classList.add(systemTheme);
				setResolvedTheme(systemTheme);
			};

			mediaQuery.addEventListener("change", handleChange);
			return () => mediaQuery.removeEventListener("change", handleChange);
		}
	}, [theme]);

	const value = {
		theme,
		setTheme: (theme: Theme) => {
			localStorage.setItem(storageKey, theme);
			setTheme(theme);
		},
		resolvedTheme,
	};

	return (
		<ThemeProviderContext.Provider
			{...props}
			value={value}>
			{children}
		</ThemeProviderContext.Provider>
	);
};

export default ThemeProviderContext;

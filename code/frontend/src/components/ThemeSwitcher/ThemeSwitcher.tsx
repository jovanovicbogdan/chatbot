import { useEffect, useState } from 'react';
import 'highlight.js/styles/dark.css';
// import 'highlight.js/styles/a11y-dark.css';
// import 'highlight.js/styles/github.css';
// import 'highlight.js/styles/atom-one-dark.css';
// import 'highlight.js/styles/a11y-light.css';

const ThemeEnum = {
  Light: 'light',
  Dark: 'dark',
  System: 'system',
} as const;
type Theme = (typeof ThemeEnum)[keyof typeof ThemeEnum];

function ThemeSwitcher() {
  const [selectedTheme, setSelectedTheme] = useState<Theme | undefined>(
    localStorage.theme,
  );

  function toggleTheme() {
    // On page load or when changing themes, best to add inline in `head` to avoid FOUC
    document.documentElement.classList.toggle(
      ThemeEnum.Dark,
      localStorage.theme === ThemeEnum.Dark ||
        (!('theme' in localStorage) &&
          window.matchMedia('(prefers-color-scheme: dark)').matches),
    );
  }

  function enableDarkTheme() {
    localStorage.theme = ThemeEnum.Dark;
    document.documentElement.classList.add(ThemeEnum.Dark);
  }

  function enableLightTheme() {
    localStorage.theme = ThemeEnum.Light;
    document.documentElement.classList.remove(ThemeEnum.Dark);
  }

  useEffect(() => {
    toggleTheme();

    // Whenever the user explicitly chooses dark mode
    if (selectedTheme == ThemeEnum.Dark) {
      enableDarkTheme();
    }

    // Whenever the user explicitly chooses light mode
    if (selectedTheme == ThemeEnum.Light) {
      enableLightTheme();
    }

    // Whenever the user explicitly chooses to respect the OS preference
    if (selectedTheme == ThemeEnum.System) {
      localStorage.removeItem('theme');
      toggleTheme();
    }
  }, [selectedTheme]);

  return (
    <select
      className="cursor-pointer bg-background p-1 border border-gray-300 text-darkGray text-sm rounded-lg outline-0 focus:ring-salmonRed focus:border-salmonRed block dark:bg-dark-background dark:border-gray-600 dark:placeholder-gray-400 dark:text-gray-300 dark:focus:ring-salmonRed dark:focus:border-salmonRed"
      value={selectedTheme}
      onChange={e => setSelectedTheme(() => e.target.value as Theme)}
    >
      <option value="light">Light</option>
      <option value="dark">Dark</option>
      <option value="system">System</option>
    </select>
  );
}

export default ThemeSwitcher;

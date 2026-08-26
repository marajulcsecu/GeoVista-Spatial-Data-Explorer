export type AppTheme = 'dark' | 'light';

export const THEME_STORAGE_KEY = 'geovista_theme';

export function getInitialTheme(): AppTheme {
  const saved = localStorage.getItem(THEME_STORAGE_KEY) as AppTheme | null;
  if (saved === 'dark' || saved === 'light') {
    return saved;
  }
  // Default to Dark Mode for all new visitors / first open
  return 'dark';
}

export function applyTheme(theme: AppTheme): void {
  document.documentElement.setAttribute('data-theme', theme);
  document.body.setAttribute('data-theme', theme);
  localStorage.setItem(THEME_STORAGE_KEY, theme);
}

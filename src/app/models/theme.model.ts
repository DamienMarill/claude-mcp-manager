export interface ThemeConfig {
  name: string;
  value: string;
  icon?: string;
}

export const AVAILABLE_THEMES: ThemeConfig[] = [
  { name: 'Light', value: 'light', icon: '☀️' },
  { name: 'Dark', value: 'dark', icon: '🌙' },
  { name: 'Cupcake', value: 'cupcake', icon: '🧁' },
  { name: 'Cyberpunk', value: 'cyberpunk', icon: '🤖' },
  { name: 'Night', value: 'night', icon: '🌃' },
  { name: 'Synthwave', value: 'synthwave', icon: '🌊' },
  { name: 'Coffee', value: 'coffee', icon: '☕' },
  { name: 'Dracula', value: 'dracula', icon: '🧛' },
  { name: 'Retro', value: 'retro', icon: '📟' },
  { name: 'Aqua', value: 'aqua', icon: '💧' }
];
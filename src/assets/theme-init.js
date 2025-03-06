// This script sets the theme based on localStorage before rendering
(function initializeTheme() {
  const savedTheme = localStorage.getItem('claude-mcp-theme');
  if (savedTheme) {
    document.documentElement.setAttribute('data-theme', savedTheme);
  } else {
    // Default theme
    document.documentElement.setAttribute('data-theme', 'cyberpunk');
  }
})();
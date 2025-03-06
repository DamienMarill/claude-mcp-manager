const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose des API protégées à notre fenêtre de rendu Angular
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtenir la configuration
  getConfig: () => ipcRenderer.invoke('get-config'),

  // Sauvegarder la configuration
  saveConfig: (config) => ipcRenderer.invoke('save-config', config),

  // Activer/désactiver un élément depuis le tray
  toggleMcpFromTray: (data) => ipcRenderer.invoke('toggle-mcp-from-tray', data),

  // Changer le thème
  changeTheme: (theme) => ipcRenderer.invoke('change-theme', theme),

  // Ouvrir un lien externe
  openExternalLink: (url) => shell.openExternal(url),

  // Obtenir un MCP par son nom
  getMcpItemByName: (name) => {
    // Cette fonction est appelée par le processus principal
    // Elle retourne un MCP depuis le store Angular
    return window.mcpItems ? window.mcpItems.find(item => item.name === name) : null;
  },

  // Écouter les changements de configuration
  onConfigChanged: (callback) => {
    // Enlever l'écouteur précédent pour éviter les doublons
    ipcRenderer.removeAllListeners('config-changed');
    // Ajouter le nouvel écouteur
    ipcRenderer.on('config-changed', (_, data) => callback(data));
  }
});

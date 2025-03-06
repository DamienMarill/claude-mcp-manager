const { contextBridge, ipcRenderer, shell } = require('electron');

// Expose des API protégées à notre fenêtre de rendu Angular
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtenir la configuration
  getConfig: () => {
    console.log('getConfig appelé dans preload');
    return ipcRenderer.invoke('get-config');
  },

  // Sauvegarder la configuration
  saveConfig: (config) => {
    console.log('saveConfig appelé dans preload', config);
    return ipcRenderer.invoke('save-config', config);
  },

  // Activer/désactiver un élément depuis le tray
  toggleMcpFromTray: (data) => {
    console.log('toggleMcpFromTray appelé dans preload', data);
    return ipcRenderer.invoke('toggle-mcp-from-tray', data);
  },

  // Changer le thème
  changeTheme: (theme) => {
    console.log('changeTheme appelé dans preload', theme);
    return ipcRenderer.invoke('change-theme', theme);
  },

  // Ouvrir un lien externe
  openExternalLink: (url) => {
    console.log('openExternalLink appelé dans preload', url);
    return shell.openExternal(url);
  },

  // Obtenir un MCP par son nom
  getMcpItemByName: (name) => {
    console.log('getMcpItemByName appelé dans preload', name);
    // Cette fonction est appelée par le processus principal
    // Elle retourne un MCP depuis le store Angular
    return window.mcpItems ? window.mcpItems.find(item => item.name === name) : null;
  },

  // Écouter les changements de configuration
  onConfigChanged: (callback) => {
    console.log('onConfigChanged configuré dans preload');
    // Enlever l'écouteur précédent pour éviter les doublons
    ipcRenderer.removeAllListeners('config-changed');
    // Ajouter le nouvel écouteur
    ipcRenderer.on('config-changed', (_, data) => {
      console.log('config-changed reçu dans preload', data);
      callback(data);
    });
  }
});

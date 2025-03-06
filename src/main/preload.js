const { contextBridge, ipcRenderer, shell } = require('electron');

// Mode développement ou production
const isDev = process.env.NODE_ENV === 'development';

// Fonction de log conditionnelle basée sur l'environnement
const logDebug = (message, ...args) => {
  if (isDev) {
    console.log(message, ...args);
  }
};

// Expose des API protégées à notre fenêtre de rendu Angular
contextBridge.exposeInMainWorld('electronAPI', {
  // Obtenir la configuration
  getConfig: () => {
    logDebug('getConfig appelé dans preload');
    return ipcRenderer.invoke('get-config');
  },

  // Sauvegarder la configuration
  saveConfig: (config) => {
    logDebug('saveConfig appelé dans preload', config);
    return ipcRenderer.invoke('save-config', config);
  },

  // Activer/désactiver un élément depuis le tray
  toggleMcpFromTray: (data) => {
    logDebug('toggleMcpFromTray appelé dans preload', data);
    return ipcRenderer.invoke('toggle-mcp-from-tray', data);
  },

  // Changer le thème
  changeTheme: (theme) => {
    logDebug('changeTheme appelé dans preload', theme);
    return ipcRenderer.invoke('change-theme', theme);
  },

  // Ouvrir un lien externe
  openExternalLink: (url) => {
    logDebug('openExternalLink appelé dans preload', url);
    return shell.openExternal(url);
  },

  // Obtenir un MCP par son nom
  getMcpItemByName: (name) => {
    logDebug('getMcpItemByName appelé dans preload', name);
    // Cette fonction est appelée par le processus principal
    // Elle retourne un MCP depuis le store Angular
    return window.mcpItems ? window.mcpItems.find(item => item.name === name) : null;
  },

  // Écouter les changements de configuration
  onConfigChanged: (callback) => {
    logDebug('onConfigChanged configuré dans preload');
    // Enlever l'écouteur précédent pour éviter les doublons
    ipcRenderer.removeAllListeners('config-changed');
    // Ajouter le nouvel écouteur
    ipcRenderer.on('config-changed', (_, data) => {
      logDebug('config-changed reçu dans preload', data);
      callback(data);
    });
  }
});

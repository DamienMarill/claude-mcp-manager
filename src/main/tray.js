const { Tray, Menu, nativeImage, ipcMain } = require('electron');
const path = require('path');

/**
 * Configure l'icône dans la barre des tâches
 * @param {Electron.App} app - L'application Electron
 * @param {Object} configData - Les données de configuration
 * @returns {Electron.Tray} - L'objet Tray créé
 */
function setupTray(app, configData) {
  // Utiliser notre nouvelle icône de canard
  const iconPath = path.join(__dirname, '../assets/ioupioup.png');
  const trayIcon = nativeImage.createFromPath(iconPath);

  // Créer l'objet Tray
  const tray = new Tray(trayIcon);
  tray.setToolTip('Claude MCP Manager');

  // Mettre à jour le menu contextuel
  updateTrayMenu(tray, app, configData);

  // Ajouter la méthode updateMenu à l'objet tray
  tray.updateMenu = (newConfigData) => {
    updateTrayMenu(tray, app, newConfigData);
  };

  return tray;
}

/**
 * Met à jour le menu contextuel de la barre des tâches
 * @param {Electron.Tray} tray - L'objet Tray
 * @param {Electron.App} app - L'application Electron
 * @param {Object} configData - Les données de configuration
 */
function updateTrayMenu(tray, app, configData) {
  // Créer des items de menu pour chaque MCP
  const mcpItems = [];

  // Récupérer tous les MCPs (actifs et inactifs) depuis la fenêtre principale
  // Note: Cette partie n'est pas complète et sera améliorée dans la prochaine itération
  // En attendant, afficher au moins les MCPs actifs

  if (configData && configData.mcpServers) {
    Object.entries(configData.mcpServers).forEach(([name, config]) => {
      mcpItems.push({
        label: name,
        type: 'checkbox',
        checked: true, // Toujours actif s'il est dans le fichier
        click: async () => {
          // Toggle l'état du MCP
          await ipcMain.emit('toggle-mcp-from-tray', { name, enabled: false });
        }
      });
    });
  }

  const contextMenu = Menu.buildFromTemplate([
    // Liste des MCP (peut être vide au début)
    ...(mcpItems.length > 0 ? mcpItems : [{ label: 'Aucun MCP configuré', enabled: false }]),
    { type: 'separator' },
    // Actions générales
    {
      label: 'Ouvrir le gestionnaire',
      click: () => {
        tray.emit('click'); // Simuler un clic pour ouvrir la fenêtre principale
      }
    },
    { type: 'separator' },
    {
      label: 'Quitter',
      click: () => {
        app.isQuitting = true;
        app.quit();
      }
    }
  ]);

  tray.setContextMenu(contextMenu);
}

module.exports = {
  setupTray
};

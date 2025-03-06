const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { setupTray } = require('./tray');
const { loadConfigFile, saveConfigFile } = require('./config-manager');

// Désactiver l'accélération hardware - peut aider sur ARM64
app.disableHardwareAcceleration();

// Désactiver le cache persistant
app.commandLine.appendSwitch('disable-http-cache');
app.commandLine.appendSwitch('disable-gpu-shader-disk-cache');

// Chemin vers le fichier de configuration Claude
const CONFIG_PATH = path.join(
  app.getPath('appData'),
  'Claude',
  'claude_desktop_config.json'
);

let mainWindow;
let tray;
let configData = { mcpServers: {} };

function createWindow() {
  const { width, height } = screen.getPrimaryDisplay().workAreaSize;

  mainWindow = new BrowserWindow({
    width: 420,
    height: 550,
    show: false,
    frame: false, // Pas de barre de titre
    skipTaskbar: true, // Ne pas montrer dans la barre des tâches
    resizable: false,
    alwaysOnTop: false,
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false
    },
    icon: path.join(__dirname, '../assets/ioupioup.png')
  });

  // En dev, on charge l'URL du serveur Angular
  // En prod, on charge le fichier HTML buildé
  const startUrl = process.env.ELECTRON_START_URL ||
    url.format({
      pathname: path.join(__dirname, '../../dist/claude-mcp-manager/browser/index.html'),
      protocol: 'file:',
      slashes: true
    });

  mainWindow.loadURL(startUrl);

  // Positionnement dans le coin inférieur droit
  const trayPos = tray.getBounds();
  const windowPos = mainWindow.getBounds();
  const x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
  const y = Math.round(trayPos.y - windowPos.height);
  mainWindow.setPosition(x, y, false);

  // Se ferme quand on clique ailleurs
  mainWindow.on('blur', () => {
    if (mainWindow.isVisible()) {
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  // Chargement de la configuration
  try {
    configData = await loadConfigFile(CONFIG_PATH);

    // Configuration du tray d'abord (pour obtenir sa position)
    tray = setupTray(app, configData);

    // Création de la fenêtre
    createWindow();

    // Mise en place des écouteurs IPC
    setupIpcListeners();

    // Gérer le clic sur l'icône
    tray.on('click', () => {
      if (mainWindow.isVisible()) {
        mainWindow.hide();
      } else {
        // Positionner au-dessus de l'icône de la barre des tâches
        const trayPos = tray.getBounds();
        const windowPos = mainWindow.getBounds();
        const x = Math.round(trayPos.x + (trayPos.width / 2) - (windowPos.width / 2));
        const y = Math.round(trayPos.y - windowPos.height);

        mainWindow.setPosition(x, y, false);
        mainWindow.show();
      }
    });

  } catch (error) {
    console.error('Erreur au démarrage:', error);
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

app.on('activate', () => {
  if (mainWindow === null) {
    createWindow();
  }
});

app.on('before-quit', () => {
  app.isQuitting = true;
});

// Configuration des écouteurs IPC pour la communication avec Angular
function setupIpcListeners() {
  // Récupérer la configuration
  ipcMain.handle('get-config', () => {
    return configData;
  });

  // Enregistrer la configuration
  ipcMain.handle('save-config', async (event, newConfig) => {
    try {
      await saveConfigFile(CONFIG_PATH, newConfig);
      configData = newConfig;

      // Mettre à jour le menu du tray
      if (tray) {
        tray.updateMenu(configData);
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors de la sauvegarde:', error);
      return { success: false, error: error.message };
    }
  });

  // Toggle un MCP depuis le tray
  ipcMain.handle('toggle-mcp-from-tray', async (event, { name, enabled }) => {
    try {
      // Mettre à jour la configuration
      if (configData && configData.mcpServers) {
        if (enabled) {
          // Si on active, on s'assure que l'élément existe dans le fichier
          if (!configData.mcpServers[name]) {
            // Récupérer l'élément depuis la liste en mémoire
            const mcpItems = mainWindow.webContents.executeJavaScript(`
              window.electronAPI.getMcpItemByName("${name}")
            `);
            if (mcpItems && mcpItems.config) {
              configData.mcpServers[name] = mcpItems.config;
            }
          }
        } else {
          // Si on désactive, on supprime du fichier
          if (configData.mcpServers[name]) {
            delete configData.mcpServers[name];
          }
        }

        // Enregistrer la configuration
        await saveConfigFile(CONFIG_PATH, configData);

        // Notifier l'interface Angular
        mainWindow.webContents.send('config-changed', configData);

        // Mettre à jour le menu
        if (tray) {
          tray.updateMenu(configData);
        }
      }

      return { success: true };
    } catch (error) {
      console.error('Erreur lors du toggle depuis le tray:', error);
      return { success: false, error: error.message };
    }
  });

  // Changer le thème
  ipcMain.handle('change-theme', async (event, theme) => {
    // Ici on pourrait enregistrer le thème dans une configuration persistante
    return { success: true };
  });
}

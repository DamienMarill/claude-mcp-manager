const { app, BrowserWindow, ipcMain, screen } = require('electron');
const path = require('path');
const fs = require('fs');
const url = require('url');
const { setupTray } = require('./tray');
const { loadConfigFile, saveConfigFile } = require('./config-manager');

// Mode développement ou production
const isDev = process.env.NODE_ENV === 'development';

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
    show: false, // Caché au démarrage, affiché après le chargement
    frame: false,
    skipTaskbar: true,
    resizable: false,
    alwaysOnTop: false,
    backgroundColor: '#1E293B',
    webPreferences: {
      preload: path.join(__dirname, 'preload.js'),
      contextIsolation: true,
      nodeIntegration: false,
      webSecurity: false,
      devTools: true // Garder la possibilité d'ouvrir les DevTools, mais ne pas les ouvrir automatiquement
    }
  });

  // Chemin absolu vers le fichier index.html
  const indexPath = path.join(__dirname, '../../dist/claude-mcp-manager/browser/index.html');

  // Vérifier si le fichier existe
  if (fs.existsSync(indexPath)) {
    console.log('Le fichier index.html trouvé.');
  } else {
    console.log('ERREUR: Le fichier index.html n\'existe pas!');
  }

  // Charger le fichier HTML directement par son chemin de fichier absolu
  mainWindow.loadFile(indexPath);

  // Afficher la fenêtre une fois que tout est chargé
  mainWindow.webContents.on('did-finish-load', () => {
    mainWindow.show();
  });

  // Gérer les erreurs de chargement
  mainWindow.webContents.on('did-fail-load', (event, errorCode, errorDescription) => {
    console.error('Erreur de chargement:', errorCode, errorDescription);
    mainWindow.webContents.loadURL('data:text/html;charset=utf-8,<h1>Erreur de chargement</h1><p>' + errorDescription + '</p>');
    mainWindow.show(); // Montrer la fenêtre même en cas d'erreur
  });

  // Se ferme quand on clique ailleurs
  mainWindow.on('blur', () => {
    if (!mainWindow.isDevToolsOpened() && mainWindow.isVisible()) {
      mainWindow.hide();
    }
  });

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.on('ready', async () => {
  try {
    // Chargement de la configuration
    configData = await loadConfigFile(CONFIG_PATH);

    // Configuration du tray d'abord
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
    return { success: true };
  });
}

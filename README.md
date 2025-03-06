# Claude MCP Manager

<p align="center">
  <img src="src/assets/icon-duck.svg" width="100" alt="Claude MCP Manager Logo"/>
</p>

<p align="center">
  Un gestionnaire de Model Context Protocol pour Claude Desktop sous Windows
</p>

<p align="center">
  <b>Version actuelle: 1.0.1</b>
</p>

## 📋 Description

Claude MCP Manager est une application légère qui se loge dans la barre système de Windows et permet de gérer facilement les MCPs (Model Context Protocol) pour Claude Desktop. Les MCPs sont des serveurs qui apportent des fonctionnalités supplémentaires à Claude, comme la recherche web, l'intégration avec des outils de développement, et bien plus encore.

Cette application permet de:
- Ajouter, éditer et supprimer des MCPs
- Activer/désactiver des MCPs sans modifier manuellement le fichier de configuration
- Personnaliser l'interface avec différents thèmes
- Gérer les variables d'environnement pour les MCPs

## 🚀 Installation

### Prérequis
- Windows 10/11
- [Claude Desktop](https://claude.ai/desktop)

### Installation depuis l'exécutable portable
1. Téléchargez la dernière version portable depuis la section [Releases](https://github.com/votre-username/claude-mcp-manager/releases)
2. Exécutez le fichier `ClaudeMCPManager.exe`
3. L'application apparaîtra dans la barre système de Windows

### Installation depuis les sources
```bash
# Cloner le dépôt
git clone https://github.com/votre-username/claude-mcp-manager.git
cd claude-mcp-manager

# Installer les dépendances
npm install

# Construire l'application
npm run build

# Lancer l'application
npm run electron-only

# OU utiliser le script de reconstruction
.\rebuild-run.bat
```

### Créer un exécutable portable
```bash
.\build-release.bat
```

## 🔧 Utilisation

1. Lancez l'application - une icône apparaît dans la barre système (tray)
2. Cliquez sur l'icône pour ouvrir le gestionnaire
3. Ajoutez, modifiez ou supprimez des MCPs selon vos besoins
4. Les changements sont automatiquement appliqués au fichier de configuration de Claude

### Ajouter un MCP

Pour ajouter un nouveau MCP, cliquez sur le bouton "Ajouter un MCP" et remplissez les champs suivants:
- **Nom**: Identifiant unique du MCP (ex: "github")
- **Commande**: La commande à exécuter (ex: "npx")
- **Arguments**: Les arguments de la commande (un par ligne)
- **Variables d'environnement**: (Optionnel) Variables nécessaires au MCP

### Exemples de MCPs courants

#### GitHub MCP
```
Nom: github
Commande: npx
Arguments: 
-y
@modelcontextprotocol/server-github

Variables d'environnement:
GITHUB_PERSONAL_ACCESS_TOKEN: votre_token_github
```

#### DuckDuckGo Search MCP
```
Nom: ddg-search
Commande: uvx
Arguments:
duckduckgo-mcp-server
```

#### Windows CLI MCP
```
Nom: windows-cli
Commande: npx
Arguments:
-y
@simonb97/server-win-cli
```

## 🎨 Thèmes

L'application propose plusieurs thèmes via DaisyUI. Cliquez sur l'icône d'engrenage en haut à droite pour changer de thème.

## 📁 Fichier de configuration

Le fichier géré par l'application se trouve à l'emplacement suivant:
```
%AppData%\Claude\claude_desktop_config.json
```

## 🛠️ Développement

### Structure du projet
- `src/main/`: Code Electron (processus principal)
- `src/app/`: Code Angular (interface utilisateur)
- `src/assets/`: Ressources statiques

### Scripts disponibles
- `npm start`: Lance l'application Angular en mode développement
- `npm run build`: Compile l'application Angular
- `npm run electron`: Lance Electron seul
- `npm run electron-dev`: Compile Angular puis lance Electron
- `.\rebuild-run.bat`: Nettoie, reconstruit et lance l'application
- `.\build-release.bat`: Crée un exécutable portable

## 📝 Licence

MIT

## 👤 Auteur

[Marill](https://marill.dev)

---

*Fait avec 💖 et beaucoup de café 🍙*

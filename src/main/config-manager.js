const fs = require('fs').promises;
const path = require('path');

/**
 * Charge le fichier de configuration
 * @param {string} configPath - Chemin vers le fichier de configuration
 * @returns {Promise<Object>} - Objet de configuration
 */
async function loadConfigFile(configPath) {
  try {
    // Vérifier si le fichier existe
    await fs.access(configPath);

    // Lire et parser le fichier JSON
    const rawData = await fs.readFile(configPath, 'utf8');
    return JSON.parse(rawData);
  } catch (error) {
    if (error.code === 'ENOENT') {
      // Si le fichier n'existe pas, créer un fichier vide
      console.log('Fichier de configuration non trouvé, création d\'un nouveau fichier');
      await createEmptyConfigFile(configPath);
      return { mcpServers: {} };
    }

    // Pour les autres erreurs, les propager
    throw new Error(`Erreur lors du chargement de la configuration: ${error.message}`);
  }
}

/**
 * Crée un fichier de configuration vide
 * @param {string} configPath - Chemin vers le fichier de configuration
 */
async function createEmptyConfigFile(configPath) {
  try {
    // S'assurer que le répertoire existe
    const dirPath = path.dirname(configPath);
    await fs.mkdir(dirPath, { recursive: true });

    // Créer un fichier avec la structure de base
    await fs.writeFile(configPath, JSON.stringify({ mcpServers: {} }, null, 2), 'utf8');
  } catch (error) {
    throw new Error(`Erreur lors de la création du fichier de configuration: ${error.message}`);
  }
}

/**
 * Enregistre la configuration dans le fichier
 * @param {string} configPath - Chemin vers le fichier de configuration
 * @param {Object} configData - Données de configuration à enregistrer
 */
async function saveConfigFile(configPath, configData) {
  try {
    // S'assurer que les données ont la bonne structure
    if (!configData.mcpServers) {
      configData = { mcpServers: {} };
    }

    // Convertir les données en JSON avec une indentation de 2 espaces pour la lisibilité
    const jsonData = JSON.stringify(configData, null, 2);

    // Écrire les données dans le fichier
    await fs.writeFile(configPath, jsonData, 'utf8');
  } catch (error) {
    throw new Error(`Erreur lors de l'enregistrement de la configuration: ${error.message}`);
  }
}

module.exports = {
  loadConfigFile,
  saveConfigFile
};

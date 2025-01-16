const fs = require('fs');
const path = require('path');
const { shell } = require('electron');
const { getScriptsPath, getSettingsPath } = require('./pathResolver.js');
const { parseMetadata } = require('./metadataParser.js');
const { runScript } = require('./scriptRunner.js');
const { cloneGitRepo } = require('./syncGitRepo.js');

/** Function to handle reading and parsing JSON files */
function parseJSON(filePath) {
  try {
    const fileData = fs.readFileSync(filePath, 'utf-8');
    return JSON.parse(fileData);
  } catch (error) {
    console.error(`Error reading ${filePath}:`,);
    throw new Error('Error reading or parsing file.');
  }
}

module.exports = (ipcMain) => {
  /** Handle metadata requests from React */
  ipcMain.handle('get-scripts-metadata', async () => {
    const filePath = path.join(getScriptsPath(), 'scripts-metadata.json');
    try {
      return parseJSON(filePath);
    } catch (error) {
      console.error('Error getting scripts-metadata.json:', error);
      throw new Error('Failed to read scripts-metadata.json.');
    }
  });

  /** Handle custom metadata requests from React */
  ipcMain.handle('get-custom-metadata', async () => {
    const filePath = path.join(getScriptsPath(), 'custom-metadata.json');
    try {
      return parseJSON(filePath);
    } catch (error) {
      console.error('Error getting custom-metadata.json:', error);
      throw new Error('Failed to read custom-metadata.json.');
    }
  })

  /** Handle parsing metadata from script repos */
  ipcMain.handle('parse-metadata', async (event, repoName) => {
    const folderPath = path.join(getScriptsPath(), repoName);
    try {
      console.log('Parsing metadata:', folderPath);
      await parseMetadata(folderPath);
      return 'Metadata parsed successfully.';
    } catch (error) {
      console.error('Error parsing metadata:', error);
      throw new Error('Failed to parse metadata.');
    }
  });

  /**Handle running scripts from renderer with supplied commands/parameters */
  ipcMain.handle('run-script', async (event, scriptPath, parameters) => {
    try {
      const result = await runScript(scriptPath, parameters);
      return result;
    } catch (error) {
      console.error('Error running script:', error);
      throw new Error('Failed to run script.');
    }
  });

  /** Handle opening file explorer at Scripts Path */
  ipcMain.handle('open-scripts-folder', async () => {
    try {
      await shell.openPath(getScriptsPath());
      return 'Scripts path opened successfully.';
    } catch (error) {
      console.error('Error opening path', getScriptsPath(), ':', error);
      throw new Error('Failed to open scripts path successfully.');
    }
  });

  /** Handle saving settings data to settings.json */
  ipcMain.handle('save-settings', async (event, settingsData) => {
    console.log('settingsData:', settingsData);
    try {
      await fs.promises.writeFile(getSettingsPath(), settingsData);
      console.log('Successfully saved settings.json to', getSettingsPath());
      return 'Settings saved successfully.';
    } catch (error) {
      console.error ('Error saving settings.json', getSettingsPath(), ':', error);
      throw new Error('Failed to save settings.');
    }
  });

  /** Handle getting settings data from settings.json to React */
  ipcMain.handle('get-settings', async () => {
    try {
      const fileData = await fs.promises.readFile(getSettingsPath(), 'utf-8');
      return JSON.parse(fileData);
    } catch (error) {
      console.log('Error trying to get settings:', error);
      throw new Error('Failed to get settings.');
    }
  });

  /** Handle Github Repo Sync */
  ipcMain.handle('clone-git-repo', async (event, repoUrl) => {
    const repoName = repoUrl.split('/').pop();
    try {
      await cloneGitRepo(repoUrl, path.join(getScriptsPath(), repoName)); // Await directly
      console.log(`Successfully cloned ${repoName}`);
      return `Successfully cloned ${repoName}`;
    } catch (error) {
      console.error("Error setting up repo cloning:", error);
      throw new Error('Failed to clone repo.');
    }
  });
};
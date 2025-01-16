const { contextBridge, ipcRenderer } = require('electron');

contextBridge.exposeInMainWorld('api', {
    getScriptsMetadata: async () => await ipcRenderer.invoke('get-scripts-metadata'),
    getCustomMetadata: async () => await ipcRenderer.invoke('get-custom-metadata'),
    parseMetadata: async (repoName) => await ipcRenderer.invoke('parse-metadata', repoName),
    runScript: async (scriptPath, parameters) => await ipcRenderer.invoke('run-script', scriptPath, parameters),
    openScriptsFolder: async () => await ipcRenderer.invoke('open-scripts-folder'),
    saveSettings: async (settingsData) => await ipcRenderer.invoke('save-settings', settingsData),
    getSettings: async () => await ipcRenderer.invoke('get-settings'),
    cloneGitRepo: async (repoUrl) => await ipcRenderer.invoke('clone-git-repo', repoUrl),
});
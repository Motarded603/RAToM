const { app, BrowserWindow, ipcMain } = require('electron');
const fs = require('fs');
const path = require('path');
const { isDev } = require('./util.js');
const { getPreloadPath, getScriptsPath } = require('./pathResolver.js');
const ipcHandlers = require('./ipcHandlers.js');

function createWindow() {
  const win = new BrowserWindow({
    width: 768,
    height: 576,
    icon: path.join(app.getAppPath(), 'ratom.ico'),
    webPreferences: {
      preload: getPreloadPath(),
    },
  });

  if (isDev()) {
    win.loadURL('http://localhost:5123'); // For Local Dev use
  } else {
    win.loadFile(path.join(app.getAppPath(), 'dist-react', 'index.html')); // For Production use
  }

  win.setResizable(false);  // Don't allow window to resize

  if (!fs.existsSync(getScriptsPath())) {
    console.log('Path', getScriptsPath(), 'does not exist. Creating directory now...');
    fs.mkdirSync(getScriptsPath());
    console.log('Path', getScriptsPath(), 'has been created successfully!')
  }
}

app.whenReady().then(() => {
  createWindow();

  // Register IPC Handlers
  ipcHandlers(ipcMain);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('windows-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

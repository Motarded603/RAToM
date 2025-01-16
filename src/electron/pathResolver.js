const path = require('path');
const { app } = require('electron');
const { isDev } = require('./util.js');

function getRootPath() {
  return path.join(app.getAppPath(),
    isDev() ? '.' : '..')
}

function getPreloadPath() {
  return path.join(
    getRootPath(),
    'src', 'electron', 'preload.js'
  );
}

function getSettingsPath() {
  return path.join(
    getRootPath(),
    'settings.json'
  );
}

function getScriptsPath() {
  return path.join(
    getRootPath(),
    'scripts'
  );
}

module.exports = { getRootPath, getPreloadPath, getSettingsPath, getScriptsPath };
import React, { useState, useEffect } from 'react';
import { VscSave, VscChromeClose } from 'react-icons/vsc';
import Tooltip from '@mui/material/Tooltip';
import Switch from 'react-switch';

function SettingsMenu({ settings, setSettings, onClose }) {
  const [customMDSetting, setCustomMDSetting] = useState(settings.custommetadata);

  // Effect to save settings when customMDSetting changes
  useEffect(() => {
    handleSaving();
  }, [customMDSetting]); // 

  const onCustomMDSettingChange = async (checked) => {
    setCustomMDSetting(checked);
  }

  /** Handle Settings Menu Close (minimize settings) */
  const handleClose = (event) => {
    event.stopPropagation();
    onClose(); // Close the settings menu by calling the passed function from Electron
  };

  /** Handle Saving Settings by passing settings to Electron */
  const handleSaving = async () => {
    const trimmedSettings = {
      ...settings,
      githubrepos: (settings.githubrepos || []).filter(item => item.trim() !== ""), // Remove empty lines
      custommetadata: customMDSetting,
    };
    console.log('Passing the following settings to electron to be saved:', trimmedSettings);
    setSettings(trimmedSettings);

    await window.api.saveSettings(JSON.stringify(trimmedSettings, null, 2));
  }

  /** Handle text change in the textarea */
  const handleGithubRepoInputChange = (e) => {
    const value = e.target.value;
    // Update the state without any manipulation, directly from the textarea input
    setSettings({
      ...settings,
      githubrepos: value.split('\n') // Keep the text as-is, and split only by newlines
    });
  }

  return (
      <div className="App-internal-window-background">
        <div className="App-internal-window">
          <p className="App-settings-item-title">App Settings:</p>
          <div className="App-settings-item">
            <p className="App-settings-item-title">Github Repository List</p>
            <hr className="App-script-item-hr"></hr>
            <textarea
              className="App-settings-textfield"
              id="github-repos"
              type="text"
              placeholder="https://github.com/[username]/[repo-name]/"
              value={(settings.githubrepos || []).join('\n')} // Join all repos with newline to display them
              onChange={handleGithubRepoInputChange} // Handle changes without additional transformations
            />
            <Tooltip title="Save">
              <span id="App-settings-btn-minimize">
                <VscSave
                  className="App-btn-icon"
                  onClick={handleSaving}
                />
              </span>
            </Tooltip>
          </div>
          <div className="App-settings-item">
            <p className="App-settings-item-title">Custom Metadata JSON</p>
            <Tooltip title="Enable Custom Metadata">
              <span id="custom-md-setting">
                <Switch
                  className="App-switch"
                  checked={customMDSetting}
                  onChange={onCustomMDSettingChange}
                />
              </span>
            </Tooltip>
          </div>
          <Tooltip title="Close Settings">
            <span id="App-settings-btn-minimize">
              <VscChromeClose 
                className="App-btn-icon"
                onClick={handleClose}
              />
            </span>
          </Tooltip>
        </div>
      </div>
    );
}

export default SettingsMenu;
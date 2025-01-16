import './App.css';
import React, { useState, useEffect } from 'react';
import { VscSync, VscFolder, VscSettings } from "react-icons/vsc";
import { Scrollbars } from 'rc-scrollbars';
import Tooltip from '@mui/material/Tooltip';
import ScriptItem from './components/ScriptItem.jsx';
import ScriptConsole from './components/ScriptConsole.jsx';
import SettingsMenu from './components/SettingsMenu.jsx';

function App() {
  const [metadata, setMetadata] = useState([]);                                             // Store the Script metadata 
  const [settings, setSettings] = useState([]);                                             // Store the App Settings
  const [scriptOutput, setScriptOutput] = useState("");                                     // Store the script output
  const [isConsoleVisibile, setConsoleVisibile] = useState(false);                          // Track console visibility
  const [scriptError, setScriptError] = useState("");                                       // Store the script error message if the script
  const [isSettingsVisible, setSettingsVisible] = useState(false);                          // Track settings visibility
  const scrollColorStyle = { backgroundColor: 'rgba(98, 105, 119, 0.8)', width: '6px' };  // Custom scrollbar color and width

  /** Initialize and Fetch Application Data */
  const initializeApp = async () => {
    let tmpSettings = [];         // Temp Variable for Settings data
    let tmpScriptsMetadata = [];  // Temp Variable for Scripts Metadata
    let tmpCustomMetadata = [];   // Temp Variable for Custom Metadata

    console.log('Initializing and Fetching Application Data...');
    
    // Fetch Settings data from Electron and pass to setSettings()
    try {
      tmpSettings = await window.api.getSettings();
      await setSettings(tmpSettings);
      console.log('Settings loaded to application:', tmpSettings);
    } catch (settingsErr) {
      console.error('Error loading settings:', settingsErr);
    }

    // Tell Electron to Parse Metadata based on synced repos
    try {
      for (const repoUrl of tmpSettings.githubrepos) {
        const repoName = repoUrl.split('/').pop();
        await window.api.parseMetadata(repoName);
      }
    } catch (parseMDErr) {
      console.error('Error loading scripts-metadata:', parseMDErr);
    }

    // Fetch Scripts Metadata from Electron and assign it to temp variable
    try {
      tmpScriptsMetadata = await window.api.getScriptsMetadata();
      console.log('Scripts Metadata loaded to application', tmpScriptsMetadata);
    } catch (metadataErr) {
      console.error('Error loading scripts-metadata:', metadataErr);
    }

    // Fetch Custom Metadata from Electron and assign it to temp variable
    try {
      tmpCustomMetadata = await window.api.getCustomMetadata();
      console.log('Custom Metadata loaded to application:', tmpCustomMetadata);
    } catch (metadataErr) {
      console.error('Error loading custom-metadata:', metadataErr);
    }
    
    let mergedMetadata = [...tmpScriptsMetadata, ...tmpCustomMetadata];

    // Check tmpSettings.custommetadata to see if user has opted to enable
    // custom-metadata.json, if so pass merged metadata to setMetadata()
    // if disabled, pass only scripts metadata to setMetadata()
    (tmpSettings.custommetadata) ? setMetadata(mergedMetadata) : setMetadata(tmpScriptsMetadata);
  }
  
  /** Call on openScriptsFolder from Electron */
  const openScriptsFolder = async () => {
    try {
      await window.api.openScriptsFolder();
    } catch (error) {
      console.error("Error opening scripts path:", error);
    }
  }

  /** Handle Cloning Github Repos */
  const syncRepos = async () => {
    console.log('Passing Electron each Github URL to sync, settings.githubrepos:', settings.githubrepos)
    // Send each repo URL to Electron to clone or pull
    await Promise.all(
      settings.githubrepos.map(async (repoUrl) => {
        console.log(`Sending ${repoUrl} to Electron for cloning/updating...`);
        await window.api.cloneGitRepo(repoUrl); // Send each repo URL to Electron
      })
    );
    await initializeApp();
  }
  
  /** Initial load of metadata at launch */
  useEffect(() => {
    initializeApp();
  }, []);

  /** Make Script Console visible and display output */
  const openScriptConsole = (output, errorMessage = "") => {
    setScriptOutput(output); // Set the output of the script
    setScriptError(errorMessage); // Set the error message of the script if any
    setConsoleVisibile(true); // Make the console visible at script runtime
  };

  /** Handle Settings Close */
  const closeSettings = () => {
    setSettingsVisible(false);
    initializeApp();
  };

  return (
    <div className="App">
      <header className="App-header">
        <img src="ratom512.png" className="App-logo" alt="logo" />
        <h1 className="App-title">RAToM - Repository of Admin Tools on the Move</h1>
        <Tooltip title="Open Scripts Folder">
          <span>
            <VscFolder
              className="App-btn-icon"
              id="App-header-btn"
              onClick={((openScriptsFolder))}
            />
          </span>
        </Tooltip>
        <Tooltip title="Settings">
          <span>
            <VscSettings
              className="App-btn-icon"
              id="App-header-btn"
              onClick={() => setSettingsVisible(true)}
            />
          </span>
        </Tooltip>
        <Tooltip title="Sync Repos">
          <span>
            <VscSync 
              className="App-btn-icon"
              id="App-header-btn"
              onClick={((syncRepos))}
            />
          </span>
        </Tooltip>
      </header>
      <div className="App-content">
        {/** Pass the script output, error message, and function to close console, to ScriptConsole */}
        {isConsoleVisibile && (
          <ScriptConsole
            output={scriptOutput}
            errorMessage={scriptError}
            onClose={() => setConsoleVisibile(false) } // Pass the close handler
          />
        )}
        {/** Pass function to close settings menu, to SettingsMenu */}
        {isSettingsVisible && (
          <SettingsMenu
            settings={settings}
            setSettings={setSettings}
            onClose={((closeSettings))} // Pass the close handler
            // onSaveSettings={loadMetadata}
            />
        )}
        <Scrollbars
          autoHide
          style={{ width: 750, height: 410 }}
          renderThumbVertical={({style, ...props }) => (
            <div {...props} style={{ ...style, ...scrollColorStyle }} />
          )}
        >
          <div className="App-scripts">
            {/* Print out Script Items according to metadata list */}
            {metadata.map((script, index) => (
              <ScriptItem 
                key={script.name}
                {...script}
                onRunScript={openScriptConsole} // Pass function to handle script execution
              />
            ))}
          </div>
        </Scrollbars>
      </div>
    </div>
  );
}

export default App;
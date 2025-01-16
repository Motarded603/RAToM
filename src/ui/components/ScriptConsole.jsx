import React from 'react';
import { VscChromeClose } from 'react-icons/vsc';
import { Scrollbars } from 'rc-scrollbars';
import Tooltip from '@mui/material/Tooltip';

function ScriptConsole({ output, errorMessage, onClose }) {
  const scrollColorStyle = { backgroundColor:'rgba(98, 105, 119, 0.8)', width: '6px' }; // Custom scrollbar color

  /** Button Event to handle Script Console Close (minimize console) */
  const btnHandleItemClose = (event) => {
    event.stopPropagation(); // Prevent the event from propagating to the parent div
    onClose(); // Close the console by calling the passed function from Electron
  };

  return (
    <div className="App-internal-window-background">
      <div className="App-internal-window">
        <div className="App-script-console-window-output">
          <Scrollbars 
            autoHide
            style={{ width: 720, height: 274}}
            renderThumbVertical={({style, ...props }) => (
              <div {...props} style={{ ...style, ...scrollColorStyle }} />
            )}
          >
            <pre>{output || "No output available."}</pre>
            {errorMessage && <pre className="App-script-console-error">Error: {errorMessage}</pre>}
          </Scrollbars>
        </div>
            <Tooltip title="Close Console">
              <span id="App-script-console-btn-minimize">
                <VscChromeClose 
                  className="App-btn-icon"
                  onClick={btnHandleItemClose}
                />
              </span>
            </Tooltip>
      </div>
    </div>
  );
}

export default ScriptConsole;
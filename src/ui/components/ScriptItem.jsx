import React, { useState, useRef, useEffect } from 'react';
import { VscChromeClose, VscPlayCircle } from "react-icons/vsc";
import Tooltip from '@mui/material/Tooltip';

/** Function for displaying each Script as Individual Item in GUI */
function ScriptItem({ name, description, parameters, filePath, fileName, onRunScript }) {
  const [isExpanded, setisExpanded] = useState(false); // Keep track if Script Item is expanded or not

  /** Initialize `formData` as a constant with each parameter and empty value associated */
  const initialFormData = parameters.reduce((accumulator, parameter) => {
      accumulator[parameter.name] = ''; // Initialize each aprameter with an empty string
      return accumulator;
  }, {});

  const [formData, setFormData] = useState(initialFormData); // Use the initial form data
  const contentRef = useRef(null); // Create a reference to the content div
  const [contentHeight, setContentHeight] = useState(0); // Track the content height

  /** Update the content height when the component is rendered or expanded */
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(contentRef.current.scrollHeight); // Get the actual height of the content
    }
  }, [isExpanded]); // Recalculate when the expanded state changes

  /** Button Event to handle Running the Script with given Params */
  const btnHandleScriptRun = async (event) => {
    event.stopPropagation();

    // Log formData for diag
    console.log("FormData:", formData); 

    // Construct the command string
    let scriptPath = filePath + "\\" + fileName;
    let formattedParameters = [];

    // Retrieve data from Parameters Form and add to `formData`
    parameters.forEach(param => {
      const value = formData[param.name];
      console.log("Parameter:", param.name, "Value:", value); // Log each parameter
      if (value) {
        formattedParameters.push(`-${param.name}`, value); // Add the parameter to the new array
      }
    });

    // Log the full command
    console.log("Run this command:", scriptPath, ...formattedParameters);

    // Invoke Child Process to run script
    try {
      const output = await window.api.runScript(scriptPath, formattedParameters);
      console.log("Output:", output); // Print Output from running the Script
      onRunScript((scriptPath.toString(), output.toString())); // Pass the output to App.js
    } catch (error) {
      console.error("Script execution failed:", error) // Print Error from running the Script
      onRunScript("", (scriptPath, error.message)); // Pass the error message to App.js
    }
  }

  /** Event to handle Parameter Input updates formData with new
   * data, while preserving previous state for other parameters */
  const handleInputChange = (event) => {
    event.stopPropagation();
    const { id, value } = event.target;
    setFormData(prevState => ({
      ...prevState,
      [id]:value
    }));
  };

  /** Button Event to handle Script Item Close (minimize description) */
  const btnHandleItemClose = (event) => {
    event.stopPropagation(); // Prevent the event from propagating to the parent div
    setisExpanded(prevState => !prevState); // Change button state to opposite state
    
    setFormData(initialFormData); // Reset `formData` back to its empty state after close
  }

  return (
    <div 
      className="App-script-item"
      onClick={() => setisExpanded(true)}
    >
      <p className="App-script-item-title">{name}</p>
      <hr className="App-script-item-hr"></hr>
      <p className="App-script-item-desc">{description}</p>
      
      {/* Add transition on the wrapper and use dynamic height */}
      <div
        className="App-script-item-md"
        ref={contentRef}
        style={{
          maxHeight: isExpanded ? `${contentHeight}px` : '0', // Dynamic height transition
          overflow: 'hidden',
          transition: 'max-height 0.3s ease-out',
        }}
      >
        <hr className="App-script-item-hr" />
          {/* Horizontal line added after clicking */}
          <hr className="App-script-item-hr" />
          
          {/* Form and table to display input fields for script parameters */}
          <form>
            <table>
              <tbody>
                {parameters.map((parameter, index) => (
                  <tr key={parameter.name}>
                    <td>
                      {parameter.name}
                    </td>
                    <td>
                      <input
                        className="App-script-item-md-param"
                        id={parameter.name}
                        type="text"
                        placeholder={parameter.example}
                        value={formData[parameter.name]} // Bind input value to formData
                        onChange={handleInputChange} // Update state on input change
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </form>

          {/* Action buttons for script */}
          <Tooltip title="Run Script">
            <span id="App-script-item-md-btn-run">
              <VscPlayCircle 
                className="App-btn-icon"
                onClick={btnHandleScriptRun}
              />
            </span>
          </Tooltip>
          <Tooltip title="Close Script Details">
            <span id="App-script-item-md-btn-minimize">
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

export default ScriptItem;
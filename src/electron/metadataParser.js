const fs = require('fs');
const path = require('path');
const { getScriptsPath } = require('./pathResolver.js');

function parseMetadata(scriptsFolder) {

  let scriptFiles = [];
  // Check that scriptsFolder exists before proceeding
  if (fs.existsSync(scriptsFolder)) {
    // Read all .ps1 files in the directory
    scriptFiles = fs.readdirSync(scriptsFolder).filter(file => file.endsWith('.ps1'));
  } else {
    return null;
  }

  // Extract metadata from PowerShell script
  const extractMetadata = (scriptContent, fileName) => {
      const notesMatch = scriptContent.match(/\.NOTES\s*\{([\s\S]*?)\}\s*#>/); // Regex to extract the NOTES block

      if (!notesMatch) return null;

      try {
          // Metadata inside the NOTES block should be valid JSON
          const notesContent = notesMatch[1].trim();
          // console.log("Raw Content: ", notesContent);
          const metadata = JSON.parse('{' + notesContent + '}'); // Parse the JSON string

          // Include the script file name in the metadata
          metadata.metadata.fileName = fileName; // Add the file name to the metadata
          metadata.metadata.filePath = scriptsFolder; // Add the filePath to the metadata

          return metadata.metadata;
      } catch (error) {
          console.error('Error parsing metadata:', error);
          return null;
      }
  };

  // Read all script files and extract metadata
  const metadataList = scriptFiles.map(file => {
      const scriptPath = path.join(scriptsFolder, file);
      const scriptContent = fs.readFileSync(scriptPath, 'utf-8');
      return extractMetadata(scriptContent, file);
  }).filter(metadata => metadata !== null);  // Filter out any null values

  // console.log("Raw JSON data:", metadataList);

  // Save the extracted metadata into a JSON file
  const outputPath = path.join(getScriptsPath(), 'scripts-metadata.json');
  fs.writeFileSync(outputPath, JSON.stringify(metadataList, null, 2));

  console.log('Metadata has been written to:', outputPath);
}

module.exports = { parseMetadata };
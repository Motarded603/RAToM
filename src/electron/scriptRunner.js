const { spawn } = require('child_process');
const { isDev } = require('./util.js');

function runScript(scriptPath, parameters) {
  console.log("Running PowerShell script with command:", scriptPath, parameters);
    console.log("scriptPath", scriptPath);
    console.log("parameters", parameters);

    return new Promise((resolve, reject) => {
      const process = spawn('powershell.exe', ['-File', scriptPath, ...parameters]);

      let stdoutData = '';
      let stderrData = '';

      // Capture standard output
      process.stdout.on('data', (data) => {
        stdoutData += data.toString();
        if (isDev()) { // Log only in dev mode
          console.log(`stdout: ${data}`);
        }
      });

      // Capture standard error
      process.stderr.on('data', (data) => {
        stderrData += data.toString();
        if (isDev()) { // Log only in dev mode
          console.error(`stderr: ${data}`);
        }
      });

      // Handle process exit
      process.on('close', (code) => {
        console.log(`PowerShell process exited with code ${code}`);
        if (code === 0) {
          resolve(stdoutData); // Return stdout data to renderer
        } else {
          reject(stderrData || `Process exited with code ${code}`); // Return error details
        }
      });

      // Handle process spawn errors (e.g., invalid command)
      process.on('error', (error) => {
        console.error('Failed to start PowerShell process:', error);
        reject(`Failed to start PowerShell process: ${error.message}`);
      });
    });
}

module.exports = { runScript };
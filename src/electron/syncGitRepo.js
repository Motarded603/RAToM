const fs = require('fs');
const simpleGit = require('simple-git');
const git = simpleGit();

async function cloneGitRepo(repoUrl, localDir) {
  try {
    if (!fs.existsSync(localDir)) {
      await git.clone(repoUrl, localDir);
      console.log('Repository cloned successfully!', repoUrl);
    } else {
      await git.cwd(localDir).pull();
      console.log('Repository updated successfully!', repoUrl);
    }
  } catch (error) {
    console.error('Error occurred while handling the repository:', repoUrl, ':', error);
  }
}

module.exports = { cloneGitRepo };
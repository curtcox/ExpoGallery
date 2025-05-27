const fs = require('fs');
const path = require('path');
const { prepareFirebaseDir } = require('./prepareFirebaseDir');

function run(buildArtifactName, buildOutputDirName, versionJsonRelativePath) {
  const artifactDir = path.join('downloaded-artifact', buildArtifactName);
  const sourceDir = path.join(artifactDir, buildOutputDirName);
  const destDir = 'site/public';

  console.log(`Preparing Firebase directory`);
  console.log(`- Artifact directory: ${artifactDir}`);
  console.log(`- Build output directory: ${buildOutputDirName}`);
  console.log(`- Source directory resolved to: ${sourceDir}`);

  if (fs.existsSync(artifactDir)) {
    const entries = fs.readdirSync(artifactDir);
    console.log(`Contents of artifact directory (${artifactDir}): ${entries.join(', ')}`);
  } else {
    console.log(`Artifact directory does not exist: ${artifactDir}`);
    process.exit(1);
  }

  prepareFirebaseDir(sourceDir, destDir, versionJsonRelativePath);
}

if (require.main === module) {
  const [,, artifactName, buildDir, versionRel] = process.argv;
  try {
    run(artifactName, buildDir, versionRel);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { run };

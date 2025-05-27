const fs = require('fs');
const path = require('path');
const { prepareFirebaseDir } = require('./prepareFirebaseDir');

function run(buildArtifactName, buildOutputDirName, versionJsonRelativePath) {
  const baseDir = 'downloaded-artifact';
  const destDir = 'site/public';

  const candidateDirs = [
    path.join(baseDir, buildArtifactName),
    path.join(baseDir, 'ExpoGallery'),
    baseDir,
  ];

  console.log('Preparing Firebase directory');
  console.log(`- Build artifact name: ${buildArtifactName}`);
  console.log(`- Build output directory: ${buildOutputDirName}`);
  console.log('- Checking candidate directories for build output...');

  let artifactDir;
  for (const dir of candidateDirs) {
    const exists = fs.existsSync(dir);
    console.log(`  ${dir} ${exists ? 'exists' : 'missing'}`);
    if (exists) {
      const entries = fs.readdirSync(dir);
      console.log(`    entries: ${entries.join(', ')}`);
      if (fs.existsSync(path.join(dir, buildOutputDirName))) {
        artifactDir = dir;
        break;
      }
    }
  }

  if (!artifactDir) {
    throw new Error(`Unable to locate ${buildOutputDirName} in any expected directory`);
  }

  const sourceDir = path.join(artifactDir, buildOutputDirName);
  console.log(`- Using source directory: ${sourceDir}`);

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

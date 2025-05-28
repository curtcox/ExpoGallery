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

  let sourceDir;
  if (artifactDir) {
    sourceDir = path.join(artifactDir, buildOutputDirName);
    console.log(`- Using source directory: ${sourceDir}`);
  } else {
    const potentialRootPath = baseDir;
    console.log(`- ${buildOutputDirName} not found as subdirectory. Checking if ${potentialRootPath} is the build output directory.`);
    if (fs.existsSync(path.join(potentialRootPath, versionJsonRelativePath))) {
      sourceDir = potentialRootPath;
      console.log(`- Treating ${potentialRootPath} as the build output directory.`);
    } else {
      throw new Error(
        `Unable to locate ${buildOutputDirName} in any expected directory, and ${potentialRootPath} does not appear to be it either (missing ${versionJsonRelativePath}).`
      );
    }
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

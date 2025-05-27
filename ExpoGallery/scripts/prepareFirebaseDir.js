const fs = require('fs');
const path = require('path');

function prepareFirebaseDir(sourceDir, destDir, versionJsonRelativePath = 'public/version.json') {
  if (!fs.existsSync(sourceDir)) {
    throw new Error(`Source directory ${sourceDir} does not exist`);
  }
  fs.mkdirSync(destDir, { recursive: true });
  // Copy contents of sourceDir into destDir
  fs.cpSync(sourceDir, destDir, { recursive: true });
  const expectedPath = path.join(destDir, versionJsonRelativePath);
  console.log(`Expected version.json at: ${expectedPath}`);
  if (!fs.existsSync(expectedPath)) {
    throw new Error(`version.json not found at ${expectedPath}`);
  }
}

module.exports = { prepareFirebaseDir };

if (require.main === module) {
  const [,, src, dest, versionRel] = process.argv;
  try {
    prepareFirebaseDir(src, dest, versionRel);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

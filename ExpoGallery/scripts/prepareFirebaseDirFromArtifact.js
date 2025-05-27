const { prepareFirebaseDir } = require('./prepareFirebaseDir');

function run(buildOutputDirName, versionJsonRelativePath) {
  const sourceDir = `downloaded-artifact/${buildOutputDirName}`;
  const destDir = 'site/public';
  prepareFirebaseDir(sourceDir, destDir, versionJsonRelativePath);
}

if (require.main === module) {
  const [,, buildDir, versionRel] = process.argv;
  try {
    run(buildDir, versionRel);
  } catch (err) {
    console.error(err.message);
    process.exit(1);
  }
}

module.exports = { run };

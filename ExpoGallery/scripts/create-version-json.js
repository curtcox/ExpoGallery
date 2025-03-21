const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// File paths
const appConfigPath = path.join(__dirname, '..', 'app.config.js');
const versionJsonPath = path.join(__dirname, '..', 'public', 'version.json');

try {
  // Get app config (this loads the environment variables automatically)
  const appConfig = require(appConfigPath);

  // Get version info - fail if missing
  const appVersion = appConfig.expo.version;
  if (!appVersion) {
    throw new Error('App version is missing in app.config.js');
  }

  const buildDate = new Date().toISOString();
  const gitSha = process.env.GITHUB_SHA || 'development';

  // Create version.json
  const versionData = {
    version: appVersion,
    buildDate: buildDate,
    build: gitSha
  };

  // Create directories if needed
  const dirPath = path.dirname(versionJsonPath);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
  }

  // Write the file
  fs.writeFileSync(versionJsonPath, JSON.stringify(versionData, null, 2));
  console.log(`Successfully generated version.json:`);
  console.log(`- Version: ${appVersion}`);
  console.log(`- Build Date: ${buildDate}`);
  console.log(`- Git SHA: ${gitSha}`);
} catch (err) {
  console.error('\n\x1b[41m\x1b[37m ERROR GENERATING VERSION.JSON \x1b[0m');
  console.error('\x1b[31m' + err.message + '\x1b[0m\n');
  process.exit(1);
}
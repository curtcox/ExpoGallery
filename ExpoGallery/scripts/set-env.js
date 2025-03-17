const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// File paths
const appJsonPath = path.join(__dirname, '..', 'app.json');
const aboutFilePath = path.join(__dirname, '..', 'app', 'about.tsx');
const versionJsonPath = path.join(__dirname, '..', 'public', 'version.json');

// Read app.json
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Helper functions
function updateAppConfig(key, envKey, defaultValue = '') {
  const value = process.env[envKey] || defaultValue;
  appJson.expo.extra[key] = value;
  return value;
}

function replaceInFile(filePath, replacements) {
  let content = fs.readFileSync(filePath, 'utf8');
  for (const [placeholder, value] of Object.entries(replacements)) {
    content = content.replace(new RegExp(placeholder, 'g'), value);
  }
  fs.writeFileSync(filePath, content);
}

function writeJsonFile(filePath, data) {
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
}

// Update app.json configuration
const googleMapsApiKey = updateAppConfig('googleMapsApiKey', 'EXPO_PUBLIC_GOOGLE_MAPS_API_KEY');
const chatApiEndpoint = updateAppConfig('chatApiEndpoint', 'EXPO_PUBLIC_CHAT_API_ENDPOINT', 'http://54.147.61.224:5000/chat');
const defaultChatLocation = updateAppConfig('defaultChatLocation', 'EXPO_PUBLIC_DEFAULT_CHAT_LOCATION', '9yzey5mxsb');

// Write updated app.json
writeJsonFile(appJsonPath, appJson);

// Get build metadata
const buildDate = new Date().toISOString();
const formattedDate = `${buildDate.split('T')[0]} ${buildDate.split('T')[1].substring(0, 8)}`;
const gitSha = process.env.GITHUB_SHA || 'development';

// Update about.tsx with build info
replaceInFile(aboutFilePath, {
  '__GIT_SHA__': gitSha,
  '__BUILD_DATE__': formattedDate
});

// Update version.json
const appVersion = appJson.expo.version || '0.0.1';
writeJsonFile(versionJsonPath, {
  version: appVersion,
  buildDate: formattedDate,
  build: gitSha
});

// Log results
console.log(`Environment variables set successfully.`);
console.log(`App Version: ${appVersion}, Git SHA: ${gitSha}, Build Date: ${formattedDate}`);
console.log(`Google Maps API Key: ${googleMapsApiKey ? '********' + googleMapsApiKey.slice(-4) : 'Not set'}`);
console.log(`Chat API Endpoint: ${chatApiEndpoint}`);
console.log(`Default Chat Location: ${defaultChatLocation}`);
console.log(`Version.json updated.`);
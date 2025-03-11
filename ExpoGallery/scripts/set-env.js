const fs = require('fs');
const path = require('path');
require('dotenv').config({ path: '.env.local' });

// Read the app.json file
const appJsonPath = path.join(__dirname, '..', 'app.json');
const appJson = JSON.parse(fs.readFileSync(appJsonPath, 'utf8'));

// Replace the placeholder with the actual API key
const googleMapsApiKey = process.env.EXPO_PUBLIC_GOOGLE_MAPS_API_KEY || '';
appJson.expo.extra.googleMapsApiKey = googleMapsApiKey;

// Write the updated app.json file
fs.writeFileSync(appJsonPath, JSON.stringify(appJson, null, 2));

// Get the current date and time for build timestamp
const buildDate = new Date().toISOString();
const formattedDate = `${buildDate.split('T')[0]} ${buildDate.split('T')[1].substring(0, 8)}`;

// Replace the Git SHA placeholder in the about.tsx file
const gitSha = process.env.GITHUB_SHA || 'development';
const aboutFilePath = path.join(__dirname, '..', 'app', 'about.tsx');
let aboutFileContent = fs.readFileSync(aboutFilePath, 'utf8');
aboutFileContent = aboutFileContent.replace('__GIT_SHA__', gitSha.substring(0, 7));

// Replace the build date placeholder
aboutFileContent = aboutFileContent.replace('__BUILD_DATE__', formattedDate);

fs.writeFileSync(aboutFilePath, aboutFileContent);

console.log(`Environment variables set successfully. Git SHA: ${gitSha.substring(0, 7)}, Build Date: ${formattedDate}`);
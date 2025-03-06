/**
 * This script directly patches the LocationEventEmitter in the node_modules directory
 * to fix the "removeSubscription is not a function" error.
 *
 * Run this with: node scripts/patch-location-emitter.js
 */

const fs = require('fs');
const path = require('path');

// Paths to the files that need patching
const targetPaths = [
  // Main target - this is the one causing the error
  'node_modules/@teovilla/react-native-web-maps/node_modules/expo-location/build/LocationSubscribers.js',
];

// Function to patch a file
function patchFile(filePath) {
  try {
    // Check if file exists
    if (!fs.existsSync(filePath)) {
      console.error(`File does not exist: ${filePath}`);
      return false;
    }

    // Read the file content
    let content = fs.readFileSync(filePath, 'utf8');

    // Look for the problematic code
    const targetCode = 'LocationEventEmitter.removeSubscription(this.eventSubscription);';

    // If the target code doesn't exist, no need to patch
    if (!content.includes(targetCode)) {
      console.log(`Target code not found in: ${filePath}`);
      return false;
    }

    // Replace with our safer version
    const patchedCode = `
      // Patched to avoid "removeSubscription is not a function" error
      if (LocationEventEmitter.removeSubscription) {
        LocationEventEmitter.removeSubscription(this.eventSubscription);
      } else if (this.eventSubscription && typeof this.eventSubscription.remove === 'function') {
        this.eventSubscription.remove();
      }
    `;

    // Apply the patch
    const patchedContent = content.replace(targetCode, patchedCode);

    // Write the patched content back to the file
    fs.writeFileSync(filePath, patchedContent, 'utf8');

    console.log(`Successfully patched: ${filePath}`);
    return true;
  } catch (error) {
    console.error(`Error patching ${filePath}:`, error);
    return false;
  }
}

// Apply the patch to all target files
function applyPatches() {
  console.log('Starting Location Event Emitter patch...');

  let successCount = 0;

  for (const targetPath of targetPaths) {
    if (patchFile(targetPath)) {
      successCount++;
    }
  }

  console.log(`Patch completed. Successfully patched ${successCount}/${targetPaths.length} files.`);
}

// Run the patch
applyPatches();
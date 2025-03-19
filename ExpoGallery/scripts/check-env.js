/**
 * Script to verify all required environment variables are present
 */
const path = require('path');
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') });

// Required environment variables
const REQUIRED_VARS = [
  'GOOGLE_MAPS_API_KEY',
  'CHAT_API_ENDPOINT',
  'DEFAULT_CHAT_LOCATION'
];

// Check if all required variables are present
const missingVars = REQUIRED_VARS.filter(varName => {
  const value = process.env[varName];
  return !value || value === 'undefined';
});

// Output results
if (missingVars.length === 0) {
  console.log('\x1b[42m\x1b[30m ENVIRONMENT CHECK PASSED \x1b[0m');
  console.log('All required environment variables are present in .env.local');

  // Show actual values for verification
  console.log('\nFound values:');
  REQUIRED_VARS.forEach(varName => {
    const value = process.env[varName];
    // Mask API keys for security
    const displayValue = varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`- ${varName}: ${displayValue}`);
  });
} else {
  console.error('\n\x1b[41m\x1b[37m ENVIRONMENT CHECK FAILED \x1b[0m');
  console.error(`\x1b[31mMissing required environment variables:\x1b[0m`);
  missingVars.forEach(varName => {
    console.error(`- ${varName}`);
  });
  console.error('\n\x1b[33mPlease add these variables to your .env.local file\x1b[0m\n');
  process.exit(1);
}
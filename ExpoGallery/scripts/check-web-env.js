/**
 * Node.js script to check web-specific environment variables
 * Used during build and development to ensure all required variables are present
 */

// Required environment variables for web builds
const REQUIRED_WEB_VARS = [
  'EXPO_PUBLIC_BASE_URL', // Base URL for web deployment
  'CHAT_API_ENDPOINT',
  'DEFAULT_CHAT_LOCATION',
  'GOOGLE_MAPS_API_KEY'
];

// Check if all required variables are present
const missingVars = REQUIRED_WEB_VARS.filter(varName => {
  const value = process.env[varName];
  return !value || value === 'undefined';
});

// Output results
if (missingVars.length === 0) {
  console.log('\x1b[42m\x1b[30m WEB ENVIRONMENT CHECK PASSED \x1b[0m');
  console.log('All required web environment variables are present in .env.local');

  // Show actual values for verification
  console.log('\nFound values:');
  REQUIRED_WEB_VARS.forEach(varName => {
    const value = process.env[varName];
    // Mask API keys for security
    const displayValue = varName.includes('KEY') || varName.includes('SECRET')
      ? `${value.substring(0, 4)}...${value.substring(value.length - 4)}`
      : value;
    console.log(`- ${varName}: ${displayValue}`);
  });
} else {
  console.error('\n\x1b[41m\x1b[37m WEB ENVIRONMENT CHECK FAILED \x1b[0m');
  console.error(`\x1b[31mMissing required web environment variables:\x1b[0m`);
  missingVars.forEach(varName => {
    console.error(`- ${varName}`);
  });
  console.error('\n\x1b[33mPlease add these variables to your .env.local file\x1b[0m\n');
  process.exit(1);
}

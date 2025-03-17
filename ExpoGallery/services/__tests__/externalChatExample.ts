/**
 * Example file showing how to use the externalChatService with the API endpoint
 *
 * This is not a test file, but can be run directly to demonstrate the API interaction
 * Run using: npx ts-node services/__tests__/externalChatExample.ts
 */

import { fetchExternal } from '../externalChatService';
import { defaultProfile } from '../../storage/profile';
import { ChatContext } from '../localBot';

// Set up a sample context
const exampleContext: ChatContext = {
  timestamp: new Date(),
  userProfile: defaultProfile,
  resources: [],
  // We can either provide a location
  location: {
    latitude: 38.6270,
    longitude: -90.1994,
  },
  // Or use the default location code '9yzey5mxsb' by not setting a location
};

// Example messages to send
const exampleMessages = [
  'Food?',
  'Where can I find shelter?',
  'I need medical assistance'
];

/**
 * Run example API call for each message
 */
async function runExampleCalls() {
  console.log('Running example calls to the external chat API\n');

  for (const message of exampleMessages) {
    console.log(`Sending message: "${message}"`);

    try {
      const response = await fetchExternal(message, exampleContext);
      console.log('Received response:');
      console.log(response);
      console.log('---------------------------------------------------\n');
    } catch (error) {
      console.error('Error making API call:');
      console.error(error);
    }
  }

  // Example without providing location (will use default '9yzey5mxsb')
  console.log('Sending message without location:');
  try {
    const contextWithoutLocation = { ...exampleContext, location: undefined };
    const response = await fetchExternal('Food?', contextWithoutLocation);
    console.log('Received response (using default location):');
    console.log(response);
  } catch (error) {
    console.error('Error making API call:');
    console.error(error);
  }
}

// Run the example if this file is executed directly
if (require.main === module) {
  runExampleCalls()
    .then(() => console.log('Done!'))
    .catch(console.error);
}
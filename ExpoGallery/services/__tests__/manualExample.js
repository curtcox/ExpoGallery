/**
 * Simple manual example showing how to use the external chat API directly
 * Run using: node services/__tests__/manualExample.js
 */

const CHAT_API_ENDPOINT = 'http://54.147.61.224:5000/chat';

/**
 * Fetches a response from the external API
 */
async function fetchFromExternal(message, locationId) {
  try {
    const response = await fetch(CHAT_API_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        message: message,
        location: locationId
      }),
    });

    if (!response.ok) {
      throw new Error(`API request failed with status ${response.status}`);
    }

    const data = await response.json();
    return data;
  } catch (e) {
    console.error('Error:', e.message);
    throw e;
  }
}

/**
 * Run example API call
 */
async function runExample() {
  console.log('Running example call to the external chat API\n');

  // Using the same location ID from the curl example
  const locationId = '9yzey5mxsb';
  const message = 'Food?';

  console.log(`Sending message: "${message}" with location: ${locationId}`);

  try {
    const response = await fetchFromExternal(message, locationId);
    console.log('\nReceived response:');
    console.log(JSON.stringify(response, null, 2));
  } catch (error) {
    console.error('Failed to fetch response:', error);
  }
}

// Run the example
runExample()
  .then(() => console.log('\nDone!'))
  .catch(console.error);
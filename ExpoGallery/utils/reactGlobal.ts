import React from 'react';

// Ensure React is available globally for static rendering
// @ts-ignore
if (typeof global.React === 'undefined') {
  // @ts-ignore
  global.React = React;
}

export default React;
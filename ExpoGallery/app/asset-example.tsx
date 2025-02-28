import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { info, error } from '../utils/logger';

export default function Example() {
  const [contents, setContents] = useState('');

  useEffect(() => {
    const loadContent = async () => {
      try {
        info('Loading asset example file contents');
        const source = await require('../assets/json/stuff.json');
        const contents = JSON.stringify(source);
        info(`Required ${contents}`);
        info('Downloading');
        setContents(contents);
      } catch (e) {
        error('Error loading file contents:', e);
        setContents(`Error loading file contents ${e}`);
      }
    };

    loadContent();
  }, []);

  return (
    <ThemedText>{contents}</ThemedText>
  );
}
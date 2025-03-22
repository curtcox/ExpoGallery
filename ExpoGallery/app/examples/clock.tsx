import React, { useEffect, useState } from 'react';
import { ThemedText } from '@/components/ThemedText';
import { info, error } from '@/utils/logger';

export default function Example() {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);

    info('Clock component mounted');

    return () => {
      clearInterval(timer);
      info('Clock component unmounted');
    };
  }, []);

  const formatDateTime = (date: Date) => {
    const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];
    const dayOfWeek = days[date.getDay()];
    const formattedTime = date.toLocaleTimeString('en-US', {
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true
    });
    const formattedDate = date.toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });

    return `${dayOfWeek}, ${formattedDate}\n${formattedTime}`;
  };

  return (
    <ThemedText style={{ textAlign: 'center', fontSize: 20 }}>
      {formatDateTime(currentDateTime)}
    </ThemedText>
  );
}
'use client';
import { useEffect, useState } from 'react';

export default function ClientPayoutCount() {
  const [count, setCount] = useState(0);

  useEffect(() => {
    try {
      const stored = localStorage.getItem('drPayouts');
      if (stored) {
        const parsed = JSON.parse(stored);
        setCount(Array.isArray(parsed) ? parsed.length : 0);
      }
    } catch (e) {
      console.error("Failed to parse drPayouts", e);
    }
  }, []);

  return <>{count}</>;
}

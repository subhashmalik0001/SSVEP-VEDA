'use client';

import { useEffect, useState } from 'react';
import { Clock as ClockIcon } from 'lucide-react';

export function Clock() {
  const [time, setTime] = useState<string>('');

  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setTime(now.toLocaleTimeString('en-US', {
        hour12: false,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit'
      }));
    };

    updateTime();
    const interval = setInterval(updateTime, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="text-sm text-gray-500 flex items-center gap-2">
      <ClockIcon className="h-4 w-4" />
      {time}
    </div>
  );
} 
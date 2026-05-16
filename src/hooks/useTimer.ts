import { useEffect, useRef, useState } from 'react';

export function useTimer(isRunning: boolean, startTime: number | null) {
  const [time, setTime] = useState(0);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  useEffect(() => {
    if (isRunning && startTime) {
      intervalRef.current = setInterval(() => {
        setTime(Math.floor((Date.now() - startTime) / 1000));
      }, 100);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, startTime]);

  useEffect(() => {
    if (!isRunning) {
      setTime(0);
    }
  }, [isRunning]);

  return time;
}

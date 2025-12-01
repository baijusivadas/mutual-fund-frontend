import { useEffect, useRef } from 'react';

interface UseIdleTimeoutOptions {
  onIdle: () => void;
  idleTime?: number; // in milliseconds
}

export const useIdleTimeout = ({ onIdle, idleTime = 15 * 60 * 1000 }: UseIdleTimeoutOptions) => {
  const timeoutId = useRef<NodeJS.Timeout>();

  const resetTimer = () => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
    }

    timeoutId.current = setTimeout(() => {
      onIdle();
    }, idleTime);
  };

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart', 'click'];

    // Reset timer on user activity
    events.forEach((event) => {
      document.addEventListener(event, resetTimer);
    });

    // Start the initial timer
    resetTimer();

    // Cleanup
    return () => {
      if (timeoutId.current) {
        clearTimeout(timeoutId.current);
      }
      events.forEach((event) => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [idleTime, onIdle]);
};

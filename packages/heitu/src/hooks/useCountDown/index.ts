import { useCallback, useEffect, useRef, useState } from 'react';

const useCountDown = (): [number, (num?: number) => void, () => void] => {
  const [seconds, setSeconds] = useState<number>(0);
  const timerRef = useRef<ReturnType<typeof setTimeout>>(undefined);

  const stopCountDown = useCallback(() => {
    if (timerRef.current) {
      clearTimeout(timerRef.current);
      timerRef.current = undefined;
    }
  }, []);

  const startCountDown = useCallback(
    (num?: number) => {
      stopCountDown();
      if (num) {
        setSeconds(num);
      } else {
        setSeconds((prev) => prev - 1);
      }
    },
    [stopCountDown],
  );

  useEffect(() => {
    if (seconds <= 0) {
      stopCountDown();
      return;
    }
    timerRef.current = setTimeout(() => {
      setSeconds((prev) => prev - 1);
    }, 1000);
    return () => stopCountDown();
  }, [seconds, stopCountDown]);

  return [seconds, startCountDown, stopCountDown];
};

export default useCountDown;

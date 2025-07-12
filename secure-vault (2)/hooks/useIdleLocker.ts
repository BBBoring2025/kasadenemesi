import { useEffect, useRef } from 'react';

/**
 * A custom hook that triggers a callback function after a specified period of inactivity.
 * @param onIdle The function to call when the user is idle.
 * @param idleTimeSeconds The number of seconds of inactivity before `onIdle` is called.
 * @param enabled Whether the idle timer is active.
 */
export const useIdleLocker = (onIdle: () => void, idleTimeSeconds: number, enabled: boolean = true) => {
    const timeoutId = useRef<number | undefined>(undefined);

    const resetTimer = () => {
        if (timeoutId.current) {
            window.clearTimeout(timeoutId.current);
        }
        timeoutId.current = window.setTimeout(onIdle, idleTimeSeconds * 1000);
    };

    useEffect(() => {
        if (!enabled) {
            if (timeoutId.current) {
                window.clearTimeout(timeoutId.current);
            }
            return;
        }

        const events: (keyof WindowEventMap)[] = ['mousemove', 'mousedown', 'keypress', 'scroll', 'touchstart'];
        
        const handleEvent = () => {
            resetTimer();
        };

        events.forEach(event => window.addEventListener(event, handleEvent, { passive: true }));
        resetTimer(); // Start the timer on mount or when enabled

        return () => {
            events.forEach(event => window.removeEventListener(event, handleEvent));
            if (timeoutId.current) {
                window.clearTimeout(timeoutId.current);
            }
        };
    }, [onIdle, idleTimeSeconds, enabled]);
};

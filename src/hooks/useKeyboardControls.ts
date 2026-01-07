// hooks/useKeyboardControls.ts
'use client';

import { useState, useEffect } from 'react';

export interface KeyboardControls {
  forward: boolean;
  backward: boolean;
  left: boolean;
  right: boolean;
  space: boolean;
  shift: boolean;
  arrowUp: boolean;
  arrowDown: boolean;
  arrowLeft: boolean;
  arrowRight: boolean;
  r: boolean;
}

export function useKeyboardControls(): KeyboardControls {
  const [keys, setKeys] = useState<KeyboardControls>({
    forward: false,
    backward: false,
    left: false,
    right: false,
    space: false,
    shift: false,
    arrowUp: false,
    arrowDown: false,
    arrowLeft: false,
    arrowRight: false,
    r: false,
  });

  useEffect(() => {
    const keyDownHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        forward: key === 'w',
        backward: key === 's',
        left: key === 'a',
        right: key === 'd',
        space: e.code === 'Space',
        shift: e.shiftKey,
        arrowUp: e.key === 'ArrowUp',
        arrowDown: e.key === 'ArrowDown',
        arrowLeft: e.key === 'ArrowLeft',
        arrowRight: e.key === 'ArrowRight',
        r: key === 'r',
      }));
    };

    const keyUpHandler = (e: KeyboardEvent) => {
      const key = e.key.toLowerCase();
      
      setKeys(prev => ({
        ...prev,
        forward: key === 'w' ? false : prev.forward,
        backward: key === 's' ? false : prev.backward,
        left: key === 'a' ? false : prev.left,
        right: key === 'd' ? false : prev.right,
        space: e.code === 'Space' ? false : prev.space,
        shift: e.shiftKey ? false : prev.shift,
        arrowUp: e.key === 'ArrowUp' ? false : prev.arrowUp,
        arrowDown: e.key === 'ArrowDown' ? false : prev.arrowDown,
        arrowLeft: e.key === 'ArrowLeft' ? false : prev.arrowLeft,
        arrowRight: e.key === 'ArrowRight' ? false : prev.arrowRight,
        r: key === 'r' ? false : prev.r,
      }));
    };

    window.addEventListener('keydown', keyDownHandler);
    window.addEventListener('keyup', keyUpHandler);

    return () => {
      window.removeEventListener('keydown', keyDownHandler);
      window.removeEventListener('keyup', keyUpHandler);
    };
  }, []);

  return keys;
}
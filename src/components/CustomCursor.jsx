import { useEffect } from 'react';

const CustomCursor = ({ enabled = true }) => {
  useEffect(() => {
    // If explicitly disabled, always remove custom cursor
    if (!enabled) {
      document.documentElement.classList.remove('cursor-enabled');
      return;
    }

    document.documentElement.classList.add('cursor-enabled');

    return () => {
      document.documentElement.classList.remove('cursor-enabled');
    };
  }, [enabled]);

  return null;
};

export default CustomCursor;
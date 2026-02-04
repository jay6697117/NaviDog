import { useCallback, useRef } from 'react';

type EffectType = 'success' | 'error';

interface UseFlashEffectReturn {
  triggerFlash: (type: EffectType) => void;
  ref: React.RefObject<HTMLDivElement>;
}

export const useFlashEffect = (): UseFlashEffectReturn => {
  const ref = useRef<HTMLDivElement>(null);

  const triggerFlash = useCallback((type: EffectType) => {
    const element = ref.current;
    if (!element) return;

    const className = type === 'success' ? 'effect-success-flash' : 'effect-error';

    // Remove existing animation class
    element.classList.remove('effect-success-flash', 'effect-error');

    // Force reflow
    void element.offsetWidth;

    // Add animation class
    element.classList.add(className);

    // Remove after animation completes
    const duration = type === 'success' ? 600 : 400;
    setTimeout(() => {
      element.classList.remove(className);
    }, duration);
  }, []);

  return { triggerFlash, ref };
};

export default useFlashEffect;

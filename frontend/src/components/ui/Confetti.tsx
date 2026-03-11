import { useCallback } from 'react';
import confetti from 'canvas-confetti';

const BRAND_COLORS = ['#0066FF', '#7C3AED', '#22D3EE', '#10B981', '#F59E0B'];

export function fireConfetti(intensity: 'light' | 'medium' | 'heavy' = 'medium') {
  const counts = { light: 60, medium: 120, heavy: 200 };
  const spreads = { light: 50, medium: 70, heavy: 100 };

  confetti({
    particleCount: counts[intensity],
    spread: spreads[intensity],
    origin: { y: 0.6 },
    colors: BRAND_COLORS,
    ticks: 200,
    gravity: 1.2,
    scalar: 1.1,
    shapes: ['circle', 'square'],
    drift: 0,
  });
}

export function fireSideConfetti() {
  const end = Date.now() + 600;
  const frame = () => {
    confetti({ particleCount: 3, angle: 60, spread: 55, origin: { x: 0 }, colors: BRAND_COLORS });
    confetti({ particleCount: 3, angle: 120, spread: 55, origin: { x: 1 }, colors: BRAND_COLORS });
    if (Date.now() < end) requestAnimationFrame(frame);
  };
  frame();
}

export function fireStarBurst() {
  const defaults = { spread: 360, ticks: 100, gravity: 0, decay: 0.94, startVelocity: 30, colors: BRAND_COLORS };
  confetti({ ...defaults, particleCount: 50, scalar: 1.2, shapes: ['star'] });
  confetti({ ...defaults, particleCount: 25, scalar: 0.75, shapes: ['circle'] });
}

export function useConfetti() {
  const celebrate = useCallback((type: 'confetti' | 'sides' | 'stars' = 'confetti') => {
    if (type === 'sides') fireSideConfetti();
    else if (type === 'stars') fireStarBurst();
    else fireConfetti('medium');
  }, []);
  return celebrate;
}

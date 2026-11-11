'use client';

import { useEffect, useRef, type ReactNode } from 'react';

const entrances: Record<string, Keyframe[]> = {
  down: [
    { opacity: 0, transform: 'translateY(-14px)' },
    { opacity: 1, transform: 'none' },
  ],
  rise: [
    { opacity: 0, transform: 'translateY(24px)' },
    { opacity: 1, transform: 'none' },
  ],
  focus: [
    { opacity: 0, transform: 'translateY(18px)', filter: 'blur(4px)' },
    { opacity: 1, transform: 'none', filter: 'blur(0)' },
  ],
  left: [
    { opacity: 0, transform: 'translateX(-26px)' },
    { opacity: 1, transform: 'none' },
  ],
  right: [
    { opacity: 0, transform: 'translateX(26px)' },
    { opacity: 1, transform: 'none' },
  ],
  card: [
    { opacity: 0, transform: 'perspective(900px) translateY(30px) rotateX(7deg) scale(.97)' },
    { opacity: 1, transform: 'none' },
  ],
  expand: [
    { opacity: 0, transform: 'scale(.94)' },
    { opacity: 1, transform: 'none' },
  ],
  line: [
    { opacity: 0, clipPath: 'inset(0 100% 0 0)' },
    { opacity: 1, clipPath: 'inset(0 0 0 0)' },
  ],
  glow: [
    { opacity: 0, transform: 'scale(.97)', boxShadow: '0 0 0 #ff6b2b00' },
    { opacity: 1, transform: 'scale(1)', boxShadow: '0 0 60px #ff6b2b14', offset: 0.7 },
    { opacity: 1, transform: 'none', boxShadow: '0 0 0 #ff6b2b00' },
  ],
};

/** Keeps server-rendered content visible without JS; reveals once per page mount. */
export function LandingMotion({ children, className }: { children: ReactNode; className: string }) {
  const root = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const element = root.current;
    if (!element) return;
    const preference = window.matchMedia('(prefers-reduced-motion: reduce)');
    const targets = [...element.querySelectorAll<HTMLElement>('[data-reveal]')];
    const running = new Map<HTMLElement, Animation>();
    const finish = (target: HTMLElement) => {
      running.get(target)?.cancel();
      running.delete(target);
      target.dataset.revealState = 'done';
    };
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (!entry.isIntersecting) continue;
          const target = entry.target as HTMLElement;
          observer.unobserve(target);
          if (target.dataset.revealState === 'done' || preference.matches) {
            finish(target);
            continue;
          }
          target.dataset.revealState = 'running';
          const animation = target.animate(
            entrances[target.dataset.reveal || 'rise'] || entrances.rise,
            {
              duration: target.dataset.reveal === 'glow' ? 1400 : 1050,
              delay: Math.min(Number(target.dataset.delay) || 0, 400),
              easing: 'cubic-bezier(.25,.1,.25,1)',
              fill: 'backwards',
              iterations: 1,
            },
          );
          running.set(target, animation);
          animation.onfinish = () => finish(target);
        }
      },
      { threshold: 0.12 },
    );
    const reduceMotion = () => {
      if (!preference.matches) return;
      observer.disconnect();
      targets.forEach(finish);
    };
    // Keyboard navigation never lands on an element waiting for its reveal.
    const focus = (event: FocusEvent) => {
      if (!(event.target instanceof Element) || !event.target.matches(':focus-visible')) return;
      for (const target of targets) {
        if (target.contains(event.target)) {
          observer.unobserve(target);
          finish(target);
        }
      }
    };
    if (preference.matches) targets.forEach(finish);
    else targets.forEach((target) => observer.observe(target));
    preference.addEventListener('change', reduceMotion);
    element.addEventListener('focusin', focus);
    return () => {
      observer.disconnect();
      running.forEach((animation) => animation.cancel());
      preference.removeEventListener('change', reduceMotion);
      element.removeEventListener('focusin', focus);
    };
  }, []);
  return (
    <div ref={root} className={className}>
      {children}
    </div>
  );
}

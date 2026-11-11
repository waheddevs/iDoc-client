import { MathUtils, Object3D } from 'three';

/** Three.js scene transforms rendered onto the existing crisp HTML document faces. */
export function animateDocuments(root: HTMLElement) {
  const reduced = matchMedia('(prefers-reduced-motion: reduce)');
  const pointer = matchMedia('(hover: hover) and (pointer: fine)');
  const nodes = [...root.querySelectorAll<HTMLElement>('[data-document-layer]')].map(
    (element, index) => ({
      element,
      object: new Object3D(),
      angle: MathUtils.degToRad([-16, 9, -3][index]),
      depth: [0.6, 1, 1.25][index],
    }),
  );
  const light = root.querySelector<HTMLElement>('[data-orbit-light]');
  let frame = 0;
  let visible = false;
  let introTime = 0;
  let previous = 0;
  let x = 0;
  let y = 0;
  let targetX = 0;
  let targetY = 0;
  const duration = 2400;
  const reset = () => {
    cancelAnimationFrame(frame);
    frame = 0;
    previous = 0;
    x = y = targetX = targetY = 0;
    nodes.forEach(({ element }) => {
      element.style.removeProperty('transform');
      element.style.removeProperty('opacity');
      element.style.removeProperty('will-change');
    });
    light?.style.removeProperty('transform');
    light?.style.removeProperty('opacity');
  };
  const render = (now: number) => {
    frame = 0;
    // The media-query change event can arrive after this animation frame.
    if (reduced.matches) {
      introTime = duration;
      root.dataset.heroState = 'done';
      reset();
      return;
    }
    if (!visible || document.hidden) return;
    const dt = previous ? Math.min((now - previous) / 1000, 0.05) : 1 / 60;
    previous = now;
    introTime = Math.min(duration, introTime + dt * 1000);
    const progress = introTime / duration;
    const ease = (1 - Math.cos(progress * Math.PI)) / 2;
    x = MathUtils.damp(x, targetX, 4, dt);
    y = MathUtils.damp(y, targetY, 4, dt);
    nodes.forEach(({ element, object, angle, depth }, index) => {
      // One floating cycle on entry, then movement only in response to the pointer.
      const float =
        Math.sin(progress * Math.PI * 2) * Math.sin(progress * Math.PI) * (8 + index * 2);
      object.position.set(
        (1 - ease) * [-34, 36, 12][index] + x * depth * 5,
        (1 - ease) * (28 + index * 8) + float + y * depth * 5,
        (1 - ease) * -45,
      );
      object.rotation.set(
        -y * depth * 0.065,
        x * depth * 0.07 + (1 - ease) * 0.16,
        angle + (1 - ease) * (index === 0 ? -0.12 : 0.12),
      );
      object.updateMatrix();
      element.style.transform = `matrix3d(${object.matrix.elements.join(',')})`;
      element.style.opacity = String(MathUtils.smoothstep(progress, 0, 0.3));
    });
    if (light) {
      light.style.transform = `rotate(${progress * 360}deg)`;
      light.style.opacity = String(Math.sin(progress * Math.PI) * 0.9);
    }
    if (progress < 1 || Math.abs(x - targetX) + Math.abs(y - targetY) > 0.001) {
      frame = requestAnimationFrame(render);
    } else {
      root.dataset.heroState = 'done';
      previous = 0;
      nodes.forEach(({ element }) => element.style.removeProperty('will-change'));
    }
  };
  const wake = () => {
    if (frame || !visible || document.hidden || reduced.matches) return;
    nodes.forEach(({ element }) => {
      element.style.willChange = 'transform';
    });
    frame = requestAnimationFrame(render);
  };
  const move = (event: PointerEvent) => {
    if (!pointer.matches || event.pointerType === 'touch' || reduced.matches) return;
    const bounds = root.getBoundingClientRect();
    targetX = MathUtils.clamp(((event.clientX - bounds.left) / bounds.width) * 2 - 1, -1, 1);
    targetY = MathUtils.clamp(((event.clientY - bounds.top) / bounds.height) * 2 - 1, -1, 1);
    wake();
  };
  const leave = () => {
    targetX = targetY = 0;
    wake();
  };
  const observer = new IntersectionObserver(
    ([entry]) => {
      visible = entry.isIntersecting;
      if (visible) wake();
      else reset();
    },
    { threshold: 0.1 },
  );
  const preference = () => {
    if (reduced.matches) {
      introTime = duration;
      root.dataset.heroState = 'done';
      reset();
    } else wake();
  };
  const visibility = () => {
    if (document.hidden) reset();
    else wake();
  };
  preference();
  observer.observe(root);
  root.addEventListener('pointermove', move);
  root.addEventListener('pointerleave', leave);
  reduced.addEventListener('change', preference);
  pointer.addEventListener('change', leave);
  document.addEventListener('visibilitychange', visibility);
  return () => {
    observer.disconnect();
    reset();
    root.removeEventListener('pointermove', move);
    root.removeEventListener('pointerleave', leave);
    reduced.removeEventListener('change', preference);
    pointer.removeEventListener('change', leave);
    document.removeEventListener('visibilitychange', visibility);
  };
}

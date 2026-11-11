'use client';

import Image from 'next/image';
import { useEffect, useRef } from 'react';
import styles from './AuthIllustration.module.scss';

export function AuthIllustration() {
  const root = useRef<HTMLDivElement>(null);
  const picture = useRef<HTMLImageElement>(null);

  useEffect(() => {
    const element = root.current;
    const image = picture.current;
    if (!element || !image) return;
    const enabled = matchMedia('(min-width: 901px) and (prefers-reduced-motion: no-preference)');
    let generation = 0;
    let cleanup: (() => void) | undefined;
    const update = () => {
      const current = ++generation;
      cleanup?.();
      cleanup = undefined;
      if (!enabled.matches) return;
      void Promise.all([import('./illustration-motion'), image.decode()])
        .then(async ([{ animateIllustration }]) => {
          // srcset density changes naturalWidth. A cached, standalone image gives
          // WebGL the actual pixel dimensions instead of the CSS-adjusted size.
          const textureImage = new window.Image();
          textureImage.src = image.currentSrc || image.src;
          await textureImage.decode();
          if (current === generation) cleanup = animateIllustration(element, textureImage);
        })
        .catch(() => {
          /* The local image remains visible if WebGL cannot start. */
        });
    };
    update();
    enabled.addEventListener('change', update);
    return () => {
      ++generation;
      enabled.removeEventListener('change', update);
      cleanup?.();
    };
  }, []);

  return (
    <div ref={root} className={styles.illustration} aria-hidden="true" data-auth-illustration>
      <Image
        ref={picture}
        src="/assets/auth/document-orbit.png"
        width={1254}
        height={1254}
        loading="eager"
        sizes="(max-width: 900px) 1px, (max-width: 1200px) 50vw, 640px"
        alt=""
        draggable={false}
      />
    </div>
  );
}

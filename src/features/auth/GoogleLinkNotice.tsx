'use client';

import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import styles from './GoogleButton.module.scss';

export function GoogleLinkNotice() {
  const params = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  if (params.get('google') !== 'linked') return null;
  const dismiss = () => {
    const remaining = new URLSearchParams(params.toString());
    remaining.delete('google');
    router.replace(pathname + (remaining.size ? `?${remaining}` : ''), { scroll: false });
  };
  return (
    <div className={styles.linkNotice} role="status">
      <span>Google account linked. You can now use Google to sign in to this workspace.</span>
      <button type="button" onClick={dismiss}>
        Dismiss
      </button>
    </div>
  );
}

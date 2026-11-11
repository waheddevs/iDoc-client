import Image from 'next/image';
import type { User } from '@/lib/api/types';
import styles from './Avatar.module.scss';
export function Avatar({ user, size = 36 }: { user?: User | null; size?: number }) {
  const name = user?.name || user?.email?.split('@')[0] || 'User';
  return (
    <span className={styles.avatar} style={{ width: size, height: size }}>
      {user?.avatar_version ? (
        <Image
          src={'/api/backend/v1/profile/avatar?v=' + encodeURIComponent(user.avatar_version)}
          alt={name + ' profile photo'}
          width={size}
          height={size}
          unoptimized
        />
      ) : (
        <span aria-label={name}>{name.slice(0, 2).toUpperCase()}</span>
      )}
    </span>
  );
}

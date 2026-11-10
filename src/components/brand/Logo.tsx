import Image from 'next/image';
import styles from './Logo.module.scss';
export function Logo() {
  return (
    <span className={styles.logo}>
      <Image src="/logo/idoc-logo-transparent.png" alt="iDoc" width={2172} height={724} priority />
    </span>
  );
}

'use client';
import CircularProgress from '@mui/material/CircularProgress';
import styles from './Spinner.module.scss';

type SpinnerProps = {
  size?: 16 | 18 | 20 | 24;
  tone?: 'brand' | 'inherit';
  label?: string;
};

export function Spinner({ size = 20, tone = 'brand', label }: SpinnerProps) {
  return (
    <CircularProgress
      className={styles.spinner}
      variant="indeterminate"
      color="inherit"
      size={size}
      thickness={4}
      style={{ color: tone === 'brand' ? 'var(--orange)' : 'inherit' }}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    />
  );
}

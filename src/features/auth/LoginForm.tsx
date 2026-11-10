'use client';
import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { Eye, EyeOff, ArrowRight, LockKeyhole } from 'lucide-react';
import Link from 'next/link';
import { getSession, signIn } from './api';
import styles from './LoginForm.module.scss';
const schema = z.object({
  email: z.email('Enter a valid email address.'),
  password: z.string().min(1, 'Enter your password.'),
});
export function LoginForm({ enabled, returnTo }: { enabled: boolean; returnTo: string }) {
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState('');
  const {
    register,
    handleSubmit,
    formState: { errors, isSubmitting },
  } = useForm<z.infer<typeof schema>>({ resolver: zodResolver(schema) });
  const submit = handleSubmit(async (values) => {
    setError('');
    try {
      await signIn(values);
      await getSession();
      window.location.assign(returnTo);
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Sign-in failed. Please try again.');
    }
  });
  return (
    <div className={styles.card}>
      <span className={styles.icon}>
        <LockKeyhole size={22} />
      </span>
      <h1>Welcome back</h1>
      <p>Sign in to your document workspace.</p>
      {!enabled && (
        <div className="notice">
          Workspace sign-in is not connected yet. You can explore the frontend preview below.
        </div>
      )}
      <form onSubmit={submit} noValidate>
        <label htmlFor="email">Email address</label>
        <input
          id="email"
          type="email"
          autoComplete="username"
          placeholder="you@example.com"
          {...register('email')}
          aria-invalid={!!errors.email}
          aria-describedby={errors.email ? 'email-error' : undefined}
        />
        {errors.email && (
          <span id="email-error" className="error" role="alert">
            {errors.email.message}
          </span>
        )}
        <label htmlFor="password">Password</label>
        <div className={styles.password}>
          <input
            id="password"
            type={visible ? 'text' : 'password'}
            autoComplete="current-password"
            placeholder="Enter your password"
            {...register('password')}
            aria-invalid={!!errors.password}
          />
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        </div>
        {errors.password && (
          <span className="error" role="alert">
            {errors.password.message}
          </span>
        )}
        {error && (
          <div className="notice" role="alert">
            {error}
          </div>
        )}
        <button className="primary" disabled={isSubmitting} type="submit">
          {isSubmitting ? 'Signing in…' : 'Sign in'}
          <ArrowRight size={17} />
        </button>
      </form>
      <Link className={styles.preview} href="/preview/chat">
        Explore frontend preview <ArrowRight size={16} />
      </Link>
      <small>Answers grounded in your documents.</small>
    </div>
  );
}

'use client';
import { Spinner } from '@/components/ui/Spinner';
import { useRef, useState, type FormEvent } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { Eye, EyeOff, ArrowRight, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { getSession, signIn, signUp } from './api';
import { ApiError } from '@/lib/api/client';
import { loginSchema, signupSchema, type AuthValues } from './schemas';
import styles from './LoginForm.module.scss';
import { GoogleButton } from './GoogleButton';
import { googleErrorMessage } from './google-errors';

export function LoginForm({
  enabled,
  returnTo,
  mode = 'login',
  googleError,
}: {
  enabled: boolean;
  returnTo: string;
  mode?: 'login' | 'signup';
  googleError?: string;
}) {
  const signup = mode === 'signup';
  const [visible, setVisible] = useState(false);
  const [error, setError] = useState(() => googleErrorMessage(googleError));
  const [googlePending, setGooglePending] = useState(false);
  const submitting = useRef(false);
  const {
    register,
    handleSubmit,
    setError: setFieldError,
    formState: { errors, isSubmitting },
  } = useForm<AuthValues>({
    resolver: zodResolver(signup ? signupSchema : loginSchema),
    defaultValues: { email: '', password: '', ...(signup ? { confirmPassword: '' } : {}) },
  });
  const submit = (event: FormEvent<HTMLFormElement>) =>
    handleSubmit(
      async ({ email, password }) => {
        if (submitting.current || googlePending) return;
        submitting.current = true;
        setError('');
        try {
          await (signup ? signUp : signIn)({ email, password });
          await getSession();
          window.location.assign(returnTo);
        } catch (e) {
          const fields = e instanceof ApiError ? e.fieldErrors : undefined;
          let first = true;
          for (const field of ['email', 'password', 'confirmPassword'] as const) {
            if (fields?.[field]) {
              setFieldError(
                field,
                { type: 'server', message: fields[field] },
                { shouldFocus: first },
              );
              first = false;
            }
          }
          if (first) setError(e instanceof Error ? e.message : 'Please try again.');
        } finally {
          submitting.current = false;
        }
      },
      () => setError(''),
    )(event);
  const passwordField = (field: 'password' | 'confirmPassword', label: string) => (
    <div className={styles.field}>
      <div className={styles.labelRow}>
        <label htmlFor={field}>{label}</label>
        {signup && field === 'password' && <span id="password-hint">Min. 8 characters</span>}
      </div>
      <div className={styles.password}>
        <input
          id={field}
          type={visible ? 'text' : 'password'}
          autoComplete={signup ? 'new-password' : 'current-password'}
          placeholder={field === 'password' ? 'Enter your password' : 'Repeat your password'}
          {...register(field)}
          readOnly={isSubmitting || googlePending}
          aria-invalid={!!errors[field]}
          aria-describedby={
            [
              signup && field === 'password' ? 'password-hint' : '',
              errors[field] ? `${field}-error` : '',
            ]
              .filter(Boolean)
              .join(' ') || undefined
          }
        />
        {field === 'password' && (
          <button
            type="button"
            aria-label={visible ? 'Hide password' : 'Show password'}
            aria-pressed={visible}
            onClick={() => setVisible(!visible)}
          >
            {visible ? <EyeOff size={18} /> : <Eye size={18} />}
          </button>
        )}
      </div>
      {errors[field] && (
        <span id={`${field}-error`} className={styles.fieldError} role="alert">
          <AlertCircle size={14} />
          {errors[field]?.message}
        </span>
      )}
    </div>
  );
  return (
    <div className={styles.formContent}>
      <h1>{signup ? 'Create your account.' : 'Welcome back.'}</h1>
      <p>
        {signup
          ? 'A workspace for your documents and ideas.'
          : 'Sign in to continue to your workspace.'}
      </p>
      {!enabled && <div className="notice">Account access is not connected to the server yet.</div>}
      <form onSubmit={submit} onChange={() => setError('')} noValidate aria-busy={isSubmitting}>
        <div className={styles.field}>
          <label htmlFor="email">Email address</label>
          <input
            id="email"
            type="email"
            inputMode="email"
            autoComplete="username"
            placeholder="you@example.com"
            {...register('email')}
            readOnly={isSubmitting || googlePending}
            aria-invalid={!!errors.email}
            aria-describedby={errors.email ? 'email-error' : undefined}
          />
          {errors.email && (
            <span id="email-error" className={styles.fieldError} role="alert">
              <AlertCircle size={14} />
              {errors.email.message}
            </span>
          )}
        </div>
        {passwordField('password', 'Password')}
        {signup && passwordField('confirmPassword', 'Confirm password')}
        <div>
          <div className={styles.divider}>
            <span>or</span>
          </div>
          <GoogleButton
            returnTo={returnTo}
            disabled={isSubmitting || !enabled}
            onBusyChange={setGooglePending}
          />
        </div>
        {error && (
          <div className={styles.formError} role="alert">
            <AlertCircle size={18} />
            <span>{error}</span>
          </div>
        )}
        <button className="primary" disabled={isSubmitting || googlePending} type="submit">
          {isSubmitting
            ? signup
              ? 'Creating account…'
              : 'Signing in…'
            : signup
              ? 'Create account'
              : 'Sign in'}
          {isSubmitting ? <Spinner size={18} tone="inherit" /> : <ArrowRight size={17} />}
        </button>
      </form>
      <p className={styles.switch}>
        {signup ? 'Already have an account?' : 'New to iDoc?'}{' '}
        <Link href={`${signup ? '/login' : '/signup'}?next=${encodeURIComponent(returnTo)}`}>
          {signup ? 'Sign in' : 'Create account'}
        </Link>
      </p>
    </div>
  );
}

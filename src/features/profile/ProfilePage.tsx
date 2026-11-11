'use client';
import {
  useEffect,
  useRef,
  useState,
  type ChangeEvent,
  type FormEvent,
  type ReactNode,
} from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm, type UseFormRegisterReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  AlertCircle,
  ArrowLeft,
  Camera,
  Check,
  Eye,
  EyeOff,
  LockKeyhole,
  Monitor,
  ShieldCheck,
} from 'lucide-react';
import { Avatar } from '@/components/ui/Avatar';
import { Spinner } from '@/components/ui/Spinner';
import { ConfirmDialog } from '@/components/ui/ConfirmDialog';
import { GoogleButton } from '@/features/auth/GoogleButton';
import { ApiError } from '@/lib/api/client';
import type { Profile } from '@/lib/api/types';
import {
  getProfile,
  updateProfile,
  uploadAvatar,
  removeAvatar,
  changePassword,
  revokeOtherSessions,
} from './api';
import { profileSchema, passwordSchema, type PasswordValues, type ProfileValues } from './schemas';
import styles from './ProfilePage.module.scss';

function Feedback({ error, children }: { error?: boolean; children: ReactNode }) {
  return (
    <div
      role={error ? 'alert' : 'status'}
      className={error ? styles.errorNotice : styles.successNotice}
    >
      {error ? (
        <AlertCircle size={17} aria-hidden="true" />
      ) : (
        <Check size={17} aria-hidden="true" />
      )}
      <span>{children}</span>
    </div>
  );
}
function PasswordField({
  label,
  field,
  error,
  autoComplete,
}: {
  label: string;
  field: UseFormRegisterReturn;
  error?: string;
  autoComplete: string;
}) {
  const [visible, setVisible] = useState(false);
  const id = 'profile-' + field.name;
  return (
    <div className={styles.field}>
      <label htmlFor={id}>{label}</label>
      <div className={styles.passwordInput}>
        <input
          {...field}
          id={id}
          type={visible ? 'text' : 'password'}
          autoComplete={autoComplete}
          aria-invalid={!!error}
          aria-describedby={error ? id + '-error' : undefined}
        />
        <button
          type="button"
          onClick={() => setVisible(!visible)}
          aria-label={(visible ? 'Hide ' : 'Show ') + label.toLowerCase()}
        >
          {visible ? <EyeOff size={17} /> : <Eye size={17} />}
        </button>
      </div>
      {error && (
        <span className={styles.fieldError} id={id + '-error'} role="alert">
          {error}
        </span>
      )}
    </div>
  );
}
const message = (error: unknown) =>
  error instanceof Error ? error.message : 'Something went wrong. Please try again.';

export function ProfilePage() {
  const query = useQuery({ queryKey: ['session'], queryFn: getProfile });
  return (
    <div className={styles.page}>
      <Link href="/chat" className={styles.back}>
        <ArrowLeft size={16} />
        Back to workspace
      </Link>
      <div className={styles.heading}>
        <span className="eyebrow">Your account</span>
        <h1>Profile &amp; settings</h1>
        <p>A little more you. Manage your details and account security.</p>
      </div>
      {query.isPending ? (
        <div className={styles.loading} role="status">
          <Spinner />
          Loading your profile...
        </div>
      ) : query.isError ? (
        <Feedback error>
          We could not load your profile.{' '}
          <button onClick={() => void query.refetch()}>Try again</button>
        </Feedback>
      ) : (
        <ProfileForms key={query.data.user.id} profile={query.data} />
      )}
    </div>
  );
}
function ProfileForms({ profile }: { profile: Profile }) {
  const client = useQueryClient();
  const router = useRouter();
  const photoInput = useRef<HTMLInputElement>(null);
  const pendingFocus = useRef<'name' | keyof PasswordValues | null>(null);
  const [photoBusy, setPhotoBusy] = useState(false);
  const [photoError, setPhotoError] = useState('');
  const [photoSuccess, setPhotoSuccess] = useState('');
  const [detailsSuccess, setDetailsSuccess] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [revokeOpen, setRevokeOpen] = useState(false);
  const [revokeBusy, setRevokeBusy] = useState(false);
  const [revokeError, setRevokeError] = useState('');
  const [revokeSuccess, setRevokeSuccess] = useState('');
  const details = useForm<ProfileValues>({
    resolver: zodResolver(profileSchema),
    mode: 'onSubmit',
    defaultValues: { name: profile.user.name || '' },
  });
  const passwords = useForm<PasswordValues>({
    resolver: zodResolver(passwordSchema),
    mode: 'onSubmit',
    defaultValues: { current_password: '', new_password: '', confirm_password: '' },
  });
  const busy =
    photoBusy || details.formState.isSubmitting || passwords.formState.isSubmitting || revokeBusy;
  useEffect(() => {
    if (busy || !pendingFocus.current) return;
    const field = pendingFocus.current;
    pendingFocus.current = null;
    if (field === 'name') details.setFocus('name');
    else passwords.setFocus(field);
  }, [busy, details, passwords]);
  const applyProfile = (result: Profile) => {
    client.setQueryData(['session'], result);
    router.refresh();
  };
  const saveDetails = (event: FormEvent<HTMLFormElement>) => {
    void details.handleSubmit(async (values) => {
      setDetailsSuccess('');
      try {
        const result = await updateProfile(values.name);
        applyProfile(result);
        details.reset({ name: result.user.name || '' });
        setDetailsSuccess('Your profile has been updated.');
      } catch (error) {
        if (error instanceof ApiError && error.fieldErrors?.name) {
          pendingFocus.current = 'name';
          details.setError('name', { message: error.fieldErrors.name }, { shouldFocus: true });
        } else details.setError('root', { message: message(error) });
      }
    })(event);
  };
  const savePassword = (event: FormEvent<HTMLFormElement>) => {
    void passwords.handleSubmit(async (values) => {
      setPasswordSuccess('');
      try {
        await changePassword(values);
        passwords.reset();
        setPasswordSuccess('Password updated. Your other sessions have been signed out.');
      } catch (error) {
        let mapped = false;
        for (const name of ['current_password', 'new_password', 'confirm_password'] as const) {
          if (error instanceof ApiError && error.fieldErrors?.[name]) {
            if (!mapped) pendingFocus.current = name;
            passwords.setError(
              name,
              { message: error.fieldErrors[name] },
              { shouldFocus: !mapped },
            );
            mapped = true;
          }
        }
        if (!mapped) passwords.setError('root', { message: message(error) });
      }
    })(event);
  };
  const changePhoto = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    event.target.value = '';
    if (!file) return;
    setPhotoError('');
    setPhotoSuccess('');
    if (!['image/png', 'image/jpeg', 'image/webp'].includes(file.type)) {
      setPhotoError('Choose a JPG, PNG or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('Choose an image smaller than 5 MiB.');
      return;
    }
    setPhotoBusy(true);
    try {
      applyProfile(await uploadAvatar(file));
      setPhotoSuccess('Profile photo updated.');
    } catch (error) {
      setPhotoError(message(error));
    } finally {
      setPhotoBusy(false);
    }
  };
  const deletePhoto = async () => {
    setPhotoBusy(true);
    setPhotoError('');
    setPhotoSuccess('');
    try {
      applyProfile(await removeAvatar());
      setPhotoSuccess('Profile photo removed.');
    } catch (error) {
      setPhotoError(message(error));
    } finally {
      setPhotoBusy(false);
    }
  };
  const revoke = async () => {
    setRevokeBusy(true);
    setRevokeError('');
    try {
      await revokeOtherSessions();
      setRevokeOpen(false);
      setRevokeSuccess('Other sessions signed out. You are still signed in here.');
    } catch (error) {
      setRevokeError(message(error));
    } finally {
      setRevokeBusy(false);
    }
  };
  return (
    <div className={styles.sections}>
      <section className={styles.card} aria-labelledby="personal-heading">
        <div className={styles.sectionHeading}>
          <h2 id="personal-heading">Personal details</h2>
          <p>Your name and photo appear throughout your workspace.</p>
        </div>
        <div className={styles.photoRow}>
          <Avatar user={profile.user} size={80} />
          <div>
            <div className={styles.photoActions}>
              <button type="button" disabled={busy} onClick={() => photoInput.current?.click()}>
                {photoBusy ? <Spinner size={16} /> : <Camera size={16} />}Change photo
              </button>
              {profile.user.avatar_version && (
                <button
                  type="button"
                  className={styles.quiet}
                  disabled={busy}
                  onClick={() => void deletePhoto()}
                >
                  Remove photo
                </button>
              )}
            </div>
            <p className={styles.hint}>JPG, PNG or WebP. Up to 5 MiB. Cropped to a square.</p>
          </div>
          <input
            ref={photoInput}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="Choose profile photo"
            onChange={changePhoto}
            disabled={busy}
            hidden
          />
        </div>
        {photoError && <Feedback error>{photoError}</Feedback>}
        {photoSuccess && <Feedback>{photoSuccess}</Feedback>}
        <form onSubmit={saveDetails} noValidate>
          <fieldset disabled={busy} className={styles.fields}>
            <div className={styles.field}>
              <label htmlFor="profile-name">Display name</label>
              <input
                id="profile-name"
                autoComplete="nickname"
                placeholder="Your name"
                {...details.register('name', { onChange: () => setDetailsSuccess('') })}
                aria-invalid={!!details.formState.errors.name}
                aria-describedby={details.formState.errors.name ? 'profile-name-error' : undefined}
              />
              {details.formState.errors.name && (
                <span id="profile-name-error" className={styles.fieldError} role="alert">
                  {details.formState.errors.name.message}
                </span>
              )}
            </div>
            <div className={styles.field}>
              <label htmlFor="profile-email">Email address</label>
              <input
                id="profile-email"
                value={profile.user.email}
                readOnly
                aria-describedby="email-hint"
              />
              <span className={styles.hint} id="email-hint">
                Your sign-in email. Email changes are not available yet.
              </span>
            </div>
          </fieldset>
          {details.formState.errors.root && (
            <Feedback error>{details.formState.errors.root.message}</Feedback>
          )}
          {detailsSuccess && <Feedback>{detailsSuccess}</Feedback>}
          <div className={styles.formFooter}>
            <span>Keep your workspace personal.</span>
            <button className={styles.primary} disabled={busy} type="submit">
              {details.formState.isSubmitting && <Spinner size={16} tone="inherit" />}Save changes
            </button>
          </div>
        </form>
      </section>
      <section className={styles.card} aria-labelledby="signin-heading">
        <div className={styles.sectionHeading}>
          <h2 id="signin-heading">Sign-in &amp; security</h2>
          <p>Choose how you access your account.</p>
        </div>
        <div className={styles.connection}>
          <span className={styles.icon}>
            <ShieldCheck size={20} />
          </span>
          <div>
            <h3>Google account</h3>
            <p>
              {profile.google_connected
                ? 'Connected. You can sign in with Google.'
                : 'Connect Google for a quicker sign-in.'}
            </p>
          </div>
          {profile.google_connected && (
            <span className={styles.badge}>
              <Check size={13} />
              Connected
            </span>
          )}
        </div>
        {!profile.google_connected && (
          <div className={styles.google}>
            <GoogleButton returnTo="/profile" intent="link" disabled={busy} />
          </div>
        )}
        <div className={styles.divider} />
        {profile.has_password ? (
          <form onSubmit={savePassword} noValidate>
            <h3 className={styles.passwordHeading}>
              <LockKeyhole size={17} />
              Change password
            </h3>
            <p className={styles.hint}>
              Use at least 8 characters. Other sessions will be signed out after a change.
            </p>
            <fieldset disabled={busy} className={styles.passwordFields}>
              <PasswordField
                label="Current password"
                field={passwords.register('current_password')}
                error={passwords.formState.errors.current_password?.message}
                autoComplete="current-password"
              />
              <div className={styles.fields}>
                <PasswordField
                  label="New password"
                  field={passwords.register('new_password')}
                  error={passwords.formState.errors.new_password?.message}
                  autoComplete="new-password"
                />
                <PasswordField
                  label="Confirm new password"
                  field={passwords.register('confirm_password')}
                  error={passwords.formState.errors.confirm_password?.message}
                  autoComplete="new-password"
                />
              </div>
            </fieldset>
            {passwords.formState.errors.root && (
              <Feedback error>{passwords.formState.errors.root.message}</Feedback>
            )}
            {passwordSuccess && <Feedback>{passwordSuccess}</Feedback>}
            <div className={styles.formFooter}>
              <span>Keep your password private.</span>
              <button type="submit" className={styles.primary} disabled={busy}>
                {passwords.formState.isSubmitting && <Spinner size={16} tone="inherit" />}Update
                password
              </button>
            </div>
          </form>
        ) : (
          <div className={styles.connection}>
            <span className={styles.icon}>
              <LockKeyhole size={20} />
            </span>
            <div>
              <h3>Password managed by Google</h3>
              <p>This account uses Google sign-in and has no separate iDoc password.</p>
              <a
                href="https://myaccount.google.com/security"
                target="_blank"
                rel="noreferrer"
                className={styles.textLink}
              >
                Manage Google security
              </a>
            </div>
          </div>
        )}
      </section>
      <section className={styles.card} aria-labelledby="sessions-heading">
        <div className={styles.connection}>
          <span className={styles.icon}>
            <Monitor size={20} />
          </span>
          <div>
            <h2 id="sessions-heading">Sessions</h2>
            <p>Sign out on other browsers and devices. This session stays active.</p>
          </div>
        </div>
        <div className={styles.formFooter}>
          <span>Your current session is protected.</span>
          <button
            disabled={busy}
            onClick={() => {
              setRevokeError('');
              setRevokeOpen(true);
            }}
          >
            Sign out other sessions
          </button>
        </div>
        {revokeSuccess && <Feedback>{revokeSuccess}</Feedback>}
      </section>
      {revokeOpen && (
        <ConfirmDialog
          title="Sign out other sessions?"
          icon={<Monitor size={21} />}
          description="All other browsers and devices will need to sign in again. You will stay signed in here."
          confirmLabel="Sign out others"
          pendingLabel="Signing out..."
          busy={revokeBusy}
          error={revokeError}
          onClose={() => setRevokeOpen(false)}
          onConfirm={revoke}
        />
      )}
    </div>
  );
}

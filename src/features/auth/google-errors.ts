export const googleErrors: Record<string, string> = {
  google_cancelled: 'Google sign-in was cancelled. You can try again or use your email.',
  google_invalid_state: 'This Google sign-in request has expired. Please try again.',
  google_link_required:
    'This email already has an iDoc account. Sign in with your password, then link Google in Workspace settings.',
  google_link_mismatch: 'Choose the Google account with the same email as your iDoc account.',
  google_already_linked: 'This Google account is already linked to an iDoc account.',
  google_unavailable:
    'Google sign-in is currently unavailable. Please use your email or try again later.',
  google_failed: 'Google sign-in could not be completed. Please try again.',
  google_invalid_token: 'Google could not verify this account. Please try again.',
  session_required: 'Sign in with your password before linking your Google account.',
  auth_rate_limit: 'Too many sign-in attempts. Please wait 15 minutes before trying again.',
  invalid_input: 'This sign-in request is invalid. Please try again.',
  invalid_origin: 'This request origin is not allowed.',
};

export function googleErrorMessage(code?: string) {
  return code
    ? Object.hasOwn(googleErrors, code)
      ? googleErrors[code]
      : googleErrors.google_failed
    : '';
}

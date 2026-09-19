/** A human label per stable `key` — the six messages the app actually sends, fixed by their call sites, not admin-creatable. */
export const TEMPLATE_KEY_LABELS: Record<string, string> = {
  password_reset: 'Password reset',
  email_verification: 'Email verification',
  document_rejected: 'Document rejected',
  document_approved: 'Document approved',
  application_submitted: 'Application submitted',
  case_assigned: 'Case assigned',
};

export function templateKeyLabel(key: string): string {
  return TEMPLATE_KEY_LABELS[key] ?? key;
}

export const CHANNEL_LABELS: Record<string, string> = {
  email: 'Email only',
  in_app: 'In-app only',
  both: 'Email + in-app',
};

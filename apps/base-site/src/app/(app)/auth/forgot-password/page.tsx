'use client';

import { RequestPasswordResetForm } from '@rakuxon/auth';

const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL ?? 'http://localhost:3001';

export default function ForgotPasswordPage() {
  return <RequestPasswordResetForm baseUrl={API_BASE_URL} ownsMainLandmark={false} />;
}

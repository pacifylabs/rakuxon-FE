import type {
  AdminApplicationDetail,
  AdminApplicationList,
  AdminStudentDetail,
  AdminStudentList,
  AgencyDashboardSummary,
  Application,
  ArticleList,
  AssignedAdmin,
  AuthTokens,
  AuthUser,
  ChangeMyPasswordRequest,
  ConfirmDocumentUploadRequest,
  ConsumedLink,
  ConversationDetail,
  ConversationSummary,
  CountryCount,
  CreateAgencyStaffRequest,
  CreateAgencyStudentRequest,
  CourseList,
  CreateApplicationRequest,
  HealthResponse,
  InstitutionList,
  IntakeTerm,
  IssueOnboardingLinkRequest,
  LoginRequest,
  Notification,
  OnboardingLink,
  OnboardingLinkList,
  PeekedLink,
  ReferenceCountry,
  RegisterAgencyRequest,
  RegisterStudentRequest,
  RegisterViaOnboardingLinkRequest,
  SendMessageRequest,
  StartConversationRequest,
  StudentDocument,
  StudentProfile,
  TenantStaff,
  TenantStaffList,
  UnreadCount,
  UpdateMyProfileRequest,
  UpdateStudentProfileRequest,
  UploadSignature,
  UploadSignatureRequest,
} from '@rakuxon/contract';

import { ApiError, NetworkError } from './errors';

export interface ApiClientOptions {
  baseUrl: string;
  /** Returns the current access token, or null when signed out. */
  getAccessToken?: () => string | null | undefined;
  /** Injected in tests; defaults to the platform fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * The only place the frontend talks to the API.
 *
 * Every request goes through one method so the bearer header, error shaping
 * and JSON handling exist once. Types come from the generated contract, so a
 * backend change that breaks a call fails the typecheck rather than a screen.
 *
 * The tenant is never sent: the API derives it from the token or the
 * subdomain, and its validation pipe rejects a body that carries one.
 */
export class ApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string | null | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: ApiClientOptions) {
    this.baseUrl = options.baseUrl.replace(/\/+$/, '');
    this.getAccessToken = options.getAccessToken ?? (() => null);
    this.fetchImpl = options.fetchImpl ?? globalThis.fetch.bind(globalThis);
  }

  async request<T>(
    path: string,
    init: { method?: string; body?: unknown; auth?: boolean; signal?: AbortSignal } = {},
  ): Promise<T> {
    const { method = 'GET', body, auth = false, signal } = init;

    const headers: Record<string, string> = { accept: 'application/json' };
    if (body !== undefined) headers['content-type'] = 'application/json';

    if (auth) {
      const token = this.getAccessToken();
      if (token) headers.authorization = `Bearer ${token}`;
    }

    let response: Response;
    try {
      response = await this.fetchImpl(`${this.baseUrl}${path}`, {
        method,
        headers,
        body: body === undefined ? undefined : JSON.stringify(body),
        signal,
      });
    } catch (cause) {
      /* Distinguish "never arrived" from "arrived and was refused": only the
         first is worth a retry, and only the second has a message to show. */
      throw new NetworkError(cause);
    }

    if (response.status === 204) return undefined as T;

    const payload = await this.readBody(response);

    if (!response.ok) {
      throw new ApiError(response.status, this.messageFrom(payload, response.status), payload);
    }

    return payload as T;
  }

  private async readBody(response: Response): Promise<unknown> {
    const text = await response.text();
    if (!text) return null;
    try {
      return JSON.parse(text);
    } catch {
      return text;
    }
  }

  /** Nest wraps errors as { message } or { message: [...] }. */
  private messageFrom(payload: unknown, status: number): string {
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = (payload as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
    return `Request failed with status ${status}.`;
  }

  /* ------------------------------------------------------------- endpoints */

  health(): Promise<HealthResponse> {
    return this.request<HealthResponse>('/v1/health');
  }

  registerAgency(body: RegisterAgencyRequest): Promise<AuthTokens> {
    return this.request<AuthTokens>('/v1/auth/register', { method: 'POST', body });
  }

  registerStudent(body: RegisterStudentRequest): Promise<AuthTokens> {
    return this.request<AuthTokens>('/v1/auth/register/student', { method: 'POST', body });
  }

  login(body: LoginRequest): Promise<AuthTokens> {
    return this.request<AuthTokens>('/v1/auth/login', { method: 'POST', body });
  }

  refresh(refreshToken: string): Promise<AuthTokens> {
    return this.request<AuthTokens>('/v1/auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  }

  logout(refreshToken: string): Promise<void> {
    return this.request<void>('/v1/auth/logout', { method: 'POST', body: { refreshToken } });
  }

  me(): Promise<AuthTokens['user']> {
    return this.request<AuthTokens['user']>('/v1/auth/me', { method: 'POST', auth: true });
  }

  /** Any role's own name — distinct from `updateMyProfile`, the student-only profile-fields PATCH. */
  updateMyAccount(body: UpdateMyProfileRequest): Promise<AuthUser> {
    return this.request<AuthUser>('/v1/auth/me', { method: 'PATCH', body, auth: true });
  }

  changeMyPassword(body: ChangeMyPasswordRequest): Promise<void> {
    return this.request<void>('/v1/auth/me/change-password', { method: 'POST', body, auth: true });
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.request<void>('/v1/auth/password-reset/request', {
      method: 'POST',
      body: { email },
    });
  }

  confirmPasswordReset(token: string, password: string): Promise<void> {
    return this.request<void>('/v1/auth/password-reset/confirm', {
      method: 'POST',
      body: { token, password },
    });
  }

  /** A no-op if the signed-in user's address is already verified. */
  resendEmailVerification(): Promise<void> {
    return this.request<void>('/v1/auth/verify-email/resend', { method: 'POST', auth: true });
  }

  confirmEmailVerification(token: string): Promise<void> {
    return this.request<void>('/v1/auth/verify-email/confirm', {
      method: 'POST',
      body: { token },
    });
  }

  /** Completes a provider redirect. The code is exchanged server-side. */
  ssoCallback(provider: string, code: string, redirectUri: string): Promise<AuthTokens> {
    return this.request<AuthTokens>(`/v1/auth/sso/${provider}/callback`, {
      method: 'POST',
      body: { code, redirectUri },
    });
  }

  issueOnboardingLink(body: IssueOnboardingLinkRequest): Promise<OnboardingLink> {
    return this.request<OnboardingLink>('/v1/onboarding-links', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  listOnboardingLinks(): Promise<OnboardingLinkList> {
    return this.request<OnboardingLinkList>('/v1/onboarding-links', { auth: true });
  }

  revokeOnboardingLink(id: string): Promise<void> {
    return this.request<void>(`/v1/onboarding-links/${id}`, { method: 'DELETE', auth: true });
  }

  consumeOnboardingLink(token: string): Promise<ConsumedLink> {
    return this.request<ConsumedLink>('/v1/onboarding-links/consume', {
      method: 'POST',
      body: { token },
    });
  }

  /** Looks up an invitation without spending it — for prefilling a sign-up form. */
  peekOnboardingLink(token: string): Promise<PeekedLink> {
    return this.request<PeekedLink>('/v1/onboarding-links/peek', {
      method: 'POST',
      body: { token },
    });
  }

  registerViaOnboardingLink(body: RegisterViaOnboardingLinkRequest): Promise<AuthTokens> {
    return this.request<AuthTokens>('/v1/onboarding-links/register', { method: 'POST', body });
  }

  getMyProfile(): Promise<StudentProfile> {
    return this.request<StudentProfile>('/v1/students/me', { auth: true });
  }

  /** Every country, for a profile or address form's dropdown. Public — no session needed. */
  listReferenceCountries(): Promise<ReferenceCountry[]> {
    return this.request<ReferenceCountry[]>('/v1/catalogue/countries/reference');
  }

  /** Active options for the preferred-intake dropdown. Public — no session needed. */
  listIntakeTerms(): Promise<IntakeTerm[]> {
    return this.request<IntakeTerm[]>('/v1/catalogue/intake-terms');
  }

  /** Destinations with a published institution count, for a "where to study" teaser. */
  listDestinationCounts(): Promise<CountryCount[]> {
    return this.request<CountryCount[]>('/v1/catalogue/countries');
  }

  /** Latest guidance articles, for a home-page teaser. Public — no session needed. */
  listArticles(limit = 3): Promise<ArticleList> {
    return this.request<ArticleList>(`/v1/catalogue/articles?limit=${limit}`);
  }

  /** Browse published universities — filter by country or free text. Public — no session needed. */
  listInstitutions(
    query: { country?: string; q?: string; page?: number; limit?: number } = {},
  ): Promise<InstitutionList> {
    return this.request<InstitutionList>(`/v1/catalogue/institutions${toQuery(query)}`);
  }

  /** Browse published courses — filter by country, level, discipline or institution. Public — no session needed. */
  listCourses(
    query: {
      country?: string;
      q?: string;
      level?: string;
      discipline?: string;
      institutionSlug?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<CourseList> {
    return this.request<CourseList>(`/v1/catalogue/courses${toQuery(query)}`);
  }

  updateMyProfile(body: UpdateStudentProfileRequest): Promise<StudentProfile> {
    return this.request<StudentProfile>('/v1/students/me', { method: 'PATCH', body, auth: true });
  }

  getUploadSignature(body: UploadSignatureRequest): Promise<UploadSignature> {
    return this.request<UploadSignature>('/v1/documents/upload-signature', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  confirmDocumentUpload(
    documentId: string,
    body: ConfirmDocumentUploadRequest,
  ): Promise<StudentDocument> {
    return this.request<StudentDocument>(`/v1/documents/${documentId}/confirm`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  listDocuments(): Promise<StudentDocument[]> {
    return this.request<StudentDocument[]>('/v1/documents', { auth: true });
  }

  deleteDocument(documentId: string): Promise<void> {
    return this.request<void>(`/v1/documents/${documentId}`, { method: 'DELETE', auth: true });
  }

  createApplication(body: CreateApplicationRequest): Promise<Application> {
    return this.request<Application>('/v1/applications', { method: 'POST', body, auth: true });
  }

  listApplications(): Promise<Application[]> {
    return this.request<Application[]>('/v1/applications', { auth: true });
  }

  getApplication(id: string): Promise<Application> {
    return this.request<Application>(`/v1/applications/${id}`, { auth: true });
  }

  attachDocumentToApplication(applicationId: string, documentId: string): Promise<Application> {
    return this.request<Application>(`/v1/applications/${applicationId}/documents/${documentId}`, {
      method: 'POST',
      auth: true,
    });
  }

  detachDocumentFromApplication(applicationId: string, documentId: string): Promise<Application> {
    return this.request<Application>(`/v1/applications/${applicationId}/documents/${documentId}`, {
      method: 'DELETE',
      auth: true,
    });
  }

  submitApplication(id: string): Promise<Application> {
    return this.request<Application>(`/v1/applications/${id}/submit`, {
      method: 'POST',
      auth: true,
    });
  }

  listNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/v1/notifications', { auth: true });
  }

  getUnreadNotificationCount(): Promise<UnreadCount> {
    return this.request<UnreadCount>('/v1/notifications/unread-count', { auth: true });
  }

  markNotificationRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/v1/notifications/${id}/read`, {
      method: 'POST',
      auth: true,
    });
  }

  /* -------------------------------------------------------------- messages */

  listConversations(): Promise<ConversationSummary[]> {
    return this.request<ConversationSummary[]>('/v1/messages/conversations', { auth: true });
  }

  getConversation(id: string): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/v1/messages/conversations/${id}`, { auth: true });
  }

  replyToConversation(id: string, body: SendMessageRequest): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/v1/messages/conversations/${id}/reply`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  listAssignedAdmins(): Promise<AssignedAdmin[]> {
    return this.request<AssignedAdmin[]>('/v1/messages/assigned-admins', { auth: true });
  }

  startConversation(body: StartConversationRequest): Promise<ConversationDetail> {
    return this.request<ConversationDetail>('/v1/messages/conversations', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /** Polled every ~60s while a session is open — drives the "online" indicator in messaging. */
  heartbeat(): Promise<void> {
    return this.request<void>('/v1/students/me/heartbeat', { method: 'POST', auth: true });
  }

  /* ---------------------------------------------------------------- agency */

  getAgencyDashboardSummary(): Promise<AgencyDashboardSummary> {
    return this.request<AgencyDashboardSummary>('/v1/agency/dashboard/summary', { auth: true });
  }

  listAgencyStudents(
    query: { q?: string; page?: number; limit?: number } = {},
  ): Promise<AdminStudentList> {
    return this.request<AdminStudentList>(`/v1/agency/students${toQuery(query)}`, { auth: true });
  }

  getAgencyStudent(id: string): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/v1/agency/students/${id}`, { auth: true });
  }

  /** Brings a student in directly, no invite-link round trip. */
  createAgencyStudent(body: CreateAgencyStudentRequest): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>('/v1/agency/students', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /** What a student has uploaded, so the application screen has something to attach. */
  listAgencyStudentDocuments(id: string): Promise<StudentDocument[]> {
    return this.request<StudentDocument[]>(`/v1/agency/students/${id}/documents`, { auth: true });
  }

  listAgencyApplications(
    query: { status?: string; studentId?: string; q?: string; page?: number; limit?: number } = {},
  ): Promise<AdminApplicationList> {
    return this.request<AdminApplicationList>(`/v1/agency/applications${toQuery(query)}`, {
      auth: true,
    });
  }

  getAgencyApplication(id: string): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(`/v1/agency/applications/${id}`, { auth: true });
  }

  attachAgencyApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(
      `/v1/agency/applications/${applicationId}/documents/${documentId}`,
      { method: 'POST', auth: true },
    );
  }

  detachAgencyApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(
      `/v1/agency/applications/${applicationId}/documents/${documentId}`,
      { method: 'DELETE', auth: true },
    );
  }

  submitAgencyApplication(applicationId: string): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(`/v1/agency/applications/${applicationId}/submit`, {
      method: 'POST',
      auth: true,
    });
  }

  listAgencyStaff(): Promise<TenantStaffList> {
    return this.request<TenantStaffList>('/v1/agency/staff', { auth: true });
  }

  addAgencyStaff(body: CreateAgencyStaffRequest): Promise<TenantStaff> {
    return this.request<TenantStaff>('/v1/agency/staff', { method: 'POST', body, auth: true });
  }

  suspendAgencyStaff(userId: string): Promise<TenantStaff> {
    return this.request<TenantStaff>(`/v1/agency/staff/${userId}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  reactivateAgencyStaff(userId: string): Promise<TenantStaff> {
    return this.request<TenantStaff>(`/v1/agency/staff/${userId}/reactivate`, {
      method: 'POST',
      auth: true,
    });
  }
}

/** Query-string builder that drops undefined/empty values rather than sending `?page=undefined`. */
function toQuery(params: Record<string, string | number | undefined>): string {
  const entries = Object.entries(params).filter(
    ([, value]) => value !== undefined && value !== '',
  ) as [string, string | number][];
  if (entries.length === 0) return '';
  return `?${new URLSearchParams(entries.map(([key, value]) => [key, String(value)])).toString()}`;
}

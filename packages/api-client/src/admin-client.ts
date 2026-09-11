import type {
  AdminAccount,
  AdminApplicationDetail,
  AdminApplicationList,
  AdminArticleDetail,
  AdminArticleList,
  AdminArticleSummary,
  AdminAuthTokens,
  AdminCountry,
  AdminCourseDetail,
  AdminCourseList,
  AdminCourseSummary,
  AdminDashboardSummary,
  AdminInstitutionDetail,
  AdminInstitutionList,
  AdminInstitutionSummary,
  AdminList,
  AdminLoginRequest,
  AdminLoginResult,
  AdminStudentDetail,
  AdminStudentList,
  AdminSummary,
  ChangeAdminPasswordRequest,
  ConfirmAdminPasswordResetRequest,
  ConfirmDocumentUploadRequest,
  CreateAdminRequest,
  CreateArticleRequest,
  CreateCourseRequest,
  CreateInstitutionRequest,
  DisableTotpRequest,
  Permission,
  RejectDocumentRequest,
  StudentDocument,
  Tenant,
  TenantList,
  TotpEnabled,
  TotpSetup,
  UpdateAdminProfileRequest,
  UpdateArticleRequest,
  UpdateCourseRequest,
  UpdateInstitutionRequest,
  UpdateStudentAdminRequest,
  UploadSignature,
  UploadSignatureRequest,
  VerifyAdminTotpLoginRequest,
  VerifyTotpRequest,
} from '@rakuxon/contract';

import { ApiError, NetworkError } from './errors';

export interface AdminApiClientOptions {
  baseUrl: string;
  /** Returns the current admin access token, or null when signed out. */
  getAccessToken?: () => string | null | undefined;
  /** Injected in tests; defaults to the platform fetch. */
  fetchImpl?: typeof fetch;
}

/**
 * The admin app's only channel to the API.
 *
 * A separate class from `ApiClient`, not an extension of it: admin sessions
 * are a fully isolated identity system on the backend (own table, own
 * tokens, own secret pair — see rakuxon-BE's AdminAuthModule), and giving
 * them their own token lifecycle here keeps that isolation end to end rather
 * than sharing a token store that was designed around the `users` shape.
 */
export class AdminApiClient {
  private readonly baseUrl: string;
  private readonly getAccessToken: () => string | null | undefined;
  private readonly fetchImpl: typeof fetch;

  constructor(options: AdminApiClientOptions) {
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

  private messageFrom(payload: unknown, status: number): string {
    if (payload && typeof payload === 'object' && 'message' in payload) {
      const message = (payload as { message: unknown }).message;
      if (typeof message === 'string') return message;
      if (Array.isArray(message)) return message.join(', ');
    }
    return `Request failed with status ${status}.`;
  }

  /* ------------------------------------------------------------- endpoints */

  login(body: AdminLoginRequest): Promise<AdminLoginResult> {
    return this.request<AdminLoginResult>('/v1/admin-auth/login', { method: 'POST', body });
  }

  verifyTotpLogin(body: VerifyAdminTotpLoginRequest): Promise<AdminAuthTokens> {
    return this.request<AdminAuthTokens>('/v1/admin-auth/login/verify-totp', { method: 'POST', body });
  }

  refresh(refreshToken: string): Promise<AdminAuthTokens> {
    return this.request<AdminAuthTokens>('/v1/admin-auth/refresh', {
      method: 'POST',
      body: { refreshToken },
    });
  }

  logout(refreshToken: string): Promise<void> {
    return this.request<void>('/v1/admin-auth/logout', { method: 'POST', body: { refreshToken } });
  }

  requestPasswordReset(email: string): Promise<void> {
    return this.request<void>('/v1/admin-auth/password-reset/request', {
      method: 'POST',
      body: { email },
    });
  }

  confirmPasswordReset(body: ConfirmAdminPasswordResetRequest): Promise<void> {
    return this.request<void>('/v1/admin-auth/password-reset/confirm', { method: 'POST', body });
  }

  /* -------------------------------------------------------------- tenants */

  listTenants(query: { status?: string; q?: string; page?: number; limit?: number } = {}): Promise<TenantList> {
    return this.request<TenantList>(`/v1/admin/tenants${toQuery(query)}`, { auth: true });
  }

  getTenant(id: string): Promise<Tenant> {
    return this.request<Tenant>(`/v1/admin/tenants/${id}`, { auth: true });
  }

  approveTenant(id: string): Promise<Tenant> {
    return this.request<Tenant>(`/v1/admin/tenants/${id}/approve`, { method: 'POST', auth: true });
  }

  suspendTenant(id: string): Promise<Tenant> {
    return this.request<Tenant>(`/v1/admin/tenants/${id}/suspend`, { method: 'POST', auth: true });
  }

  reactivateTenant(id: string): Promise<Tenant> {
    return this.request<Tenant>(`/v1/admin/tenants/${id}/reactivate`, { method: 'POST', auth: true });
  }

  /* ------------------------------------------------------------ catalogue */

  listAdminInstitutions(
    query: { status?: string; country?: string; q?: string; page?: number; limit?: number } = {},
  ): Promise<AdminInstitutionList> {
    return this.request<AdminInstitutionList>(`/v1/admin/catalogue/institutions${toQuery(query)}`, {
      auth: true,
    });
  }

  getInstitutionDetail(id: string): Promise<AdminInstitutionDetail> {
    return this.request<AdminInstitutionDetail>(`/v1/admin/catalogue/institutions/${id}/detail`, { auth: true });
  }

  updateInstitution(id: string, body: UpdateInstitutionRequest): Promise<AdminInstitutionDetail> {
    return this.request<AdminInstitutionDetail>(`/v1/admin/catalogue/institutions/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createInstitution(body: CreateInstitutionRequest): Promise<AdminInstitutionDetail> {
    return this.request<AdminInstitutionDetail>('/v1/admin/catalogue/institutions', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  publishInstitution(id: string): Promise<AdminInstitutionSummary> {
    return this.request<AdminInstitutionSummary>(`/v1/admin/catalogue/institutions/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendInstitution(id: string): Promise<AdminInstitutionSummary> {
    return this.request<AdminInstitutionSummary>(`/v1/admin/catalogue/institutions/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertInstitutionToDraft(id: string): Promise<AdminInstitutionSummary> {
    return this.request<AdminInstitutionSummary>(
      `/v1/admin/catalogue/institutions/${id}/revert-to-draft`,
      { method: 'POST', auth: true },
    );
  }

  listAdminCourses(
    query: {
      status?: string;
      country?: string;
      level?: string;
      institutionSlug?: string;
      q?: string;
      page?: number;
      limit?: number;
    } = {},
  ): Promise<AdminCourseList> {
    return this.request<AdminCourseList>(`/v1/admin/catalogue/courses${toQuery(query)}`, { auth: true });
  }

  getCourseDetail(id: string): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>(`/v1/admin/catalogue/courses/${id}/detail`, { auth: true });
  }

  updateCourse(id: string, body: UpdateCourseRequest): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>(`/v1/admin/catalogue/courses/${id}`, { method: 'PATCH', body, auth: true });
  }

  createCourse(body: CreateCourseRequest): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>('/v1/admin/catalogue/courses', { method: 'POST', body, auth: true });
  }

  publishCourse(id: string): Promise<AdminCourseSummary> {
    return this.request<AdminCourseSummary>(`/v1/admin/catalogue/courses/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendCourse(id: string): Promise<AdminCourseSummary> {
    return this.request<AdminCourseSummary>(`/v1/admin/catalogue/courses/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertCourseToDraft(id: string): Promise<AdminCourseSummary> {
    return this.request<AdminCourseSummary>(`/v1/admin/catalogue/courses/${id}/revert-to-draft`, {
      method: 'POST',
      auth: true,
    });
  }

  listAdminArticles(
    query: { status?: string; q?: string; page?: number; limit?: number } = {},
  ): Promise<AdminArticleList> {
    return this.request<AdminArticleList>(`/v1/admin/catalogue/articles${toQuery(query)}`, { auth: true });
  }

  getArticleDetail(id: string): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>(`/v1/admin/catalogue/articles/${id}/detail`, { auth: true });
  }

  updateArticle(id: string, body: UpdateArticleRequest): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>(`/v1/admin/catalogue/articles/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createArticle(body: CreateArticleRequest): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>('/v1/admin/catalogue/articles', { method: 'POST', body, auth: true });
  }

  publishArticle(id: string): Promise<AdminArticleSummary> {
    return this.request<AdminArticleSummary>(`/v1/admin/catalogue/articles/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendArticle(id: string): Promise<AdminArticleSummary> {
    return this.request<AdminArticleSummary>(`/v1/admin/catalogue/articles/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertArticleToDraft(id: string): Promise<AdminArticleSummary> {
    return this.request<AdminArticleSummary>(`/v1/admin/catalogue/articles/${id}/revert-to-draft`, {
      method: 'POST',
      auth: true,
    });
  }

  /* ---------------------------------------------------------------- countries */

  listAdminCountries(): Promise<AdminCountry[]> {
    return this.request<AdminCountry[]>('/v1/admin/catalogue/countries', { auth: true });
  }

  activateCountry(code: string): Promise<AdminCountry> {
    return this.request<AdminCountry>(`/v1/admin/catalogue/countries/${code}/activate`, {
      method: 'POST',
      auth: true,
    });
  }

  deactivateCountry(code: string): Promise<AdminCountry> {
    return this.request<AdminCountry>(`/v1/admin/catalogue/countries/${code}/deactivate`, {
      method: 'POST',
      auth: true,
    });
  }

  /* ---------------------------------------------------------- applications */

  listAdminApplications(
    query: { status?: string; tenantId?: string; page?: number; limit?: number } = {},
  ): Promise<AdminApplicationList> {
    return this.request<AdminApplicationList>(`/v1/admin/applications${toQuery(query)}`, { auth: true });
  }

  getAdminApplication(id: string): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(`/v1/admin/applications/${id}`, { auth: true });
  }

  /* --------------------------------------------------------------- admins */

  listAdminPermissions(): Promise<Permission[]> {
    return this.request<Permission[]>('/v1/admin/admins/permissions', { auth: true });
  }

  createAdmin(body: CreateAdminRequest): Promise<AdminSummary> {
    return this.request<AdminSummary>('/v1/admin/admins', { method: 'POST', body, auth: true });
  }

  listAdmins(): Promise<AdminList> {
    return this.request<AdminList>('/v1/admin/admins', { auth: true });
  }

  updateAdminPermissions(id: string, permissionKeys: string[]): Promise<AdminSummary> {
    return this.request<AdminSummary>(`/v1/admin/admins/${id}/permissions`, {
      method: 'PATCH',
      body: { permissionKeys },
      auth: true,
    });
  }

  suspendAdmin(id: string): Promise<AdminSummary> {
    return this.request<AdminSummary>(`/v1/admin/admins/${id}/suspend`, { method: 'POST', auth: true });
  }

  reactivateAdmin(id: string): Promise<AdminSummary> {
    return this.request<AdminSummary>(`/v1/admin/admins/${id}/reactivate`, { method: 'POST', auth: true });
  }

  /* ------------------------------------------------------------- students */

  listAdminStudents(query: { q?: string; page?: number; limit?: number } = {}): Promise<AdminStudentList> {
    return this.request<AdminStudentList>(`/v1/admin/students${toQuery(query)}`, { auth: true });
  }

  getAdminStudent(id: string): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/v1/admin/students/${id}`, { auth: true });
  }

  updateAdminStudent(id: string, body: UpdateStudentAdminRequest): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/v1/admin/students/${id}`, { method: 'PATCH', body, auth: true });
  }

  /* ------------------------------------------------------------ dashboard */

  getDashboardSummary(): Promise<AdminDashboardSummary> {
    return this.request<AdminDashboardSummary>('/v1/admin/dashboard/summary', { auth: true });
  }

  /* ------------------------------------------------------------ documents */

  listAdminStudentDocuments(studentId: string): Promise<StudentDocument[]> {
    return this.request<StudentDocument[]>(`/v1/admin/students/${studentId}/documents`, { auth: true });
  }

  getAdminUploadSignature(studentId: string, body: UploadSignatureRequest): Promise<UploadSignature> {
    return this.request<UploadSignature>(`/v1/admin/students/${studentId}/documents/upload-signature`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  confirmAdminDocumentUpload(documentId: string, body: ConfirmDocumentUploadRequest): Promise<StudentDocument> {
    return this.request<StudentDocument>(`/v1/admin/documents/${documentId}/confirm`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  rejectDocument(documentId: string, body: RejectDocumentRequest): Promise<StudentDocument> {
    return this.request<StudentDocument>(`/v1/admin/documents/${documentId}/reject`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /* ---------------------------------------------------------------- account */

  getAccount(): Promise<AdminAccount> {
    return this.request<AdminAccount>('/v1/admin/account/me', { auth: true });
  }

  updateAccountProfile(body: UpdateAdminProfileRequest): Promise<AdminAccount> {
    return this.request<AdminAccount>('/v1/admin/account/me', { method: 'PATCH', body, auth: true });
  }

  changeAccountPassword(body: ChangeAdminPasswordRequest): Promise<void> {
    return this.request<void>('/v1/admin/account/me/password', { method: 'POST', body, auth: true });
  }

  setupTotp(): Promise<TotpSetup> {
    return this.request<TotpSetup>('/v1/admin/account/me/2fa/setup', { method: 'POST', auth: true });
  }

  enableTotp(body: VerifyTotpRequest): Promise<TotpEnabled> {
    return this.request<TotpEnabled>('/v1/admin/account/me/2fa/enable', { method: 'POST', body, auth: true });
  }

  disableTotp(body: DisableTotpRequest): Promise<void> {
    return this.request<void>('/v1/admin/account/me/2fa/disable', { method: 'POST', body, auth: true });
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

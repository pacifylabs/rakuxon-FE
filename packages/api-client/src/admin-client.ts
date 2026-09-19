import type { AdminRoleSummary, SaveAdminRoleRequest } from '@rakuxon/contract';
import type {
  AdminAccount,
  AdminUploadSignature,
  AdminUploadSignatureRequest,
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
  AdminCreateStudentRequest,
  AdminCreateTenantRequest,
  AdminDashboardSummary,
  AdminInstitutionDetail,
  AdminInstitutionList,
  AdminInstitutionSummary,
  AdminIntakeTerm,
  AdminList,
  AdminLoginRequest,
  AdminLoginResult,
  AdminStudentDetail,
  AdminStudentList,
  AdminSummary,
  AdminServiceDetail,
  AdminServiceList,
  AdminServiceSummary,
  AdminSiteSettings,
  AdminTestimonialDetail,
  AdminTestimonialList,
  AdminTestimonialSummary,
  AdminDestinationDetail,
  AdminDestinationList,
  AdminDestinationSummary,
  AssignApplicationRequest,
  AssignableAdminList,
  AuditLogList,
  ChangeAdminPasswordRequest,
  ComposeMessageRequest,
  ComposeResult,
  ConfirmAdminPasswordResetRequest,
  ConfirmDocumentUploadRequest,
  ConversationDetail,
  ConversationSummary,
  CreateAdminRequest,
  CreateArticleRequest,
  CreateCourseRequest,
  CreateDestinationRequest,
  CreateInstitutionRequest,
  CreateIntakeTermRequest,
  CreateServiceRequest,
  CreateTenantStaffRequest,
  CreateTestimonialRequest,
  DisableTotpRequest,
  Notification,
  NotificationTemplateDetail,
  NotificationTemplatePreview,
  NotificationTemplateSummary,
  Permission,
  PreviewNotificationTemplateRequest,
  RejectDocumentRequest,
  ResourceAuditLog,
  SendMessageRequest,
  SetCountryHomepageFeaturedRequest,
  SetStudentPasswordRequest,
  SetTenantStaffPasswordRequest,
  StudentDocument,
  Tenant,
  TenantList,
  TenantStaff,
  TenantStaffList,
  TotpEnabled,
  TotpSetup,
  UpdateAdminProfileRequest,
  UpdateArticleRequest,
  UpdateCourseRequest,
  UpdateDestinationRequest,
  UpdateInstitutionRequest,
  UpdateIntakeTermRequest,
  UpdateNotificationTemplateRequest,
  UpdateServiceRequest,
  UpdateSiteSettingsRequest,
  UpdateStudentAdminRequest,
  UpdateTenantRequest,
  UpdateTestimonialRequest,
  UnreadCount,
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
    return this.request<AdminAuthTokens>('/v1/admin-auth/login/verify-totp', {
      method: 'POST',
      body,
    });
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

  listTenants(
    query: { status?: string; q?: string; page?: number; limit?: number } = {},
  ): Promise<TenantList> {
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
    return this.request<Tenant>(`/v1/admin/tenants/${id}/reactivate`, {
      method: 'POST',
      auth: true,
    });
  }

  createTenant(body: AdminCreateTenantRequest): Promise<Tenant> {
    return this.request<Tenant>('/v1/admin/tenants', { method: 'POST', body, auth: true });
  }

  updateTenant(id: string, body: UpdateTenantRequest): Promise<Tenant> {
    return this.request<Tenant>(`/v1/admin/tenants/${id}`, { method: 'PATCH', body, auth: true });
  }

  listTenantStaff(tenantId: string): Promise<TenantStaffList> {
    return this.request<TenantStaffList>(`/v1/admin/tenants/${tenantId}/staff`, { auth: true });
  }

  addTenantStaff(tenantId: string, body: CreateTenantStaffRequest): Promise<TenantStaff> {
    return this.request<TenantStaff>(`/v1/admin/tenants/${tenantId}/staff`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  setTenantStaffPassword(
    tenantId: string,
    userId: string,
    body: SetTenantStaffPasswordRequest,
  ): Promise<void> {
    return this.request<void>(`/v1/admin/tenants/${tenantId}/staff/${userId}/set-password`, {
      method: 'POST',
      body,
      auth: true,
    });
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
    return this.request<AdminInstitutionDetail>(`/v1/admin/catalogue/institutions/${id}/detail`, {
      auth: true,
    });
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
    return this.request<AdminCourseList>(`/v1/admin/catalogue/courses${toQuery(query)}`, {
      auth: true,
    });
  }

  getCourseDetail(id: string): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>(`/v1/admin/catalogue/courses/${id}/detail`, {
      auth: true,
    });
  }

  updateCourse(id: string, body: UpdateCourseRequest): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>(`/v1/admin/catalogue/courses/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createCourse(body: CreateCourseRequest): Promise<AdminCourseDetail> {
    return this.request<AdminCourseDetail>('/v1/admin/catalogue/courses', {
      method: 'POST',
      body,
      auth: true,
    });
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
    return this.request<AdminArticleList>(`/v1/admin/catalogue/articles${toQuery(query)}`, {
      auth: true,
    });
  }

  getArticleDetail(id: string): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>(`/v1/admin/catalogue/articles/${id}/detail`, {
      auth: true,
    });
  }

  updateArticle(id: string, body: UpdateArticleRequest): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>(`/v1/admin/catalogue/articles/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createArticle(body: CreateArticleRequest): Promise<AdminArticleDetail> {
    return this.request<AdminArticleDetail>('/v1/admin/catalogue/articles', {
      method: 'POST',
      body,
      auth: true,
    });
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

  listAdminTestimonials(
    query: { status?: string; page?: number; limit?: number } = {},
  ): Promise<AdminTestimonialList> {
    return this.request<AdminTestimonialList>(`/v1/admin/testimonials${toQuery(query)}`, {
      auth: true,
    });
  }

  getTestimonialDetail(id: string): Promise<AdminTestimonialDetail> {
    return this.request<AdminTestimonialDetail>(`/v1/admin/testimonials/${id}`, { auth: true });
  }

  updateTestimonial(id: string, body: UpdateTestimonialRequest): Promise<AdminTestimonialDetail> {
    return this.request<AdminTestimonialDetail>(`/v1/admin/testimonials/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createTestimonial(body: CreateTestimonialRequest): Promise<AdminTestimonialDetail> {
    return this.request<AdminTestimonialDetail>('/v1/admin/testimonials', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  publishTestimonial(id: string): Promise<AdminTestimonialSummary> {
    return this.request<AdminTestimonialSummary>(`/v1/admin/testimonials/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendTestimonial(id: string): Promise<AdminTestimonialSummary> {
    return this.request<AdminTestimonialSummary>(`/v1/admin/testimonials/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertTestimonialToDraft(id: string): Promise<AdminTestimonialSummary> {
    return this.request<AdminTestimonialSummary>(`/v1/admin/testimonials/${id}/revert-to-draft`, {
      method: 'POST',
      auth: true,
    });
  }

  /* ----------------------------------------------------------- destinations */

  listAdminDestinations(
    query: { status?: string; page?: number; limit?: number } = {},
  ): Promise<AdminDestinationList> {
    return this.request<AdminDestinationList>(`/v1/admin/destinations${toQuery(query)}`, {
      auth: true,
    });
  }

  getDestinationDetail(id: string): Promise<AdminDestinationDetail> {
    return this.request<AdminDestinationDetail>(`/v1/admin/destinations/${id}`, { auth: true });
  }

  updateDestination(id: string, body: UpdateDestinationRequest): Promise<AdminDestinationDetail> {
    return this.request<AdminDestinationDetail>(`/v1/admin/destinations/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createDestination(body: CreateDestinationRequest): Promise<AdminDestinationDetail> {
    return this.request<AdminDestinationDetail>('/v1/admin/destinations', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  publishDestination(id: string): Promise<AdminDestinationSummary> {
    return this.request<AdminDestinationSummary>(`/v1/admin/destinations/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendDestination(id: string): Promise<AdminDestinationSummary> {
    return this.request<AdminDestinationSummary>(`/v1/admin/destinations/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertDestinationToDraft(id: string): Promise<AdminDestinationSummary> {
    return this.request<AdminDestinationSummary>(`/v1/admin/destinations/${id}/revert-to-draft`, {
      method: 'POST',
      auth: true,
    });
  }

  listAdminServices(
    query: { status?: string; page?: number; limit?: number } = {},
  ): Promise<AdminServiceList> {
    return this.request<AdminServiceList>(`/v1/admin/services${toQuery(query)}`, { auth: true });
  }

  getServiceDetail(id: string): Promise<AdminServiceDetail> {
    return this.request<AdminServiceDetail>(`/v1/admin/services/${id}`, { auth: true });
  }

  updateService(id: string, body: UpdateServiceRequest): Promise<AdminServiceDetail> {
    return this.request<AdminServiceDetail>(`/v1/admin/services/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createService(body: CreateServiceRequest): Promise<AdminServiceDetail> {
    return this.request<AdminServiceDetail>('/v1/admin/services', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  publishService(id: string): Promise<AdminServiceSummary> {
    return this.request<AdminServiceSummary>(`/v1/admin/services/${id}/publish`, {
      method: 'POST',
      auth: true,
    });
  }

  suspendService(id: string): Promise<AdminServiceSummary> {
    return this.request<AdminServiceSummary>(`/v1/admin/services/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  revertServiceToDraft(id: string): Promise<AdminServiceSummary> {
    return this.request<AdminServiceSummary>(`/v1/admin/services/${id}/revert-to-draft`, {
      method: 'POST',
      auth: true,
    });
  }

  getSiteSettings(): Promise<AdminSiteSettings> {
    return this.request<AdminSiteSettings>('/v1/admin/site-settings', { auth: true });
  }

  updateSiteSettings(body: UpdateSiteSettingsRequest): Promise<AdminSiteSettings> {
    return this.request<AdminSiteSettings>('/v1/admin/site-settings', {
      method: 'PATCH',
      body,
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

  setCountryHomepageFeatured(
    code: string,
    body: SetCountryHomepageFeaturedRequest,
  ): Promise<AdminCountry> {
    return this.request<AdminCountry>(`/v1/admin/catalogue/countries/${code}/homepage-featured`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  listAdminIntakeTerms(): Promise<AdminIntakeTerm[]> {
    return this.request<AdminIntakeTerm[]>('/v1/admin/catalogue/intake-terms', { auth: true });
  }

  createIntakeTerm(body: CreateIntakeTermRequest): Promise<AdminIntakeTerm> {
    return this.request<AdminIntakeTerm>('/v1/admin/catalogue/intake-terms', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  updateIntakeTerm(id: string, body: UpdateIntakeTermRequest): Promise<AdminIntakeTerm> {
    return this.request<AdminIntakeTerm>(`/v1/admin/catalogue/intake-terms/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  /* ---------------------------------------------------------- applications */

  listAdminApplications(
    query: { status?: string; tenantId?: string; page?: number; limit?: number } = {},
  ): Promise<AdminApplicationList> {
    return this.request<AdminApplicationList>(`/v1/admin/applications${toQuery(query)}`, {
      auth: true,
    });
  }

  getAdminApplication(id: string): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(`/v1/admin/applications/${id}`, { auth: true });
  }

  attachApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(
      `/v1/admin/applications/${applicationId}/documents/${documentId}`,
      { method: 'POST', auth: true },
    );
  }

  detachApplicationDocument(
    applicationId: string,
    documentId: string,
  ): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(
      `/v1/admin/applications/${applicationId}/documents/${documentId}`,
      { method: 'DELETE', auth: true },
    );
  }

  assignApplication(
    applicationId: string,
    body: AssignApplicationRequest,
  ): Promise<AdminApplicationDetail> {
    return this.request<AdminApplicationDetail>(`/v1/admin/applications/${applicationId}/assign`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  getApplicationAuditLog(applicationId: string): Promise<ResourceAuditLog> {
    return this.request<ResourceAuditLog>(`/v1/admin/applications/${applicationId}/audit-log`, {
      auth: true,
    });
  }

  listAssignableAdmins(): Promise<AssignableAdminList> {
    return this.request<AssignableAdminList>('/v1/admin/applications/assignable-admins', {
      auth: true,
    });
  }

  /* ------------------------------------------------------------- audit log */

  listAuditLog(
    query: { actorType?: string; resourceType?: string; page?: number; limit?: number } = {},
  ): Promise<AuditLogList> {
    return this.request<AuditLogList>(`/v1/admin/audit-log${toQuery(query)}`, { auth: true });
  }

  getStudentAuditLog(studentId: string): Promise<ResourceAuditLog> {
    return this.request<ResourceAuditLog>(`/v1/admin/students/${studentId}/audit-log`, { auth: true });
  }

  getTenantAuditLog(tenantId: string): Promise<ResourceAuditLog> {
    return this.request<ResourceAuditLog>(`/v1/admin/tenants/${tenantId}/audit-log`, { auth: true });
  }

  getAdminAuditLog(adminId: string): Promise<ResourceAuditLog> {
    return this.request<ResourceAuditLog>(`/v1/admin/admins/${adminId}/audit-log`, { auth: true });
  }

  /* --------------------------------------------------------------- admins */

  getCurrentAdminPermissions(): Promise<string[]> {
    return this.request('/v1/admin/account/permissions', { auth: true });
  }

  listAdminRoles(): Promise<AdminRoleSummary[]> {
    return this.request('/v1/admin/admins/roles', { auth: true });
  }

  createAdminRole(body: SaveAdminRoleRequest): Promise<AdminRoleSummary> {
    return this.request('/v1/admin/admins/roles', { method: 'POST', body, auth: true });
  }

  updateAdminRole(id: string, body: SaveAdminRoleRequest): Promise<AdminRoleSummary> {
    return this.request(`/v1/admin/admins/roles/${id}`, { method: 'PATCH', body, auth: true });
  }

  deleteAdminRole(id: string): Promise<void> {
    return this.request(`/v1/admin/admins/roles/${id}`, { method: 'DELETE', auth: true });
  }

  assignAdminRole(id: string, roleId: string): Promise<AdminSummary> {
    return this.request(`/v1/admin/admins/${id}/role`, { method: 'PATCH', body: { roleId }, auth: true });
  }

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
    return this.request<AdminSummary>(`/v1/admin/admins/${id}/suspend`, {
      method: 'POST',
      auth: true,
    });
  }

  reactivateAdmin(id: string): Promise<AdminSummary> {
    return this.request<AdminSummary>(`/v1/admin/admins/${id}/reactivate`, {
      method: 'POST',
      auth: true,
    });
  }

  /* ------------------------------------------------------------- students */

  listAdminStudents(
    query: { q?: string; page?: number; limit?: number } = {},
  ): Promise<AdminStudentList> {
    return this.request<AdminStudentList>(`/v1/admin/students${toQuery(query)}`, { auth: true });
  }

  getAdminStudent(id: string): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/v1/admin/students/${id}`, { auth: true });
  }

  updateAdminStudent(id: string, body: UpdateStudentAdminRequest): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>(`/v1/admin/students/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  createAdminStudent(body: AdminCreateStudentRequest): Promise<AdminStudentDetail> {
    return this.request<AdminStudentDetail>('/v1/admin/students', { method: 'POST', body, auth: true });
  }

  setAdminStudentPassword(id: string, body: SetStudentPasswordRequest): Promise<void> {
    return this.request<void>(`/v1/admin/students/${id}/set-password`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /* ------------------------------------------------------------ dashboard */

  getDashboardSummary(): Promise<AdminDashboardSummary> {
    return this.request<AdminDashboardSummary>('/v1/admin/dashboard/summary', { auth: true });
  }

  /* --------------------------------------------------------------- uploads */

  /** For an admin-authored content image (testimonial photo, institution logo/hero, article hero). */
  getContentUploadSignature(body: AdminUploadSignatureRequest): Promise<AdminUploadSignature> {
    return this.request<AdminUploadSignature>('/v1/admin/uploads/signature', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /* ------------------------------------------------------------ documents */

  listAdminStudentDocuments(studentId: string): Promise<StudentDocument[]> {
    return this.request<StudentDocument[]>(`/v1/admin/students/${studentId}/documents`, {
      auth: true,
    });
  }

  getAdminUploadSignature(
    studentId: string,
    body: UploadSignatureRequest,
  ): Promise<UploadSignature> {
    return this.request<UploadSignature>(
      `/v1/admin/students/${studentId}/documents/upload-signature`,
      {
        method: 'POST',
        body,
        auth: true,
      },
    );
  }

  confirmAdminDocumentUpload(
    documentId: string,
    body: ConfirmDocumentUploadRequest,
  ): Promise<StudentDocument> {
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

  approveDocument(documentId: string): Promise<StudentDocument> {
    return this.request<StudentDocument>(`/v1/admin/documents/${documentId}/approve`, {
      method: 'POST',
      auth: true,
    });
  }

  /* -------------------------------------------------------------- notifications */

  listNotifications(): Promise<Notification[]> {
    return this.request<Notification[]>('/v1/admin/notifications', { auth: true });
  }

  getUnreadNotificationCount(): Promise<UnreadCount> {
    return this.request<UnreadCount>('/v1/admin/notifications/unread-count', { auth: true });
  }

  markNotificationRead(id: string): Promise<Notification> {
    return this.request<Notification>(`/v1/admin/notifications/${id}/read`, {
      method: 'POST',
      auth: true,
    });
  }

  /* ------------------------------------------------------ notification templates */

  listNotificationTemplates(): Promise<NotificationTemplateSummary[]> {
    return this.request<NotificationTemplateSummary[]>('/v1/admin/notification-templates', { auth: true });
  }

  getNotificationTemplateDetail(id: string): Promise<NotificationTemplateDetail> {
    return this.request<NotificationTemplateDetail>(`/v1/admin/notification-templates/${id}`, { auth: true });
  }

  updateNotificationTemplate(
    id: string,
    body: UpdateNotificationTemplateRequest,
  ): Promise<NotificationTemplateDetail> {
    return this.request<NotificationTemplateDetail>(`/v1/admin/notification-templates/${id}`, {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  previewNotificationTemplate(
    id: string,
    body: PreviewNotificationTemplateRequest,
  ): Promise<NotificationTemplatePreview> {
    return this.request<NotificationTemplatePreview>(`/v1/admin/notification-templates/${id}/preview`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  /* -------------------------------------------------------------- messages */

  listConversations(): Promise<ConversationSummary[]> {
    return this.request<ConversationSummary[]>('/v1/admin/messages/conversations', { auth: true });
  }

  getConversation(id: string): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/v1/admin/messages/conversations/${id}`, { auth: true });
  }

  replyToConversation(id: string, body: SendMessageRequest): Promise<ConversationDetail> {
    return this.request<ConversationDetail>(`/v1/admin/messages/conversations/${id}/reply`, {
      method: 'POST',
      body,
      auth: true,
    });
  }

  composeMessage(body: ComposeMessageRequest): Promise<ComposeResult> {
    return this.request<ComposeResult>('/v1/admin/messages/compose', {
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
    return this.request<AdminAccount>('/v1/admin/account/me', {
      method: 'PATCH',
      body,
      auth: true,
    });
  }

  changeAccountPassword(body: ChangeAdminPasswordRequest): Promise<void> {
    return this.request<void>('/v1/admin/account/me/password', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  setupTotp(): Promise<TotpSetup> {
    return this.request<TotpSetup>('/v1/admin/account/me/2fa/setup', {
      method: 'POST',
      auth: true,
    });
  }

  enableTotp(body: VerifyTotpRequest): Promise<TotpEnabled> {
    return this.request<TotpEnabled>('/v1/admin/account/me/2fa/enable', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  disableTotp(body: DisableTotpRequest): Promise<void> {
    return this.request<void>('/v1/admin/account/me/2fa/disable', {
      method: 'POST',
      body,
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

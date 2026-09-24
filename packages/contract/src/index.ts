/**
 * The API contract.
 *
 * `generated.ts` is produced from the backend's OpenAPI document — the one the
 * running API serves at /docs-json — so these types cannot drift from the API.
 * Never edit it: regenerate with `pnpm --filter @rakuxon/contract generate`
 * after refreshing `openapi.json`.
 *
 * The aliases below are the shapes app code should import. They are derived
 * from the generated schemas rather than restated, so a backend change surfaces
 * as a typecheck failure here rather than a runtime surprise in a screen.
 */
import type { components, paths } from './generated';

export type { components, paths };

export type Schemas = components['schemas'];

export type AuthTokens = Schemas['AuthTokensDto'];
export type AuthUser = Schemas['AuthUserDto'];
export type LoginRequest = Schemas['LoginDto'];
export type RegisterAgencyRequest = Schemas['RegisterAgencyDto'];
export type RegisterStudentRequest = Schemas['RegisterStudentDto'];
export type RefreshRequest = Schemas['RefreshDto'];
export type UpdateMyProfileRequest = Schemas['UpdateMyProfileDto'];
export type ChangeMyPasswordRequest = Schemas['ChangeMyPasswordDto'];
export type HealthResponse = Schemas['HealthResponseDto'];
export type OnboardingLink = Schemas['OnboardingLinkDto'];
export type IssueOnboardingLinkRequest = Schemas['IssueOnboardingLinkDto'];
export type ConsumedLink = Schemas['ConsumedLinkDto'];
export type PeekOnboardingLinkRequest = Schemas['PeekOnboardingLinkDto'];
export type PeekedLink = Schemas['PeekedLinkDto'];
export type RegisterViaOnboardingLinkRequest = Schemas['RegisterViaOnboardingLinkDto'];
export type OnboardingLinkSummary = Schemas['OnboardingLinkSummaryDto'];
export type OnboardingLinkList = Schemas['OnboardingLinkListDto'];
export type StudentProfile = Schemas['StudentProfileDto'];
export type UpdateStudentProfileRequest = Schemas['UpdateStudentProfileDto'];
export type Address = Schemas['AddressDto'];
export type EducationHistoryEntry = Schemas['EducationHistoryEntryDto'];
export type QualificationLevel = Schemas['QualificationLevel'];
export type DocumentType = Schemas['DocumentType'];
export type DocumentStatus = Schemas['DocumentStatus'];
export type UploadSignatureRequest = Schemas['UploadSignatureRequestDto'];
export type UploadSignature = Schemas['UploadSignatureDto'];
export type ConfirmDocumentUploadRequest = Schemas['ConfirmDocumentUploadDto'];
export type StudentDocument = Schemas['DocumentDto'];
export type RejectDocumentRequest = Schemas['RejectDocumentDto'];
export type AdminUploadSignatureRequest = Schemas['AdminUploadSignatureRequestDto'];
export type AdminUploadSignature = Schemas['AdminUploadSignatureDto'];

export type Notification = Schemas['NotificationDto'];
export type UnreadCount = Schemas['UnreadCountDto'];
export type CreateApplicationRequest = Schemas['CreateApplicationDto'];
export type Application = Schemas['ApplicationDto'];
export type ReferenceCountry = Schemas['CountryDto'];
export type CountryCount = Schemas['CountryCountDto'];
export type ArticleSummary = Schemas['ArticleSummaryDto'];
export type ArticleList = Schemas['ArticleListDto'];
export type InstitutionSummary = Schemas['InstitutionSummaryDto'];
export type InstitutionList = Schemas['InstitutionListDto'];
export type CourseSummary = Schemas['CourseSummaryDto'];
export type CourseList = Schemas['CourseListDto'];

export type Testimonial = Schemas['TestimonialDto'];
export type IntakeTerm = Schemas['IntakeTermDto'];
export type Service = Schemas['ServiceDto'];
export type ServiceFaq = Schemas['ServiceFaqDto'];

export type SiteSettings = Schemas['SiteSettingsDto'];
export type AdminSiteSettings = Schemas['AdminSiteSettingsDto'];
export type UpdateSiteSettingsRequest = Schemas['UpdateSiteSettingsDto'];

/*
 * Admin — a fully separate identity system from the above (own table, own
 * tokens), so these are kept in their own block rather than interleaved.
 */
export type AdminLoginRequest = Schemas['AdminLoginDto'];
export type AdminRefreshRequest = Schemas['AdminRefreshDto'];
export type AdminSession = Schemas['AdminSessionDto'];
export type AdminAuthTokens = Schemas['AdminAuthTokensDto'];
export type AdminLoginChallenge = Schemas['AdminLoginChallengeDto'];
export type AdminLoginResult = AdminAuthTokens | AdminLoginChallenge;
export type VerifyAdminTotpLoginRequest = Schemas['VerifyAdminTotpLoginDto'];
export type RequestAdminPasswordResetRequest = Schemas['RequestAdminPasswordResetDto'];
export type ConfirmAdminPasswordResetRequest = Schemas['ConfirmAdminPasswordResetDto'];

export type AdminAccount = Schemas['AdminAccountDto'];
export type UpdateAdminProfileRequest = Schemas['UpdateAdminProfileDto'];
export type ChangeAdminPasswordRequest = Schemas['ChangeAdminPasswordDto'];
export type TotpSetup = Schemas['TotpSetupDto'];
export type VerifyTotpRequest = Schemas['VerifyTotpDto'];
export type TotpEnabled = Schemas['TotpEnabledDto'];
export type DisableTotpRequest = Schemas['DisableTotpDto'];

export type Permission = Schemas['PermissionDto'];
export type CreateAdminRequest = Schemas['CreateAdminDto'];
export type UpdateAdminPermissionsRequest = Schemas['UpdateAdminPermissionsDto'];
export type AdminSummary = Schemas['AdminSummaryDto'];
export type AdminList = Schemas['AdminListDto'];

export type Tenant = Schemas['TenantDto'];
export type TenantList = Schemas['TenantListDto'];
export type TenantStatus = Schemas['TenantStatus'];
export type AdminCreateTenantRequest = Schemas['AdminCreateTenantDto'];
export type UpdateTenantRequest = Schemas['UpdateTenantDto'];
export type TenantStaff = Schemas['TenantStaffDto'];
export type TenantStaffList = Schemas['TenantStaffListDto'];
export type CreateTenantStaffRequest = Schemas['CreateTenantStaffDto'];
export type SetTenantStaffPasswordRequest = Schemas['SetTenantStaffPasswordDto'];

export type AdminInstitutionSummary = Schemas['AdminInstitutionSummaryDto'];
export type AdminInstitutionList = Schemas['AdminInstitutionListDto'];
export type AdminCourseSummary = Schemas['AdminCourseSummaryDto'];
export type AdminCourseList = Schemas['AdminCourseListDto'];
export type AdminArticleSummary = Schemas['AdminArticleSummaryDto'];
export type AdminArticleList = Schemas['AdminArticleListDto'];
export type PublishStatus = Schemas['PublishStatus'];
export type AdminCountry = Schemas['AdminCountryDto'];
export type SetCountryHomepageFeaturedRequest = Schemas['SetCountryHomepageFeaturedDto'];
export type AdminIntakeTerm = Schemas['AdminIntakeTermDto'];
export type CreateIntakeTermRequest = Schemas['CreateIntakeTermDto'];
export type UpdateIntakeTermRequest = Schemas['UpdateIntakeTermDto'];

export type AdminArticleDetail = Schemas['AdminArticleDetailDto'];
export type UpdateArticleRequest = Schemas['UpdateArticleDto'];
export type CreateArticleRequest = Schemas['CreateArticleDto'];

export type AdminInstitutionDetail = Schemas['AdminInstitutionDetailDto'];
export type UpdateInstitutionRequest = Schemas['UpdateInstitutionDto'];
export type CreateInstitutionRequest = Schemas['CreateInstitutionDto'];
export type CampusShape = Schemas['CampusDto'];
export type RequirementGroupShape = Schemas['RequirementGroupDto'];
export type RequirementItemShape = Schemas['RequirementItemDto'];
export type EnglishTestShape = Schemas['EnglishTestDto'];
export type FaqShape = Schemas['FaqDto'];
export type QualityRatingShape = Schemas['QualityRatingDto'];
export type ScholarshipShape = Schemas['ScholarshipDto'];
export type IntakeShape = Schemas['IntakeDto'];

export type AdminCourseDetail = Schemas['AdminCourseDetailDto'];
export type UpdateCourseRequest = Schemas['UpdateCourseDto'];
export type CreateCourseRequest = Schemas['CreateCourseDto'];
export type StudyLevel = Schemas['StudyLevel'];
export type StudyMode = Schemas['StudyMode'];
export type TuitionPeriod = Schemas['TuitionPeriod'];

export type AdminApplicationSummary = Schemas['AdminApplicationSummaryDto'];
export type AdminApplicationList = Schemas['AdminApplicationListDto'];
export type AdminApplicationDetail = Schemas['AdminApplicationDetailDto'];
export type AssignApplicationRequest = Schemas['AssignApplicationDto'];
export type AssignableAdmin = Schemas['AssignableAdminDto'];
export type AssignableAdminList = Schemas['AssignableAdminListDto'];

export type AdminStudentSummary = Schemas['AdminStudentSummaryDto'];
export type AdminStudentList = Schemas['AdminStudentListDto'];
export type AdminStudentDetail = Schemas['AdminStudentDetailDto'];
export type UpdateStudentAdminRequest = Schemas['UpdateStudentAdminDto'];
export type AdminCreateStudentRequest = Schemas['AdminCreateStudentDto'];
export type SetStudentPasswordRequest = Schemas['SetStudentPasswordDto'];

export type AuditLogEntry = Schemas['AuditLogEntryDto'];
export type AuditLogList = Schemas['AuditLogListDto'];
export type ResourceAuditLog = Schemas['ResourceAuditLogDto'];

export type StatusCount = Schemas['StatusCountDto'];
export type AdminDashboardSummary = Schemas['AdminDashboardSummaryDto'];

export type AdminTestimonialSummary = Schemas['AdminTestimonialSummaryDto'];
export type AdminTestimonialList = Schemas['AdminTestimonialListDto'];
export type AdminTestimonialDetail = Schemas['AdminTestimonialDetailDto'];
export type CreateTestimonialRequest = Schemas['CreateTestimonialDto'];
export type UpdateTestimonialRequest = Schemas['UpdateTestimonialDto'];

export type DestinationCard = Schemas['DestinationCardDto'];
export type DestinationGuide = Schemas['DestinationDto'];
export type DestinationFact = Schemas['DestinationFactDto'];
export type AdminDestinationSummary = Schemas['AdminDestinationSummaryDto'];
export type AdminDestinationList = Schemas['AdminDestinationListDto'];
export type AdminDestinationDetail = Schemas['AdminDestinationDetailDto'];
export type CreateDestinationRequest = Schemas['CreateDestinationDto'];
export type UpdateDestinationRequest = Schemas['UpdateDestinationDto'];

export type AdminServiceSummary = Schemas['AdminServiceSummaryDto'];
export type AdminServiceList = Schemas['AdminServiceListDto'];
export type AdminServiceDetail = Schemas['AdminServiceDetailDto'];
export type CreateServiceRequest = Schemas['CreateServiceDto'];
export type UpdateServiceRequest = Schemas['UpdateServiceDto'];

export type MediaAssetCategory = Schemas['MediaAssetCategory'];
export type MediaAsset = Schemas['MediaAssetDto'];
export type MediaAssetList = Schemas['MediaAssetListDto'];
export type CreateMediaAssetRequest = Schemas['CreateMediaAssetDto'];
export type UpdateMediaAssetRequest = Schemas['UpdateMediaAssetDto'];

export type NotificationTemplateSummary = Schemas['NotificationTemplateSummaryDto'];
export type NotificationTemplateDetail = Schemas['NotificationTemplateDetailDto'];
export type UpdateNotificationTemplateRequest = Schemas['UpdateNotificationTemplateDto'];
export type PreviewNotificationTemplateRequest = Schemas['PreviewNotificationTemplateDto'];
export type NotificationTemplatePreview = Schemas['NotificationTemplatePreviewDto'];

export type Message = Schemas['MessageDto'];
export type ConversationSummary = Schemas['ConversationSummaryDto'];
export type ConversationDetail = Schemas['ConversationDetailDto'];
export type SendMessageRequest = Schemas['SendMessageDto'];
export type StartConversationRequest = Schemas['StartConversationDto'];
export type AssignedAdmin = Schemas['AssignedAdminDto'];
export type ComposeMessageRequest = Schemas['ComposeMessageDto'];
export type ComposeResult = Schemas['ComposeResultDto'];

/** Mirrors the backend enum. Kept as a const object so it survives erasure. */
export const Role = {
  PlatformAdmin: 'platform_admin',
  AgencyAdmin: 'agency_admin',
  Counselor: 'counselor',
  InstitutionUser: 'institution_user',
  Student: 'student',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

/** Every path the API serves, for the client to key off. */
export type ApiPath = keyof paths;

export type AdminRoleSummary = Schemas['AdminRoleSummaryDto'];
export type SaveAdminRoleRequest = Schemas['SaveAdminRoleDto'];

/*
 * Agency — a partner's own view of their tenant. List/detail shapes are the
 * same `Admin*`/`TenantStaff*` DTOs the platform-admin screens use (the
 * backend wraps the same services with tenant scoping rather than
 * duplicating the response shape), so only the agency-specific requests and
 * the dashboard summary need their own alias here.
 */
export type AgencyDashboardSummary = Schemas['AgencyDashboardSummaryDto'];
export type CreateAgencyStaffRequest = Schemas['CreateAgencyStaffDto'];
export type CreateAgencyStudentRequest = Schemas['CreateAgencyStudentDto'];

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
export type HealthResponse = Schemas['HealthResponseDto'];
export type OnboardingLink = Schemas['OnboardingLinkDto'];
export type IssueOnboardingLinkRequest = Schemas['IssueOnboardingLinkDto'];
export type ConsumedLink = Schemas['ConsumedLinkDto'];
export type PeekOnboardingLinkRequest = Schemas['PeekOnboardingLinkDto'];
export type PeekedLink = Schemas['PeekedLinkDto'];
export type RegisterViaOnboardingLinkRequest = Schemas['RegisterViaOnboardingLinkDto'];
export type StudentProfile = Schemas['StudentProfileDto'];
export type UpdateStudentProfileRequest = Schemas['UpdateStudentProfileDto'];
export type Address = Schemas['AddressDto'];
export type EducationHistoryEntry = Schemas['EducationHistoryEntryDto'];
export type DocumentType = Schemas['DocumentType'];
export type DocumentStatus = Schemas['DocumentStatus'];
export type UploadSignatureRequest = Schemas['UploadSignatureRequestDto'];
export type UploadSignature = Schemas['UploadSignatureDto'];
export type ConfirmDocumentUploadRequest = Schemas['ConfirmDocumentUploadDto'];
export type StudentDocument = Schemas['DocumentDto'];
export type CreateApplicationRequest = Schemas['CreateApplicationDto'];
export type Application = Schemas['ApplicationDto'];
export type ReferenceCountry = Schemas['CountryDto'];
export type CountryCount = Schemas['CountryCountDto'];
export type ArticleSummary = Schemas['ArticleSummaryDto'];
export type ArticleList = Schemas['ArticleListDto'];

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

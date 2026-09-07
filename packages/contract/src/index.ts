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
export type RefreshRequest = Schemas['RefreshDto'];
export type HealthResponse = Schemas['HealthResponseDto'];
export type OnboardingLink = Schemas['OnboardingLinkDto'];
export type IssueOnboardingLinkRequest = Schemas['IssueOnboardingLinkDto'];
export type ConsumedLink = Schemas['ConsumedLinkDto'];

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

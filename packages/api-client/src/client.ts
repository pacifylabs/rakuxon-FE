import type {
  AuthTokens,
  ConsumedLink,
  HealthResponse,
  IssueOnboardingLinkRequest,
  LoginRequest,
  OnboardingLink,
  RegisterAgencyRequest,
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

  issueOnboardingLink(body: IssueOnboardingLinkRequest): Promise<OnboardingLink> {
    return this.request<OnboardingLink>('/v1/onboarding-links', {
      method: 'POST',
      body,
      auth: true,
    });
  }

  consumeOnboardingLink(token: string): Promise<ConsumedLink> {
    return this.request<ConsumedLink>('/v1/onboarding-links/consume', {
      method: 'POST',
      body: { token },
    });
  }
}

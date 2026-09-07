# Apps and ports

| App | Port | Who signs in | Notes |
|---|---|---|---|
| `base-site` | 3000 | nobody | Public marketing and catalogue browsing |
| `partner-app` | 3002 | `agency_admin`, `counselor` | Registers agencies; the only app with self-service sign-up |
| `institution-portal` | 3003 | `institution_user` | Accounts are provisioned, not self-registered |
| `admin` | 3004 | `platform_admin` | Accounts are provisioned, not self-registered |

The API runs on 3001. **Every app origin must be listed in the API's
`CORS_ORIGINS`** — a missing entry shows up in the browser as "could not reach
the server", which reads as the API being down rather than a policy refusal.

`student-app` is stage 3 work and is not built yet.

# EricCRM

EricCRM is a Next.js 16 CRM backed by Neon PostgreSQL, Prisma 7, and Neon Auth. Public users register as **Sales Agents / Pending Approval**; verified users remain outside the CRM until an administrator approves and assigns them.

## Local setup

1. Create or select a Neon project and run `npm ci` to install the exact dependency versions from `package-lock.json`. If dependencies were already installed before pulling an update, run `npm install` again before starting the app.
2. Copy `.env.example` to `.env.local`. Set the pooled and direct Neon connection strings. Set `CRM_ORGANIZATION_ID` to the UUID of the single existing row in `workspaces` that this deployment serves.
3. In **Neon Console → Auth**, enable Email & Password, require email verification, and configure your production-capable email provider. Neon Auth—not EricCRM—stores passwords and issues sessions, verification links, and reset tokens.
4. Add allowed application origins (`http://localhost:3000` locally and the deployed HTTPS origin) and callback URLs:
   - `<origin>/verify-email`
   - `<origin>/reset-password`
   - `<origin>/api/auth/callback/*` if requested by the Neon Console configuration
5. Copy the Auth endpoint shown by Neon to `NEON_AUTH_BASE_URL`. The application proxies the documented Better Auth-compatible endpoints under `/api/auth/*`, so auth cookies remain first-party.
6. Apply existing migrations without resetting data: `npx prisma migrate deploy`. Generate the client with `npx prisma generate`.
7. Start with `npm run dev` and register at `/register`.

If `NEON_AUTH_BASE_URL` is absent, protected pages redirect to the sign-in screen and auth API requests return `503 Authentication service is not configured` instead of crashing server rendering. Set the variable to the Auth endpoint from the Neon Console and restart the Next.js server to enable authentication.

Do not use a development/no-op email sender in production. If verification or reset messages do not arrive, review the Neon Auth email-provider logs; the app intentionally never reports that an account exists on the forgot-password screen.

## Initial administrator (explicit bootstrap)

There are no default credentials and the first registrant is never promoted automatically.

1. Register the intended administrator normally and complete email verification through Neon Auth.
2. Confirm in **Neon Console → Auth → Users** that the user is verified.
3. Run `npm run bootstrap:admin -- admin@example.com` with `DATABASE_URL_UNPOOLED` configured. You may pass the Neon Auth user ID instead of the email.
4. The command only promotes an already-provisioned CRM profile, activates it, and writes an audit event. Sign in again and visit `/admin/users` to create teams in the database and administer subsequent registrations.

## Authorization model

- Every protected page and API handler reloads both the Neon Auth session and current CRM profile. Unverified, pending, rejected, and suspended identities cannot access CRM data, including when an old provider session cookie remains valid.
- Admins can manage users and all records; Sales Managers are constrained to their assigned team; Sales Agents are constrained to assigned records. Reuse `requireActiveUser` and `canAccessRecord` in every new CRM query/action.
- Registration never accepts role, status, organization, or team. Organization comes only from the server-side `CRM_ORGANIZATION_ID` setting.
- Provider-managed authentication tables are never written by CRM code. Email changes, password hashes, sessions, verification state, and reset tokens stay authoritative in Neon Auth.
- Administrative mutations validate organization/team boundaries, require a team for active non-admins, protect the last active administrator, and write before/after details to `AuditLog` without secrets.

## Validation

Run `npm test`, `npm run lint`, `npx prisma validate`, and `npm run build`. Integration validation against a configured Neon project should cover registration/duplicate email, verification/resend, password reset, approval with team assignment, status changes while signed in, and rejected non-admin calls to `/api/admin/users`.

# Security Fixes Design (2026-02-26)

## Scope
Fix the critical and high-risk findings from the security review:
1) Restrict `/api/admin/set-admin` to existing admins (app-level authz).
2) Add database-level RLS to prevent non-admin role changes.
3) Remove raw HTML rendering in Markdown preview to prevent XSS.

## Goals
- Eliminate privilege escalation via the admin promotion endpoint.
- Add a defense-in-depth layer at the database using Supabase RLS.
- Prevent stored XSS via Markdown preview rendering.

## Non-goals
- Full security hardening across all endpoints.
- UI or product changes beyond required security fixes.

## Proposed Approach
### 1) Admin route hardening (app layer)
- Update `app/api/admin/set-admin/route.ts` to check admin status before updating role.
- Reuse existing `checkIsAdmin()` (or create a local helper if needed) to ensure server-side authorization.
- Non-admin requests return 403.

### 2) Supabase RLS (DB layer)
- Add/adjust RLS policy on `users` table to only allow updates to `role` when the requester is admin.
- Apply policy via SQL (to be run in Supabase SQL editor).
- Note: this is required even if application code is correct.

### 3) Markdown XSS hardening
- In `components/content/markdown-preview.tsx`, remove `rehype-raw` to disallow raw HTML rendering.
- If HTML support is required later, add a strict sanitizer and review allowed tags/attributes.

## Data Flow / Security Boundaries
- Admin elevation is controlled at both application and database layers.
- Markdown preview handles user-supplied content as untrusted and renders without raw HTML passthrough.

## Error Handling
- Return `403` for unauthorized admin route access.
- Preserve existing error behavior for other failures.

## Testing
- Manual check: non-admin user calling `/api/admin/set-admin` receives 403.
- Manual check: admin user can still update roles.
- Manual check: Markdown preview renders text/markdown but strips raw HTML.

## Rollout
- Apply code changes.
- Execute RLS SQL in Supabase.
- Verify behavior in staging.

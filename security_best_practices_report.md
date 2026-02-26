# Security Best Practices Report - AI-Dating

## Executive summary
I scanned the Next.js (App Router) + React codebase for high-impact security issues using the project’s current server routes, server actions, and frontend rendering paths. I found one critical privilege-escalation endpoint, one high-risk XSS vector, and several medium-risk issues around OAuth logging/redirect handling and upload validation. Fixing the critical and high findings should be prioritized before any production exposure.

---

## Critical

### [NJS-001] Any authenticated user can escalate to admin via public API route
- **Severity:** Critical
- **Location:** `/Users/a77/Desktop/AI-Dating/app/api/admin/set-admin/route.ts` (POST), lines 4-36
- **Evidence:**
  ```ts
  export async function POST() {
    const supabase = await createClient()
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    ...
    const { error: updateError } = await supabase
      .from('users')
      .update({ role: 'admin' })
      .eq('id', user.id)
  }
  ```
- **Impact:** Any logged-in user can grant themselves admin privileges. This is a full account takeover of administrative capabilities.
- **Fix:** Remove this route entirely, or require a verified admin check before updating roles (e.g., `checkIsAdmin()` with a strict allowlist). Enforce role changes via a secure admin-only interface and server-side authorization checks.
- **Mitigation:** Add database RLS policies that prevent non-admins from updating the `role` column regardless of API logic.
- **False positive notes:** Only safe if this route is entirely disabled in production and blocked at the edge, which is not visible in repo code.

---

## High

### [REACT-001] Markdown preview renders raw HTML without sanitization (XSS)
- **Severity:** High
- **Location:** `/Users/a77/Desktop/AI-Dating/components/content/markdown-preview.tsx`, lines 13-21
- **Evidence:**
  ```tsx
  <ReactMarkdown
    remarkPlugins={[remarkGfm]}
    rehypePlugins={[rehypeHighlight, rehypeRaw]}
  >
    {content}
  </ReactMarkdown>
  ```
- **Impact:** If `content` is user-controlled (e.g., posts, comments, CMS), `rehype-raw` allows raw HTML injection, enabling stored XSS.
- **Fix:** Remove `rehypeRaw` or sanitize with a strict allowlist (`rehype-sanitize` or DOMPurify) before rendering. Ensure HTML passthrough is disabled unless explicitly required.
- **Mitigation:** Add CSP with `script-src` restrictions and consider Trusted Types.
- **False positive notes:** If `content` is strictly trusted and never user-controlled, risk is reduced; verify data origin.

---

## Medium

### [NJS-002] OAuth callback logs sensitive auth data and uses request-derived origin
- **Severity:** Medium
- **Location:** `/Users/a77/Desktop/AI-Dating/app/auth/callback/route.ts`, lines 4-18, 47-49
- **Evidence:**
  ```ts
  const code = requestUrl.searchParams.get('code')
  const origin = requestUrl.origin
  console.log('Auth callback received, code:', code ? 'present' : 'missing')
  ...
  return NextResponse.redirect(`${origin}/`)
  ```
- **Impact:** Auth codes are sensitive and should not be logged. Using `requestUrl.origin` trusts Host headers; a malicious Host header could influence redirects (host header injection/open redirect) if requests reach this endpoint directly.
- **Fix:** Remove auth code logging entirely. Use a canonical origin from config (e.g., `process.env.NEXT_PUBLIC_SITE_URL`) and validate it.
- **Mitigation:** Enforce a strict allowed host list at the edge/reverse proxy.
- **False positive notes:** If upstream infrastructure normalizes/blocks host header spoofing, redirect risk is reduced; still avoid logging auth codes.

### [NJS-003] Image upload validation trusts client-provided MIME type only
- **Severity:** Medium
- **Location:** `/Users/a77/Desktop/AI-Dating/lib/cloudflare/r2.ts`, lines 58-69; `/Users/a77/Desktop/AI-Dating/lib/actions/upload.ts`, lines 13-41
- **Evidence:**
  ```ts
  const ALLOWED_TYPES = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp']
  if (!ALLOWED_TYPES.includes(file.type)) {
    return '只支持 JPG、PNG、GIF、WebP 格式的图片'
  }
  ```
- **Impact:** Browsers supply `file.type`; attackers can spoof this and upload non-image content, potentially leading to stored XSS or malware distribution if served publicly.
- **Fix:** Perform server-side content sniffing (magic bytes) and optionally re-encode images server-side. Set `Content-Disposition: attachment` for untrusted files.
- **Mitigation:** Store uploads in a non-public bucket and serve through a proxy that enforces content-type and download headers.
- **False positive notes:** Risk depends on how uploaded files are served and whether any downstream sanitization/processing exists.

### [NJS-004] Video upload presign validates content-type from client input only
- **Severity:** Medium
- **Location:** `/Users/a77/Desktop/AI-Dating/lib/actions/upload-video.ts`, lines 27-45
- **Evidence:**
  ```ts
  if (!ALLOWED_VIDEO_TYPES.includes(contentType)) {
    return { error: '只支持 MP4、MOV、WebM、AVI 格式的视频' }
  }
  const command = new PutObjectCommand({
    Bucket: BUCKET_NAME,
    Key: key,
    ContentType: contentType,
  })
  ```
- **Impact:** Client-supplied content-type can be spoofed; non-video content could be uploaded and served publicly, increasing XSS or malware risk.
- **Fix:** Validate actual file content on upload (server-side ingestion step) or require a post-upload verification job that inspects the object before making it public.
- **Mitigation:** Serve videos via a proxy that enforces content-type and disallows HTML/SVG.
- **False positive notes:** If your CDN enforces strict MIME or you have downstream processing, risk is reduced.

---

## Notes / Verification recommended
- I did not see explicit CSP/security headers in code. If you set them at the edge (Vercel/Cloudflare), verify runtime headers include CSP, `X-Content-Type-Options`, and clickjacking protections.
- Supabase auth uses cookies; ensure state-changing endpoints that are not Server Actions have CSRF protections (the admin route above is state-changing and cookie-authenticated).


import type { NextConfig } from "next";

/**
 * Content-Security-Policy
 *
 * 'unsafe-inline' is required for style-src because:
 *  - Admin components (AdminShell, ProgramForm, OpportunityForm, tables,
 *    login page) all use inline <style> tags for scoping
 *  - MUI (if still in use) injects styles at runtime via Emotion
 *
 * 'unsafe-inline' is ALSO required for script-src because Next.js
 * itself injects a small inline <script> on every page to bootstrap
 * hydration and pass the RSC payload to the client. Without it, React
 * never hydrates — the page renders its HTML/CSS but no interactivity
 * works (confirmed: this caused the admin login form to render its
 * layout but not its actual inputs/button on first deploy of this CSP).
 *
 * 'unsafe-eval' is added ONLY in development. React uses eval() in
 * dev mode to reconstruct readable call stacks for error messages and
 * debugging overlays. Neither React nor Next.js use eval() in
 * production builds, so production keeps the stricter policy with no
 * unsafe-eval at all — this only loosens the LOCAL dev experience.
 *
 * Nonce-based CSP was considered as the stricter alternative for
 * script/style inline content but rejected: it requires every page
 * using inline scripts/styles to opt into dynamic rendering, which
 * conflicts directly with the SSG + ISR architecture used across the
 * public site (revalidate = 60 on /programs, /opportunities, etc —
 * see ARCHITECTURE.md). Revisit this if the public site is ever
 * migrated to fully dynamic rendering.
 *
 * Even with 'unsafe-inline', this CSP still blocks scripts loaded from
 * any third-party domain (script-src has no external origins listed),
 * which is the more common real-world XSS injection vector.
 */
const isDev = process.env.NODE_ENV === "development";

const cspHeader = `
  default-src 'self';
  script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""};
  style-src 'self' 'unsafe-inline';
  img-src 'self' blob: data: https:;
  font-src 'self' data:;
  connect-src 'self' https://*.supabase.co;
  object-src 'none';
  base-uri 'self';
  form-action 'self';
  frame-ancestors 'none';
  upgrade-insecure-requests;
`.replace(/\s{2,}/g, " ").trim();

const securityHeaders = [
    {
        key: "Content-Security-Policy",
        value: cspHeader,
    },
    {
        // Prevents the site from being embedded in an <iframe> anywhere —
        // mitigates clickjacking. Superseded by CSP frame-ancestors above
        // in modern browsers, but kept for older browser compatibility.
        key: "X-Frame-Options",
        value: "DENY",
    },
    {
        // Stops browsers guessing content types — prevents a malicious
        // upload (e.g. disguised as an image) from being executed as script.
        key: "X-Content-Type-Options",
        value: "nosniff",
    },
    {
        // Controls how much referrer information is sent on navigation.
        // Keeps the referrer for same-origin and top-level cross-origin
        // navigation, but strips it for downgrades (https -> http).
        key: "Referrer-Policy",
        value: "strict-origin-when-cross-origin",
    },
    {
        // Disables browser features this site has no legitimate use for.
        // Reduces attack surface if a malicious script ever did get through.
        key: "Permissions-Policy",
        value: "camera=(), microphone=(), geolocation=(), payment=(), usb=(), browsing-topics=()",
    },
    {
        // Forces HTTPS for this domain (and subdomains) for 2 years,
        // including on the very first visit if the domain is preloaded.
        // Only meaningful in production over HTTPS — harmless in dev.
        key: "Strict-Transport-Security",
        value: "max-age=63072000; includeSubDomains; preload",
    },
];

const nextConfig: NextConfig = {
    /* config options here */

    async headers() {
        return [
            {
                // Apply to every route in the app
                source: "/:path*",
                headers: securityHeaders,
            },
        ];
    },
};

export default nextConfig;
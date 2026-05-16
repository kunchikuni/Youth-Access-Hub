"use client";

/**
 * Executive Login Page
 * Route: /admin/login
 *
 * Signs in via Supabase Auth. On success the middleware
 * redirects to /admin. On failure an inline error is shown.
 *
 * @module app/admin/login/page
 */

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "src/lib/supabase/client";
import Button from "src/components/ui/Button";

export default function AdminLoginPage() {
    const router = useRouter();
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [error, setError] = useState<string | null>(null);
    const [loading, setLoading] = useState(false);

    async function handleLogin(e: React.FormEvent) {
        e.preventDefault();
        setError(null);
        setLoading(true);

        const supabase = createClient();
        const { error } = await supabase.auth.signInWithPassword({
            email,
            password,
        });

        if (error) {
            setError("Invalid email or password. Please try again.");
            setLoading(false);
            return;
        }

        router.push("/admin");
        router.refresh();
    }

    return (
        <div className="login-root">

            {/* ── Left panel — brand ── */}
            <div className="login-brand">
                <div className="login-brand-inner">

                    <div className="login-logo-mark" aria-hidden="true">
                        <svg width="48" height="48" viewBox="0 0 48 48" fill="none">
                            <circle cx="24" cy="24" r="24" fill="var(--yah-orange)" opacity="0.15" />
                            <circle cx="24" cy="24" r="16" fill="var(--yah-orange)" opacity="0.25" />
                            <circle cx="24" cy="24" r="8"  fill="var(--yah-orange)" />
                        </svg>
                    </div>

                    <h1 className="login-brand-name">Youth Access Hub</h1>
                    <p className="login-brand-tagline">Empowering Youth, Opening Opportunities</p>

                    <div className="login-brand-divider" aria-hidden="true" />

                    <p className="login-brand-desc">
                        Executive portal — manage programs, opportunities, and content
                        published to the YAH website.
                    </p>

                    <div className="login-grid-deco" aria-hidden="true">
                        {Array.from({ length: 30 }).map((_, i) => (
                            <div key={i} className="login-grid-dot" />
                        ))}
                    </div>
                </div>
            </div>

            {/* ── Right panel — form ── */}
            <div className="login-form-panel">
                <div className="login-form-card">

                    <div className="login-form-header">
                        <div className="login-badge">Executive Access</div>
                        <h2 className="login-title">Sign in to your account</h2>
                        <p className="login-subtitle">
                            Authorised YAH executives only. Contact your administrator if
                            you need access.
                        </p>
                    </div>

                    <form onSubmit={handleLogin} className="login-form" noValidate>

                        {/* Email */}
                        <div className="login-field">
                            <label htmlFor="email" className="login-label">
                                Email address
                            </label>
                            <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M22 6l-10 7L2 6" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                                <input
                                    id="email"
                                    type="email"
                                    autoComplete="email"
                                    required
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                    className="login-input"
                                    placeholder="you@example.com"
                                />
                            </div>
                        </div>

                        {/* Password */}
                        <div className="login-field">
                            <label htmlFor="password" className="login-label">
                                Password
                            </label>
                            <div className="login-input-wrap">
                <span className="login-input-icon" aria-hidden="true">
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                    <path d="M7 11V7a5 5 0 0110 0v4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                                <input
                                    id="password"
                                    type="password"
                                    autoComplete="current-password"
                                    required
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                    className="login-input"
                                    placeholder="••••••••"
                                />
                            </div>
                        </div>

                        {/* Error */}
                        {error && (
                            <div className="login-error" role="alert">
                                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
                                    <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="1.75" />
                                    <line x1="12" y1="8" x2="12" y2="12" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" />
                                    <line x1="12" y1="16" x2="12.01" y2="16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
                                </svg>
                                <span>{error}</span>
                            </div>
                        )}

                        {/* Submit */}
                        <Button
                            type="submit"
                            variant="secondary"
                            size="lg"
                            fullWidth
                            loading={loading}
                            trailingIcon={
                                !loading ? (
                                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                                        <path d="M3 8h10M9 4l4 4-4 4" stroke="currentColor" strokeWidth="1.75" strokeLinecap="round" strokeLinejoin="round" />
                                    </svg>
                                ) : undefined
                            }
                        >
                            {loading ? "Signing in…" : "Sign in"}
                        </Button>

                    </form>

                    <p className="login-footer-note">
                        This portal is restricted to authorised YAH executives.
                        <br />
                        Not an executive?{" "}
                        <a href="/public" className="login-back-link">
                            Return to website
                        </a>
                    </p>

                </div>
            </div>

            <style>{`
        .login-root {
          min-height: 100vh;
          display: grid;
          grid-template-columns: 1fr 1fr;
          font-family: var(--font-body);
        }

        /* Brand panel */
        .login-brand {
          background-color: var(--yah-navy);
          background-image:
            radial-gradient(ellipse at 20% 50%, rgba(75, 159, 212, 0.18) 0%, transparent 60%),
            radial-gradient(ellipse at 80% 20%, rgba(43, 174, 142, 0.14) 0%, transparent 55%);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem;
          overflow: hidden;
        }

        .login-brand-inner {
          max-width: 380px;
        }

        .login-logo-mark {
          margin-bottom: 1.75rem;
        }

        .login-brand-name {
          font-family: var(--font-heading);
          font-size: 2rem;
          font-weight: 800;
          color: var(--yah-white);
          line-height: 1.15;
          margin: 0 0 0.5rem;
          letter-spacing: -0.02em;
        }

        .login-brand-tagline {
          font-size: 0.875rem;
          color: var(--yah-orange);
          font-weight: 600;
          letter-spacing: 0.04em;
          text-transform: uppercase;
          margin: 0 0 2rem;
        }

        .login-brand-divider {
          width: 40px;
          height: 3px;
          background: var(--yah-teal);
          border-radius: 2px;
          margin-bottom: 1.5rem;
        }

        .login-brand-desc {
          font-size: 0.9375rem;
          color: rgba(255, 255, 255, 0.65);
          line-height: 1.7;
          margin: 0;
        }

        .login-grid-deco {
          display: grid;
          grid-template-columns: repeat(6, 1fr);
          gap: 10px;
          margin-top: 3rem;
          opacity: 0.2;
        }

        .login-grid-dot {
          width: 4px;
          height: 4px;
          border-radius: 50%;
          background: var(--yah-white);
        }

        /* Form panel */
        .login-form-panel {
          background-color: var(--yah-off-white);
          display: flex;
          align-items: center;
          justify-content: center;
          padding: 3rem 2rem;
        }

        .login-form-card {
          width: 100%;
          max-width: 420px;
          background: var(--yah-white);
          border-radius: var(--radius-xl);
          padding: 2.5rem;
          box-shadow: var(--shadow-card);
        }

        .login-form-header {
          margin-bottom: 2rem;
        }

        .login-badge {
          display: inline-flex;
          align-items: center;
          padding: 0.25rem 0.75rem;
          background: rgba(43, 174, 142, 0.1);
          color: var(--yah-teal);
          border-radius: 999px;
          font-size: 0.75rem;
          font-weight: 700;
          letter-spacing: 0.06em;
          text-transform: uppercase;
          margin-bottom: 1rem;
          font-family: var(--font-heading);
        }

        .login-title {
          font-family: var(--font-heading);
          font-size: 1.5rem;
          font-weight: 700;
          color: var(--yah-navy);
          margin: 0 0 0.5rem;
          line-height: 1.25;
        }

        .login-subtitle {
          font-size: 0.875rem;
          color: var(--yah-slate);
          margin: 0;
          line-height: 1.6;
        }

        .login-form {
          display: flex;
          flex-direction: column;
          gap: 1.25rem;
        }

        .login-field {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
        }

        .login-label {
          font-size: 0.8125rem;
          font-weight: 600;
          color: var(--yah-navy);
          font-family: var(--font-heading);
          letter-spacing: 0.01em;
        }

        .login-input-wrap {
          position: relative;
        }

        .login-input-icon {
          position: absolute;
          left: 0.875rem;
          top: 50%;
          transform: translateY(-50%);
          color: var(--yah-slate);
          opacity: 0.6;
          display: flex;
          align-items: center;
          pointer-events: none;
        }

        .login-input {
          width: 100%;
          padding: 0.75rem 0.875rem 0.75rem 2.625rem;
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-md);
          font-size: 0.9375rem;
          font-family: var(--font-body);
          color: var(--yah-navy);
          background: var(--yah-white);
          transition: border-color var(--transition-fast), box-shadow var(--transition-fast);
          outline: none;
        }

        .login-input::placeholder {
          color: var(--yah-slate);
          opacity: 0.45;
        }

        .login-input:focus {
          border-color: var(--yah-navy);
          box-shadow: 0 0 0 3px rgba(27, 47, 107, 0.08);
        }

        .login-error {
          display: flex;
          align-items: center;
          gap: 0.5rem;
          padding: 0.75rem 1rem;
          background: rgba(220, 38, 38, 0.06);
          border: 1px solid rgba(220, 38, 38, 0.2);
          border-radius: var(--radius-md);
          color: #dc2626;
          font-size: 0.875rem;
          font-weight: 500;
        }

        .login-footer-note {
          margin-top: 1.5rem;
          font-size: 0.8125rem;
          color: var(--yah-slate);
          text-align: center;
          line-height: 1.7;
        }

        .login-back-link {
          color: var(--yah-teal);
          font-weight: 600;
          text-decoration: underline;
          text-underline-offset: 2px;
          transition: color var(--transition-fast);
        }

        .login-back-link:hover {
          color: var(--yah-navy);
        }

        /* Mobile */
        @media (max-width: 768px) {
          .login-root {
            grid-template-columns: 1fr;
          }

          .login-brand {
            padding: 2.5rem 1.5rem;
            min-height: 200px;
          }

          .login-brand-name {
            font-size: 1.5rem;
          }

          .login-grid-deco {
            display: none;
          }

          .login-form-panel {
            padding: 2rem 1.25rem;
          }

          .login-form-card {
            padding: 1.75rem 1.25rem;
          }
        }
      `}</style>
        </div>
    );
}
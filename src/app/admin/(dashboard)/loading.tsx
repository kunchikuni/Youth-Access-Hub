/**
 * Dashboard Loading Skeleton
 * Shown automatically by Next.js while /admin/(dashboard)/page.tsx
 * fetches its Supabase counts.
 *
 * @module app/admin/(dashboard)/loading
 */

export default function DashboardLoading() {
  return (
    <div className="skel-root">

      {/* Welcome */}
      <div className="skel-welcome">
        <div className="skel-line skel-line--title" />
        <div className="skel-line skel-line--sub" />
      </div>

      {/* Stats grid */}
      <div>
        <div className="skel-line skel-line--label" />
        <div className="skel-stats-grid">
          {[0, 1].map((i) => (
            <div key={i} className="skel-stat-card">
              <div className="skel-icon" />
              <div className="skel-stat-body">
                <div className="skel-line skel-line--value" />
                <div className="skel-line skel-line--small" />
                <div className="skel-line skel-line--small" style={{ width: "70%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Quick actions */}
      <div>
        <div className="skel-line skel-line--label" />
        <div className="skel-actions-list">
          {[0, 1, 2, 3].map((i) => (
            <div key={i} className="skel-action-card">
              <div className="skel-icon skel-icon--sm" />
              <div className="skel-action-body">
                <div className="skel-line skel-line--small" style={{ width: "55%" }} />
                <div className="skel-line skel-line--small" style={{ width: "80%" }} />
              </div>
            </div>
          ))}
        </div>
      </div>

      <style>{`
        .skel-root {
          display: flex;
          flex-direction: column;
          gap: 2rem;
          max-width: 860px;
        }

        .skel-welcome {
          display: flex;
          flex-direction: column;
          gap: 0.5rem;
        }

        .skel-line {
          background: linear-gradient(
            90deg,
            var(--yah-light-gray) 25%,
            #edf1f7 37%,
            var(--yah-light-gray) 63%
          );
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
          border-radius: var(--radius-sm);
        }

        .skel-line--title { width: 200px; height: 1.5rem; }
        .skel-line--sub   { width: 320px; height: 1rem; }
        .skel-line--label { width: 140px; height: 0.75rem; margin-bottom: 0.875rem; }
        .skel-line--value { width: 60px; height: 1.75rem; margin-bottom: 0.5rem; }
        .skel-line--small { width: 100%; height: 0.8125rem; }

        .skel-stats-grid {
          display: grid;
          grid-template-columns: repeat(2, 1fr);
          gap: 1rem;
        }

        .skel-stat-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--yah-white);
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-lg);
          padding: 1.375rem 1.25rem;
        }

        .skel-icon {
          width: 44px;
          height: 44px;
          border-radius: var(--radius-md);
          background: linear-gradient(
            90deg,
            var(--yah-light-gray) 25%,
            #edf1f7 37%,
            var(--yah-light-gray) 63%
          );
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
          flex-shrink: 0;
        }

        .skel-icon--sm {
          width: 36px;
          height: 36px;
          border-radius: var(--radius-sm);
        }

        .skel-stat-body {
          display: flex;
          flex-direction: column;
          flex: 1;
          gap: 0.25rem;
        }

        .skel-actions-list {
          display: flex;
          flex-direction: column;
          gap: 0.625rem;
        }

        .skel-action-card {
          display: flex;
          align-items: center;
          gap: 1rem;
          background: var(--yah-white);
          border: 1.5px solid var(--yah-light-gray);
          border-radius: var(--radius-md);
          padding: 1rem 1.125rem;
        }

        .skel-action-body {
          display: flex;
          flex-direction: column;
          gap: 0.375rem;
          flex: 1;
        }

        @keyframes skel-shimmer {
          0%   { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 600px) {
          .skel-stats-grid { grid-template-columns: 1fr; }
        }
      `}</style>
    </div>
  );
}

/**
 * Programs List Loading Skeleton
 * Shown automatically by Next.js while the programs table page
 * fetches data from Supabase.
 *
 * @module app/admin/(dashboard)/programs/loading
 */

export default function ProgramsLoading() {
  return (
    <div className="skel-list-root">

      {/* Header */}
      <div className="skel-list-header">
        <div>
          <div className="skel-line skel-line--title" />
          <div className="skel-line skel-line--sub" />
        </div>
        <div className="skel-btn" />
      </div>

      {/* Table skeleton */}
      <div className="skel-table">
        <div className="skel-table-head">
          {["Title", "Category", "Status", "Featured", "Start date", "Actions"].map((label) => (
            <div key={label} className="skel-th">{label}</div>
          ))}
        </div>
        {[0, 1, 2, 3, 4].map((i) => (
          <div key={i} className="skel-table-row">
            <div className="skel-td">
              <div className="skel-line" style={{ width: "70%", height: "0.9375rem", marginBottom: "0.25rem" }} />
              <div className="skel-line" style={{ width: "45%", height: "0.6875rem" }} />
            </div>
            <div className="skel-td"><div className="skel-line" style={{ width: "60%", height: "0.8125rem" }} /></div>
            <div className="skel-td"><div className="skel-pill" /></div>
            <div className="skel-td"><div className="skel-line" style={{ width: "40%", height: "0.8125rem" }} /></div>
            <div className="skel-td"><div className="skel-line" style={{ width: "55%", height: "0.8125rem" }} /></div>
            <div className="skel-td skel-td--actions">
              <div className="skel-action-btn" />
              <div className="skel-action-btn" />
              <div className="skel-action-btn" />
            </div>
          </div>
        ))}
      </div>

      <style>{`
        .skel-list-root { display:flex; flex-direction:column; gap:1.5rem; max-width:960px; }

        .skel-list-header { display:flex; align-items:flex-start; justify-content:space-between; gap:1rem; flex-wrap:wrap; }

        .skel-line {
          background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%);
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
          border-radius: var(--radius-sm);
        }

        .skel-line--title { width: 160px; height: 1.375rem; margin-bottom: 0.5rem; }
        .skel-line--sub   { width: 110px; height: 0.875rem; }

        .skel-btn {
          width: 150px;
          height: 40px;
          border-radius: var(--radius-md);
          background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%);
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
        }

        .skel-pill {
          width: 64px;
          height: 22px;
          border-radius: 999px;
          background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%);
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
        }

        .skel-action-btn {
          width: 28px;
          height: 28px;
          border-radius: var(--radius-sm);
          background: linear-gradient(90deg, var(--yah-light-gray) 25%, #edf1f7 37%, var(--yah-light-gray) 63%);
          background-size: 400% 100%;
          animation: skel-shimmer 1.4s ease infinite;
        }

        .skel-table {
          border-radius: var(--radius-lg);
          border: 1.5px solid var(--yah-light-gray);
          background: var(--yah-white);
          overflow: hidden;
        }

        .skel-table-head {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
          gap: 1rem;
          padding: 0.75rem 1rem;
          background: var(--yah-off-white);
          border-bottom: 1.5px solid var(--yah-light-gray);
        }

        .skel-th {
          font-family: var(--font-heading);
          font-size: 0.6875rem;
          font-weight: 700;
          letter-spacing: 0.05em;
          text-transform: uppercase;
          color: var(--yah-slate);
          opacity: 0.5;
        }

        .skel-table-row {
          display: grid;
          grid-template-columns: 2fr 1fr 1fr 1fr 1fr 1.5fr;
          gap: 1rem;
          padding: 0.875rem 1rem;
          border-bottom: 1px solid var(--yah-light-gray);
          align-items: center;
        }

        .skel-table-row:last-child { border-bottom: none; }

        .skel-td--actions {
          display: flex;
          justify-content: flex-end;
          gap: 0.375rem;
        }

        @keyframes skel-shimmer {
          0%   { background-position: 100% 50%; }
          100% { background-position: 0% 50%; }
        }

        @media (max-width: 768px) {
          .skel-table-head, .skel-table-row {
            grid-template-columns: 2fr 1fr 1fr;
          }
          .skel-table-head > :nth-child(4),
          .skel-table-head > :nth-child(5),
          .skel-table-row > :nth-child(4),
          .skel-table-row > :nth-child(5) {
            display: none;
          }
        }
      `}</style>
    </div>
  );
}

import { DEPTH_LEVELS, DEPTH_NUMERIC, computeDomainAverage } from "@/lib/types";
import type { Profile } from "@/lib/types";

export const dynamic = "force-dynamic";

async function getProfile(): Promise<Profile> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
  });
  if (!res.ok) return { domains: {} };
  return res.json();
}

function depthColor(avg: number | null): string {
  if (avg === null) return "bg-depth-unaware";
  if (avg < 1) return "bg-depth-unaware";
  if (avg < 2) return "bg-depth-recognize";
  if (avg < 3) return "bg-depth-explain";
  if (avg < 4) return "bg-depth-apply";
  if (avg < 5) return "bg-depth-debug";
  return "bg-depth-teach";
}

function depthLabel(avg: number | null): string {
  if (avg === null) return "Not assessed";
  const rounded = Math.round(avg);
  return DEPTH_LEVELS[rounded] || "Not assessed";
}

export default async function Dashboard() {
  const profile = await getProfile();
  const domainEntries = Object.entries(profile.domains);

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Software Engineering Knowledge Heatmap</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Public dashboard — domain averages computed from assessed leaf topics only.
      </p>

      {domainEntries.length === 0 ? (
        <div className="rounded-lg border border-[var(--border)] bg-[var(--bg-secondary)] p-8 text-center">
          <p className="text-lg font-medium">No assessment data yet</p>
          <p className="mt-2 text-[var(--text-secondary)]">
            Sign in and take an assessment to populate the heatmap.
          </p>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {domainEntries.map(([id, domain]) => {
            const avg = computeDomainAverage(domain);
            const assessedCount = Object.values(domain.leaf_topics).filter(
              (t) => t.assessed
            ).length;
            const totalCount = Object.keys(domain.leaf_topics).length;

            return (
              <div
                key={id}
                className="rounded-lg border border-[var(--border)] p-4"
              >
                <div className={`mb-3 h-2 rounded-full ${depthColor(avg)}`} />
                <h2 className="font-semibold">{domain.domain_name}</h2>
                <p className="text-sm text-[var(--text-secondary)]">
                  {depthLabel(avg)} — {assessedCount}/{totalCount} topics assessed
                </p>
                {avg !== null && (
                  <p className="mt-1 text-xs text-[var(--text-secondary)]">
                    Avg: {avg.toFixed(1)} / {DEPTH_NUMERIC["Teach"]}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

import type { Profile } from "@/lib/types";
import Heatmap from "./heatmap";

export const dynamic = "force-dynamic";

async function getProfile(): Promise<Profile> {
  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000";
  const res = await fetch(`${baseUrl}/api/profile`, {
    cache: "no-store",
  });
  if (!res.ok) return { domains: {} };
  return res.json();
}

export default async function Dashboard() {
  const profile = await getProfile();

  return (
    <div>
      <h1 className="mb-2 text-2xl font-bold">Software Engineering Knowledge Heatmap</h1>
      <p className="mb-8 text-[var(--text-secondary)]">
        Public dashboard — click any domain to see individual topic scores.
      </p>
      <Heatmap profile={profile} />
    </div>
  );
}

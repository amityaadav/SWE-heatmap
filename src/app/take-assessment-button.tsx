"use client";

import { useRouter } from "next/navigation";

export default function TakeAssessmentButton() {
  const router = useRouter();
  return (
    <button
      onClick={() => router.push("/assess")}
      className="border border-ink bg-ink px-[14px] py-[8px] font-mono text-[11px] uppercase tracking-[.1em] text-paper transition-colors hover:bg-ink-2"
    >
      Take Assessment
    </button>
  );
}

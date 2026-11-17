import Link from "next/link";

// Placeholder Plan screen: the timeline and the sidebar shell come later.
export default function PlanPage() {
  return (
    <main className="mx-auto flex max-w-3xl flex-col gap-3 px-5 py-16 md:px-8">
      <h1 className="type-display">Plan</h1>
      <p className="type-body text-ink-muted">The timeline for the selected day lands here.</p>
      <Link href="/design-system" className="type-body font-semibold text-accent-text">
        Design system →
      </Link>
    </main>
  );
}

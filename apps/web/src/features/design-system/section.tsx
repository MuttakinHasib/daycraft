import type { ReactNode } from "react";

interface SectionProps {
  title: string;
  description?: string;
  children: ReactNode;
}

export function Section({ title, description, children }: SectionProps) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="section-label">{title}</h2>
        {description && <p className="type-body-sm text-ink-muted">{description}</p>}
      </header>
      {children}
    </section>
  );
}

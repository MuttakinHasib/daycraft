import type { Metadata } from "next";
import Link from "next/link";

import {
  AppearanceSection,
  ButtonSection,
  CapsuleSection,
  CheckRingSection,
  ChipSection,
  FieldCardSection,
  SegmentedSection,
} from "@/features/design-system/component-sections";
import {
  ContrastSection,
  HueSection,
  IconSection,
  SemanticColorSection,
  ShapeSection,
  TypeSection,
} from "@/features/design-system/token-sections";

export const metadata: Metadata = {
  title: "Design system · Daycraft",
};

export default function DesignSystemPage() {
  return (
    <main className="mx-auto flex max-w-5xl flex-col gap-12 px-5 py-12 md:px-8">
      <header className="flex flex-col gap-2">
        <Link href="/" className="type-control text-accent-text">
          ‹ Plan
        </Link>
        <h1 className="type-display">Design system</h1>
        <p className="type-body-sm text-ink-muted">Daycraft v2 (Clean), rendered from @daycraft/design-tokens.</p>
      </header>
      <AppearanceSection />
      <SemanticColorSection />
      <HueSection />
      <ContrastSection />
      <TypeSection />
      <ShapeSection />
      <IconSection />
      <ButtonSection />
      <ChipSection />
      <SegmentedSection />
      <CheckRingSection />
      <FieldCardSection />
      <CapsuleSection />
    </main>
  );
}

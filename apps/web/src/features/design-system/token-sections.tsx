import {
  CAPSULE_GRIP_OPACITY,
  checkContrast,
  describeTypeStyle,
  fontFamilies,
  hueColors,
  hueTints,
  Radius,
  radii,
  semanticColors,
  SemanticColor,
  sheetHeaderTint,
  TypePreset,
  typeScale,
  withOpacity,
} from "@daycraft/design-tokens";
import { ACTIVITY_ICONS, ActivityHue, INTERFACE_ICONS, MOOD_ICONS, type IconName } from "@daycraft/domain";
import { Icon } from "@daycraft/icons/web";
import type { ReactNode } from "react";

import { cn } from "@/lib/cn";

import { Section } from "./section";
import { HueBackground, RadiusClass, TypePresetClass } from "./token-classes";

interface TintRowProps {
  name: string;
  share: string;
  children: ReactNode;
}

const TINT_SAMPLE = hueColors.clay;

interface SwatchProps {
  color: string;
}

interface IconGroupProps {
  title: string;
  names: readonly IconName[];
}

const SAMPLE: Record<TypePreset, string> = {
  display: "Plan",
  date: "Tuesday 17",
  title: "November 2026",
  heading: "A blank canvas",
  activity: "Deep work · Onboarding flow",
  body: "Nothing planned for this day yet.",
  "body-sm": "Tap any hour to drop something in, or start from a routine.",
  control: "Today",
  meta: "9:30–11:30 AM (2 hr)",
  label: "Section label",
  micro: "10:40",
  clock: "24:59",
};

// Inline style: this swatch shows a fixed theme's value, which no class can express.
function Swatch({ color }: SwatchProps) {
  return <span className="size-6 shrink-0 rounded-check border border-line" style={{ backgroundColor: color }} />;
}

export function SemanticColorSection() {
  return (
    <Section title="Semantic colors" description="Light and dark values side by side. Classes: bg-*, text-*, border-*.">
      <div className="card overflow-x-auto p-0">
        <table className="w-full type-body-sm">
          <thead>
            <tr className="text-left text-ink-subtle">
              <th className="px-4 py-3 font-semibold">Token</th>
              <th className="px-4 py-3 font-semibold">Light</th>
              <th className="px-4 py-3 font-semibold">Dark</th>
            </tr>
          </thead>
          <tbody>
            {Object.values(SemanticColor).map((name) => (
              <tr key={name} className="border-t border-line">
                <td className="px-4 py-2.5 font-semibold">{name}</td>
                {[semanticColors.light[name], semanticColors.dark[name]].map((value, index) => (
                  <td key={index} className="px-4 py-2.5">
                    <span className="flex items-center gap-3">
                      <Swatch color={value} />
                      <span className="type-meta text-ink-muted">{value}</span>
                    </span>
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </Section>
  );
}

export function HueSection() {
  return (
    <Section title="Activity hues" description="The same in both themes. They color user content only.">
      <div className="grid grid-cols-3 gap-3 md:grid-cols-9">
        {Object.values(ActivityHue).map((hue) => (
          <div key={hue} className="flex flex-col gap-1.5">
            <div className={cn("grid h-16 place-items-center rounded-tile text-on-hue", HueBackground[hue])}>
              <Icon name="check" size={22} />
            </div>
            <span className="type-control">{hue}</span>
            <span className="type-meta text-ink-subtle">{hueColors[hue]}</span>
          </div>
        ))}
      </div>
    </Section>
  );
}

function TintRow({ name, share, children }: TintRowProps) {
  return (
    <li className="flex items-center gap-3 border-t border-line px-4 py-2.5 first:border-t-0">
      <span className="grid size-12 place-items-center rounded-tile bg-surface">{children}</span>
      <span className="type-body flex-1">{name}</span>
      <span className="type-meta text-ink-subtle">{share}</span>
    </li>
  );
}

// Swatches sit on `surface`, the base most tints mix into; computed hue tints are allowed inline.
export function HueTintSection() {
  return (
    <Section
      title="Hue tints"
      description="Shares of a hue from hueTints, shown on clay. Code reads the token, never a literal."
    >
      <ul className="card p-0">
        <TintRow name="Habit circle, not done" share="14% · 60% dashed">
          <span
            className="size-9 rounded-full border-2 border-dashed"
            style={{
              backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitCircle),
              borderColor: withOpacity(TINT_SAMPLE, hueTints.habitCircleBorder),
            }}
          />
        </TintRow>
        <TintRow name="Event agenda card" share="16% · 40% border">
          <span
            className="size-9 rounded-tile border"
            style={{
              backgroundColor: withOpacity(TINT_SAMPLE, hueTints.agendaFill),
              borderColor: withOpacity(TINT_SAMPLE, hueTints.agendaBorder),
            }}
          />
        </TintRow>
        <TintRow name="Agenda Event tag" share="26%">
          <span
            className="type-meta rounded-full px-2 text-ink"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.agendaTag) }}
          >
            Event
          </span>
        </TintRow>
        <TintRow name="Desktop habit chip" share="16% done · 18% icon">
          <span
            className="grid h-7 w-10 place-items-center rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitChipDone) }}
          >
            <span
              className="size-5 rounded-full"
              style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.habitChipIcon) }}
            />
          </span>
        </TintRow>
        <TintRow name="Week-grid task block" share="70% border">
          <span
            className="h-9 w-7 rounded-check border-2 bg-surface"
            style={{ borderColor: withOpacity(TINT_SAMPLE, hueTints.weekTaskBorder) }}
          />
        </TintRow>
        <TintRow name="Milestone done tag" share="24%">
          <span
            className="grid size-7 place-items-center rounded-full text-ink"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.milestoneDone) }}
          >
            <Icon name="check" size={14} />
          </span>
        </TintRow>
        <TintRow name="Active capsule ring" share="28%">
          <span
            className="grid size-10 place-items-center rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.activeRing) }}
          >
            <span className="size-8 rounded-full bg-clay" />
          </span>
        </TintRow>
        <TintRow name="Event card tint" share="30%">
          <span
            className="size-9 rounded-tile"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.eventCard) }}
          />
        </TintRow>
        <TintRow name="Active capsule base" share="42% over surface">
          <span
            className="flex h-10 w-6 flex-col overflow-hidden rounded-full"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.activeCapsuleBase) }}
          >
            <span className="h-1/2 bg-clay" />
          </span>
        </TintRow>
        <TintRow name="Headline highlight" share="42%">
          <span
            className="type-control rounded-tile px-1.5"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, hueTints.highlight) }}
          >
            Aa
          </span>
        </TintRow>
        <TintRow name="Sheet header" share={`light ${sheetHeaderTint.light * 100}% · dark solid`}>
          <span
            className="type-control grid size-9 place-items-center rounded-tile text-ink dark:hidden"
            style={{ backgroundColor: withOpacity(TINT_SAMPLE, sheetHeaderTint.light) }}
          >
            Aa
          </span>
          <span className="type-control hidden size-9 place-items-center rounded-tile bg-clay text-on-hue dark:grid">
            Aa
          </span>
        </TintRow>
        <TintRow name="Capsule resize grip" share="on-hue 75%">
          <span className="flex size-9 items-end justify-center rounded-tile bg-clay pb-1.5">
            <span className="h-0.75 w-4 rounded-full bg-on-hue" style={{ opacity: CAPSULE_GRIP_OPACITY }} />
          </span>
        </TintRow>
      </ul>
    </Section>
  );
}

export function ContrastSection() {
  return (
    <Section title="Contrast" description="Checked in the token build; a failing pair fails the build.">
      <ul className="card grid gap-x-8 gap-y-2 md:grid-cols-2">
        {checkContrast().map((result) => (
          <li key={result.pair} className="flex justify-between gap-3 type-body-sm">
            <span>{result.pair}</span>
            <span className={cn("type-meta", { "text-success": result.passes, "text-danger": !result.passes })}>
              {result.ratio.toFixed(1)} : 1 (≥ {result.minimum})
            </span>
          </li>
        ))}
      </ul>
    </Section>
  );
}

export function TypeSection() {
  return (
    <Section title="Type" description="Onest. Each preset is a type-* class on mobile and web.">
      <div className="card flex flex-col gap-5">
        {Object.values(TypePreset).map((preset) => (
          <div key={preset} className="flex flex-col gap-1">
            <span className="type-meta text-ink-subtle">
              type-{preset} · {describeTypeStyle(preset)} · {typeScale[preset].use}
            </span>
            <span className={cn(TypePresetClass[preset], { uppercase: preset === TypePreset.LABEL })}>
              {SAMPLE[preset]}
            </span>
          </div>
        ))}
      </div>
      <p className="type-meta text-ink-subtle">
        Weights: {Object.keys(fontFamilies).join(", ")}. On mobile each weight is its own family (
        {Object.values(fontFamilies)
          .map((family) => `font-${family.className}`)
          .join(", ")}
        ).
      </p>
    </Section>
  );
}

export function ShapeSection() {
  return (
    <Section
      title="Radii and elevation"
      description="Pills always use rounded-full. Shadows only on things that float."
    >
      <div className="grid grid-cols-3 gap-4 md:grid-cols-9">
        {Object.values(Radius).map((name) => (
          <div key={name} className="flex flex-col gap-1.5">
            <div className={cn("h-16 border-2 border-line-strong bg-sunken", RadiusClass[name])} />
            <span className="type-control">{name}</span>
            <span className="type-meta text-ink-subtle">{radii[name].px}px</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-4 md:max-w-xl">
        <div className="grid h-20 place-items-center rounded-card bg-surface shadow-float type-control">
          shadow-float
        </div>
        <div className="grid h-20 place-items-center rounded-card bg-surface shadow-lift type-control">shadow-lift</div>
      </div>
    </Section>
  );
}

function IconGroup({ title, names }: IconGroupProps) {
  return (
    <div className="flex flex-col gap-2">
      <span className="type-control text-ink-muted">
        {title} ({names.length})
      </span>
      <div className="grid grid-cols-4 gap-2 sm:grid-cols-8 md:grid-cols-12">
        {names.map((name) => (
          <div key={name} className="flex flex-col items-center gap-1 rounded-tile bg-sunken py-2.5">
            <Icon name={name} size={22} />
            <span className="type-micro text-ink-muted">{name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}

export function IconSection() {
  return (
    <Section title="Icons" description="Lucide at stroke 1.9, with the prototype's own moods, run and timeline.">
      <IconGroup title="Activity" names={ACTIVITY_ICONS} />
      <IconGroup title="Interface" names={INTERFACE_ICONS} />
      <IconGroup title="Mood" names={MOOD_ICONS} />
    </Section>
  );
}

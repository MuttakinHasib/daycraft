import {
  checkContrast,
  describeTypeStyle,
  fontFamilies,
  hueColors,
  Radius,
  radii,
  semanticColors,
  SemanticColor,
  TypePreset,
  typeScale,
} from "@daycraft/design-tokens";
import { ACTIVITY_ICONS, ActivityHue, INTERFACE_ICONS, MOOD_ICONS, type IconName } from "@daycraft/domain";
import { Icon } from "@daycraft/icons/web";

import { cn } from "@/lib/cn";

import { Section } from "./section";
import { HueBackground, RadiusClass, TypePresetClass } from "./token-classes";

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
            <div className={cn("grid h-16 place-items-center rounded-tile text-white", HueBackground[hue])}>
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
    <Section title="Type" description="Plus Jakarta Sans. Each preset is a type-* class on mobile and web.">
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
    <Section title="Radii and elevation" description="Pills always use rounded-full. Shadows only on things that float.">
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
        <div className="grid h-20 place-items-center rounded-card bg-surface shadow-float type-control">shadow-float</div>
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

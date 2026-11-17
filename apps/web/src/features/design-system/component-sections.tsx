import { hueColors } from "@daycraft/design-tokens";
import { ActivityHue } from "@daycraft/domain";
import { Icon } from "@daycraft/icons/web";
import type { CSSProperties } from "react";

import { ThemeSwitch } from "@/features/theme/theme-switch";
import { cn } from "@/lib/cn";

import { CheckRingDemo, ChipDemo, SegmentedDemo } from "./component-demos";
import { Section } from "./section";
import { HueBackground } from "./token-classes";

interface CapsuleHueStyle extends CSSProperties {
  "--capsule-hue": string;
}

const activeCapsuleStyle: CapsuleHueStyle = { "--capsule-hue": hueColors[ActivityHue.SKY] };

export function AppearanceSection() {
  return (
    <Section title="Appearance" description="Saved in a cookie on this device. System follows the OS.">
      <ThemeSwitch />
    </Section>
  );
}

export function ButtonSection() {
  return (
    <Section title="Buttons" description="Display only: these specimens are not wired to actions.">
      <div className="grid max-w-md gap-3">
        <button type="button" className="btn-primary">
          <Icon name="plus" size={18} />
          Add to timeline
        </button>
        <button type="button" className="btn-secondary">
          Cancel
        </button>
        <div className="grid grid-cols-2 gap-3">
          <button type="button" className="btn-primary btn-md">
            Save
          </button>
          <button type="button" className="btn-primary btn-md" disabled>
            Disabled
          </button>
        </div>
        <div className="flex gap-2">
          <button type="button" className="icon-btn" aria-label="Edit">
            <Icon name="edit" size={18} />
          </button>
          <button type="button" className="icon-btn icon-btn-sm" aria-label="Close">
            <Icon name="x" size={16} />
          </button>
        </div>
      </div>
    </Section>
  );
}

export function ChipSection() {
  return (
    <Section title="Chips and tags" description="The label chips toggle; the Plan chip is display only.">
      <ChipDemo />
    </Section>
  );
}

export function SegmentedSection() {
  return (
    <Section title="Segmented control">
      <SegmentedDemo />
    </Section>
  );
}

export function CheckRingSection() {
  return (
    <Section title="Check rings" description="Drawn in the activity's hue; filled when done. Click to toggle.">
      <CheckRingDemo />
    </Section>
  );
}

export function FieldCardSection() {
  return (
    <Section title="Field and card">
      <div className="grid max-w-md gap-3">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="design-system-capture" className="type-control text-ink-muted">
            New inbox item
          </label>
          <div className="field">
            <Icon name="inbox" size={18} />
            <input
              id="design-system-capture"
              className="flex-1 bg-transparent outline-none placeholder:text-ink-muted"
              placeholder="Capture a thought"
            />
          </div>
        </div>
        <div className="card flex flex-col gap-1">
          <span className="type-activity">Write Q4 roadmap draft</span>
          <span className="type-meta text-ink-muted">1:30–3:00 PM (1 hr 30 min)</span>
        </div>
      </div>
    </Section>
  );
}

export function CapsuleSection() {
  return (
    <Section title="Capsules" description="Upcoming, active (now) and done.">
      <div className="flex items-start gap-8">
        <figure className="flex flex-col items-center gap-2">
          <div className={cn("capsule h-20", HueBackground[ActivityHue.CLAY])}>
            <Icon name="laptop" size={22} />
          </div>
          <figcaption className="type-meta text-ink-subtle">upcoming</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <div
            data-state="active"
            className={cn("capsule h-20", HueBackground[ActivityHue.SKY])}
            style={activeCapsuleStyle}
          >
            <Icon name="video" size={22} />
          </div>
          <figcaption className="type-meta text-ink-subtle">active</figcaption>
        </figure>
        <figure className="flex flex-col items-center gap-2">
          <div data-state="done" className={cn("capsule", HueBackground[ActivityHue.SAGE])}>
            <Icon name="run" size={22} />
          </div>
          <figcaption className="type-meta text-ink-subtle">done</figcaption>
        </figure>
      </div>
    </Section>
  );
}

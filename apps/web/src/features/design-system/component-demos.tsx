"use client";

import { ActivityHue } from "@daycraft/domain";
import { Icon } from "@daycraft/icons/web";
import { useState } from "react";

import { Segmented } from "@/components/ui/segmented";
import { cn } from "@/lib/cn";

import { HueBackground, HueBorder } from "./token-classes";

const LABELS = ["Work", "Personal", "Health"] as const;
const FILTERS = [
  { value: "open", label: "Open" },
  { value: "today", label: "Today" },
  { value: "unscheduled", label: "Unscheduled" },
  { value: "done", label: "Done" },
] as const;

export function ChipDemo() {
  const [selected, setSelected] = useState<(typeof LABELS)[number]>("Work");
  return (
    <div className="flex flex-wrap items-center gap-2">
      {LABELS.map((label) => (
        <button
          key={label}
          type="button"
          className="chip"
          aria-pressed={selected === label}
          onClick={() => setSelected(label)}
        >
          {label}
        </button>
      ))}
      {/* Display-only specimen (see the section description): inert, so it takes no focus or clicks. */}
      <button type="button" className="chip chip-sm" inert>
        <Icon name="plus" size={16} />
        Plan
      </button>
      <span className="tag">
        <Icon name="pin" size={12} />
        Studio
      </span>
      <span className="tag">
        <Icon name="checksq" size={12} />
        2/4
      </span>
    </div>
  );
}

export function SegmentedDemo() {
  const [filter, setFilter] = useState<(typeof FILTERS)[number]["value"]>("open");
  return (
    <div className="max-w-md">
      <Segmented options={FILTERS} value={filter} onChange={setFilter} label="Task filter" />
    </div>
  );
}

export function CheckRingDemo() {
  const [done, setDone] = useState<ReadonlySet<ActivityHue>>(new Set([ActivityHue.PINE, ActivityHue.SKY]));
  const toggle = (hue: ActivityHue) => {
    const next = new Set(done);
    if (next.has(hue)) next.delete(hue);
    else next.add(hue);
    setDone(next);
  };
  return (
    <div className="flex flex-wrap gap-5">
      {Object.values(ActivityHue).map((hue) => {
        const checked = done.has(hue);
        return (
          <button
            key={hue}
            type="button"
            role="checkbox"
            aria-checked={checked}
            aria-label={`${checked ? "Mark not done" : "Complete"}: ${hue}`}
            onClick={() => toggle(hue)}
            className={cn("check-ring text-on-hue", HueBorder[hue], { [HueBackground[hue]]: checked })}
          >
            {checked && <Icon name="check" size={14} strokeWidth={3.2} />}
          </button>
        );
      })}
    </div>
  );
}

"use client";

import { ThemePreference } from "@daycraft/domain";
import { useSyncExternalStore } from "react";

import { Segmented } from "@/components/ui/segmented";

import { readThemePreference, subscribeToThemePreference, writeThemePreference } from "./theme-preference";

const OPTIONS = [
  { value: ThemePreference.SYSTEM, label: "System" },
  { value: ThemePreference.LIGHT, label: "Light" },
  { value: ThemePreference.DARK, label: "Dark" },
] as const;

const serverPreference = () => ThemePreference.SYSTEM;

/** System / Light / Dark segmented control. The theme script applies the class. */
export function ThemeSwitch() {
  const preference = useSyncExternalStore(subscribeToThemePreference, readThemePreference, serverPreference);
  return (
    <div className="w-72">
      <Segmented options={OPTIONS} value={preference} onChange={writeThemePreference} label="Appearance" />
    </div>
  );
}

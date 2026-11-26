import { hexFromHsv, hsvFromHex } from '@daycraft/design-tokens';
import {
  ActivityHue,
  ICON_CATEGORIES,
  isHexColor,
  recentCustomColors,
  searchIcons,
  suggestIcons,
  toHexColor,
  type ActivityColor,
  type ActivityInput,
  type HexColor,
  type IconName,
} from '@daycraft/domain';
import { useState } from 'react';
import { Pressable, Text, TextInput, View } from 'react-native';

import { Capsule, colorValue, Icon, IconButton, IconButtonSize, inkClassOn } from '@/components/ui';
import { useUsedCustomColors } from '@/data/activity-store';
import { cn } from '@/lib/cn';
import { useThemeColors } from '@/theme/app-theme';

import { ColourSlider } from './colour-slider';
import { SubSheetHeader } from './sub-sheet';

const ICON_CELL_WIDTH = `${100 / 6}%` as const;
const NAMED_COLOURS = Object.values(ActivityHue);

export const HUE_NAMES: Record<ActivityHue, string> = {
  clay: 'Clay',
  amber: 'Amber',
  sun: 'Sun',
  sage: 'Sage',
  pine: 'Pine',
  sky: 'Sky',
  iris: 'Iris',
  rose: 'Rose',
  slate: 'Slate',
};

/** What the colour sheets change: the color, the icon or both. */
export type AppearanceChange = Partial<Pick<ActivityInput, 'hue' | 'icon'>>;

interface ColourIconSheetProps {
  color: ActivityColor;
  icon: IconName;
  /** The activity's title, for icon suggestions. */
  title: string;
  onChange: (change: AppearanceChange) => void;
  onCustom: () => void;
  onClose: () => void;
}

interface CustomColourSheetProps {
  color: ActivityColor;
  icon: IconName;
  onChange: (color: ActivityColor) => void;
  onClose: () => void;
}

interface SwatchProps {
  color: ActivityColor;
  selected: boolean;
  onPress: () => void;
}

interface IconCellProps {
  icon: IconName;
  color: ActivityColor;
  selected: boolean;
  onPress: () => void;
}

/** A color's name for screen readers. */
export function colourName(color: ActivityColor): string {
  return isHexColor(color) ? `Custom colour ${color}` : HUE_NAMES[color];
}

/** The presets row: the nine named colors, the recent custom ones, and the current custom color if it is neither. */
function useColourChoices(current: ActivityColor): ActivityColor[] {
  const recent = recentCustomColors(useUsedCustomColors());
  const choices: ActivityColor[] = [...NAMED_COLOURS, ...recent];
  if (isHexColor(current) && !choices.includes(current)) choices.push(current);
  return choices;
}

function Swatch({ color, selected, onPress }: SwatchProps) {
  return (
    <Pressable
      accessibilityRole="button"
      accessibilityLabel={colourName(color)}
      accessibilityState={{ selected }}
      hitSlop={4}
      onPress={onPress}
      className={cn('size-10 items-center justify-center rounded-full border-2', {
        'border-ink': selected,
        'border-transparent': !selected,
      })}
    >
      <View style={{ backgroundColor: colorValue(color) }} className="size-8 rounded-full" />
    </Pressable>
  );
}

function IconCell({ icon, color, selected, onPress }: IconCellProps) {
  return (
    <View style={{ width: ICON_CELL_WIDTH }} className="items-center">
      <Pressable
        accessibilityRole="button"
        accessibilityLabel={icon}
        accessibilityState={{ selected }}
        onPress={onPress}
        style={selected ? { backgroundColor: colorValue(color) } : undefined}
        className={cn('size-11 items-center justify-center rounded-full', { 'bg-sunken': !selected })}
      >
        <Icon name={icon} size={20} colorClassName={selected ? inkClassOn(color) : 'text-ink-muted'} />
      </Pressable>
    </View>
  );
}

/**
 * "Colour & icon": a row of colors (⋯ for a custom one), icons suggested from the title, icon categories, a search
 * field and the icon grid. Choices apply at once.
 */
export function ColourIconSheet({ color, icon, title, onChange, onCustom, onClose }: ColourIconSheetProps) {
  const colors = useThemeColors();
  const choices = useColourChoices(color);
  const suggestions = suggestIcons(title);
  const [category, setCategory] = useState(ICON_CATEGORIES[0]?.key ?? '');
  const [query, setQuery] = useState('');
  const shown = query.trim()
    ? searchIcons(query)
    : (ICON_CATEGORIES.find((item) => item.key === category)?.icons ?? []);
  return (
    <View>
      <SubSheetHeader
        title="Colour & icon"
        onClose={onClose}
        aside={
          <IconButton icon="more" size={IconButtonSize.LG} accessibilityLabel="Custom colour" onPress={onCustom} />
        }
      />
      {/* Wrapping, not a scroll row: the nine named colours plus recents read at a glance. */}
      <View className="flex-row flex-wrap gap-1 px-4">
        {choices.map((choice) => (
          <Swatch key={choice} color={choice} selected={choice === color} onPress={() => onChange({ hue: choice })} />
        ))}
      </View>
      <View className="gap-4 px-5 pt-5">
        {suggestions.length > 0 && (
          <View className="gap-3">
            <View className="h-8 flex-row items-center gap-1.5 self-start rounded-full bg-sunken px-3">
              <Icon name="spark" size={14} colorClassName="text-ink-muted" />
              <Text className="type-control font-sans-semibold text-ink">Suggestions</Text>
            </View>
            <View className="flex-row flex-wrap">
              {suggestions.map((option) => (
                <IconCell
                  key={option}
                  icon={option}
                  color={color}
                  selected={option === icon}
                  onPress={() => onChange({ icon: option })}
                />
              ))}
            </View>
          </View>
        )}
        <View className="flex-row gap-0.5 rounded-full bg-sunken p-0.75">
          {ICON_CATEGORIES.map((item) => {
            const selected = !query.trim() && item.key === category;
            return (
              <Pressable
                key={item.key}
                accessibilityRole="tab"
                accessibilityLabel={item.label}
                accessibilityState={{ selected }}
                onPress={() => {
                  setQuery('');
                  setCategory(item.key);
                }}
                className={cn('h-9 flex-1 items-center justify-center rounded-full', { 'bg-accent': selected })}
              >
                <Icon
                  name={item.icons[0] ?? 'check'}
                  size={18}
                  colorClassName={selected ? 'text-on-accent' : 'text-ink-muted'}
                />
              </Pressable>
            );
          })}
        </View>
        <View className="h-11 flex-row items-center gap-2.5 rounded-full bg-sunken px-4">
          <Icon name="search" size={16} colorClassName="text-ink-subtle" />
          <TextInput
            accessibilityLabel="Search icons"
            value={query}
            onChangeText={setQuery}
            placeholder="Search"
            placeholderTextColor={colors['ink-subtle']}
            returnKeyType="search"
            style={{ lineHeight: 0 }}
            className="h-full flex-1 type-body text-ink"
          />
        </View>
        <View className="flex-row flex-wrap gap-y-2.5">
          {shown.map((option) => (
            <IconCell
              key={option}
              icon={option}
              color={color}
              selected={option === icon}
              onPress={() => onChange({ icon: option })}
            />
          ))}
          {shown.length === 0 && (
            <Text className="w-full py-4 text-center type-body-sm text-ink-muted">No icons match “{query.trim()}”</Text>
          )}
        </View>
      </View>
    </View>
  );
}

// The shade slider runs from a deep tone (left) through the full color (middle) to a pale tint (right).
const DEEP_VALUE = 0.3;
const PALE_SATURATION = 0.15;

function shadeOf({ s, v }: { s: number; v: number }): number {
  if (v < 1) return Math.max(0, ((v - DEEP_VALUE) / (1 - DEEP_VALUE)) * 0.5);
  return 0.5 + Math.min(0.5, ((1 - s) / (1 - PALE_SATURATION)) * 0.5);
}

function fromShade(hue: number, shade: number): HexColor {
  const sv =
    shade <= 0.5
      ? { s: 1, v: DEEP_VALUE + (shade / 0.5) * (1 - DEEP_VALUE) }
      : { s: 1 - ((shade - 0.5) / 0.5) * (1 - PALE_SATURATION), v: 1 };
  return toHexColor(hexFromHsv({ h: hue, ...sv })) ?? '#000000';
}

const RAINBOW = 'linear-gradient(to right, #ff0000, #ffff00, #00ff00, #00ffff, #0000ff, #ff00ff, #ff0000)';

/**
 * "Choose a colour": a hue slider, a shade slider and a hex field, a preview capsule, and presets (the nine named
 * colors and the recent custom ones). Changes apply at once.
 */
export function CustomColourSheet({ color, icon, onChange, onClose }: CustomColourSheetProps) {
  const colors = useThemeColors();
  const choices = useColourChoices(color);
  const hex = colorValue(color);
  const [hsv, setHsv] = useState(() => hsvFromHex(hex));
  const shade = shadeOf(hsv);
  const [typed, setTyped] = useState(hex.replace('#', '').toUpperCase());

  const apply = (next: HexColor) => {
    setTyped(next.replace('#', '').toUpperCase());
    onChange(next);
  };
  const setHue = (value: number) => {
    const next = { ...hsv, h: value * 360 };
    setHsv(next);
    apply(fromShade(next.h, shade));
  };
  const setShade = (value: number) => {
    const next = fromShade(hsv.h, value);
    setHsv(hsvFromHex(next));
    apply(next);
  };
  const pickPreset = (preset: ActivityColor) => {
    setHsv(hsvFromHex(colorValue(preset)));
    setTyped(colorValue(preset).replace('#', '').toUpperCase());
    onChange(preset);
  };

  return (
    <View>
      <SubSheetHeader
        title="Choose a colour"
        onClose={onClose}
        aside={
          <View className="h-9 flex-row items-center rounded-full bg-sunken px-3">
            <Text className="type-control text-ink-subtle">#</Text>
            <TextInput
              accessibilityLabel="Hex colour code"
              value={typed}
              onChangeText={(text) => {
                const cleaned = text
                  .replace(/[^0-9a-f]/gi, '')
                  .slice(0, 6)
                  .toUpperCase();
                setTyped(cleaned);
                const parsed = toHexColor(`#${cleaned}`);
                if (parsed) {
                  setHsv(hsvFromHex(parsed));
                  onChange(parsed);
                }
              }}
              autoCapitalize="characters"
              autoCorrect={false}
              maxLength={6}
              placeholderTextColor={colors['ink-subtle']}
              style={{ lineHeight: 0, fontVariant: ['tabular-nums'] }}
              className="w-18 type-control text-ink"
            />
          </View>
        }
      />
      <View className="gap-5 px-5">
        <ColourSlider
          accessibilityLabel="Hue"
          value={hsv.h / 360}
          onChange={setHue}
          gradient={RAINBOW}
          thumbColor={hexFromHsv({ h: hsv.h, s: 1, v: 1 })}
        />
        <ColourSlider
          accessibilityLabel="Shade"
          value={shade}
          onChange={setShade}
          gradient={`linear-gradient(to right, ${fromShade(hsv.h, 0)}, ${fromShade(hsv.h, 0.5)}, ${fromShade(hsv.h, 1)})`}
          thumbColor={hex}
        />
        <Text className="type-body font-sans-semibold text-ink">Presets</Text>
        <View className="flex-row items-center gap-4">
          <Capsule hue={color} height={96} accessibilityLabel={`Preview, ${colourName(color)}`}>
            <Icon name={icon} size={22} colorClassName={inkClassOn(color)} />
          </Capsule>
          <View className="flex-1 flex-row flex-wrap gap-1">
            {choices.map((choice) => (
              <Swatch key={choice} color={choice} selected={choice === color} onPress={() => pickPreset(choice)} />
            ))}
          </View>
        </View>
      </View>
    </View>
  );
}

import type { IconName } from '@daycraft/domain';
import {
  AlarmClock,
  ArrowRight,
  BookOpen,
  Briefcase,
  BriefcaseBusiness,
  Calendar,
  CalendarClock,
  Check,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock,
  Coffee,
  Droplet,
  Dumbbell,
  EighthNote,
  FileText,
  Flag,
  Flame,
  Folder,
  GraduationCap,
  Heart,
  House,
  Inbox,
  Laptop,
  LayoutGrid,
  Leaf,
  List,
  ListChecks,
  MapPin,
  Minus,
  Moon,
  NotebookPen,
  Pause,
  PenLine,
  Pencil,
  Phone,
  Play,
  Plus,
  Repeat,
  ShoppingCart,
  Shuffle,
  Sparkles,
  Square,
  SquareCheck,
  SquareKanban,
  Sun,
  Tag,
  Target,
  Timer,
  Trash,
  Utensils,
  Video,
  Wind,
  X,
  type LucideIcon,
} from 'lucide-react';

import { customGlyphs, ICON_STROKE_WIDTH, isCustomIcon, type CustomIconName } from './custom-glyphs';

// Maps each Daycraft icon name to its Lucide glyph (ADR-0002). Keep in step with native.tsx; the Record type
// fails `check-types` when a name has no glyph.
const lucideIcons: Record<Exclude<IconName, CustomIconName>, LucideIcon> = {
  check: Check,
  alarm: AlarmClock,
  sun: Sun,
  moon: Moon,
  dumbbell: Dumbbell,
  coffee: Coffee,
  utensils: Utensils,
  book: BookOpen,
  cap: GraduationCap,
  laptop: Laptop,
  video: Video,
  doc: FileText,
  phone: Phone,
  pen: PenLine,
  heart: Heart,
  leaf: Leaf,
  drop: Droplet,
  wind: Wind,
  cart: ShoppingCart,
  home: House,
  music: EighthNote,
  briefcase: Briefcase,
  spark: Sparkles,
  'arrow-r': ArrowRight,
  calendar: Calendar,
  case: BriefcaseBusiness,
  checksq: SquareCheck,
  'chev-d': ChevronDown,
  'chev-l': ChevronLeft,
  'chev-r': ChevronRight,
  clock: Clock,
  edit: Pencil,
  flag: Flag,
  flame: Flame,
  folder: Folder,
  grid: LayoutGrid,
  inbox: Inbox,
  journal: NotebookPen,
  kanban: SquareKanban,
  list: List,
  minus: Minus,
  pause: Pause,
  pin: MapPin,
  play: Play,
  plus: Plus,
  repeat: Repeat,
  routine: ListChecks,
  shuffle: Shuffle,
  stop: Square,
  tag: Tag,
  target: Target,
  timer: Timer,
  trash: Trash,
  upcoming: CalendarClock,
  x: X,
};

export interface IconProps {
  name: IconName;
  /** Size in px; the design uses 22 in capsules, 18 in rows and icon buttons, 12–13 in tags. */
  size?: number;
  className?: string;
  strokeWidth?: number;
}

/** Decorative icon (`aria-hidden`); color follows `currentColor`, so set it with a `text-*` class. */
export function Icon({ name, size = 24, className, strokeWidth = ICON_STROKE_WIDTH }: IconProps) {
  if (isCustomIcon(name)) {
    return (
      <svg
        width={size}
        height={size}
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={strokeWidth}
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
        className={className}
      >
        {customGlyphs[name].map((shape, index) =>
          shape.kind === 'circle' ? (
            <circle key={index} cx={shape.cx} cy={shape.cy} r={shape.r} />
          ) : (
            <path key={index} d={shape.d} />
          ),
        )}
      </svg>
    );
  }
  const Glyph = lucideIcons[name];
  return <Glyph size={size} strokeWidth={strokeWidth} aria-hidden="true" className={className} />;
}

// The chat's small line glyphs. Upstream draws them itself (`demos/chat/glyphs.tsx` in the
// gallery); the library's `Icon` already carries these shapes, so they are named here and drawn
// from `lucide` — same names at the call sites, one icon set for the whole showcase.
import {
  ArrowDown,
  ArrowUp,
  Brain,
  Check,
  ChevronDown,
  CircleAlert,
  CloudOff,
  Copy,
  File,
  Globe,
  Paperclip,
  Plus,
  RotateCcw,
  Square,
  Sun,
  Terminal,
  ThumbsDown,
  ThumbsUp,
  X,
  type IconNode,
} from "lucide";

import { Icon } from "@/packages/ui/lib/icons";

/** A chat glyph by name. */
export type GlyphName =
  | "copy"
  | "regenerate"
  | "thumb-up"
  | "thumb-down"
  | "stop"
  | "globe"
  | "sun"
  | "terminal"
  | "clip"
  | "plus"
  | "close"
  | "caret-down"
  | "alert"
  | "offline"
  | "check"
  | "arrow-up"
  | "arrow-down"
  | "brain"
  | "file";

const glyphs: Record<GlyphName, IconNode> = {
  copy: Copy,
  regenerate: RotateCcw,
  "thumb-up": ThumbsUp,
  "thumb-down": ThumbsDown,
  stop: Square,
  globe: Globe,
  sun: Sun,
  terminal: Terminal,
  clip: Paperclip,
  plus: Plus,
  close: X,
  "caret-down": ChevronDown,
  alert: CircleAlert,
  offline: CloudOff,
  check: Check,
  "arrow-up": ArrowUp,
  "arrow-down": ArrowDown,
  brain: Brain,
  file: File,
};

/** A chat glyph, stroked with `tint`. */
export function Glyph(props: { name: GlyphName; size?: number; tint: string }) {
  return <Icon icon={glyphs[props.name]} size={props.size ?? 20} tint={props.tint} />;
}

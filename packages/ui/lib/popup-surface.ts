import { colors, finish, radius } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/** Overlay-family one-shadow (`finish.menu`). Prefer this over per-component boxShadow. */
export function overlayShadow(): ViewStyle {
  return { boxShadow: finish.menu.boxShadow };
}

/** Shared surface for popovers, menus, and select/combobox popups. */
export function popupSurface(): ViewStyle {
  return {
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 4,
    ...overlayShadow(),
  };
}

export function popupBackdrop(): ViewStyle {
  return {
    backgroundColor: "color-mix(in srgb, black 40%, transparent)",
  };
}

import { colors, radius } from "@shadcn-nsh/theme";
import type { ViewStyle } from "nsh";

/** Shared surface for popovers, menus, and select/combobox popups. */
export function popupSurface(): ViewStyle {
  return {
    borderRadius: radius.control,
    borderWidth: 1,
    borderColor: colors.border,
    backgroundColor: colors.card,
    padding: 4,
  };
}

export function popupBackdrop(): ViewStyle {
  return {
    backgroundColor: "color-mix(in srgb, black 40%, transparent)",
  };
}

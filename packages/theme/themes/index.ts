import apple from "./apple";
import material from "./material";
import nshGallery from "./nsh-gallery";
import shadcn from "./shadcn";
import solidGlass from "./solid-glass";
import winui from "./winui";

export { apple, material, nshGallery, shadcn, solidGlass, winui };

/** Every authored theme in canonical display order (built-time root first). */
export const ALL_THEMES = [nshGallery, shadcn, solidGlass, apple, material, winui] as const;

export const BUILD_ROOT_THEME = "nsh-gallery";

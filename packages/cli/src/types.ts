import packageJson from "../package.json" with { type: "json" };

export type RegistryFile = {
  path: string;
  type: string;
  target?: string;
  content?: string;
};

export type RegistryItem = {
  name: string;
  type: string;
  title?: string;
  description?: string;
  registryDependencies?: string[];
  dependencies?: string[];
  files: RegistryFile[];
};

export type Registry = {
  name: string;
  homepage: string;
  items: RegistryItem[];
};

/** One item as `index.json` lists it: everything `add` / `list` need, without the file contents. */
export type RegistryIndexItem = Pick<
  RegistryItem,
  "name" | "type" | "title" | "description" | "files"
>;

/** `public/r/index.json`: the catalog `list` and `add --all` read. */
export type RegistryIndex = {
  name: string;
  homepage: string;
  items: RegistryIndexItem[];
};

export type NshUiConfig = {
  registry: string;
  /**
   * The `registry:theme` item this app installs: `theme` (the library's own) or another theme's
   * item such as `theme-shadcn`. A component's `theme` dependency resolves to it, so `add` after
   * `init --theme shadcn` keeps the app's theme instead of writing the default one back.
   */
  theme: string;
  aliases: {
    components: string;
    ui: string;
    lib: string;
    theme: string;
  };
};

/**
 * The registry published with the release this CLI came from: the files it reads are the ones its
 * own version wrote, so a newer release never changes what an installed app's `add` fetches.
 */
export const DEFAULT_REGISTRY = `https://raw.githubusercontent.com/aningdev/shadcn-nsh/v${packageJson.version}/public/r/{name}.json`;

/** The theme item every component depends on, and the one an app gets when it names none. */
export const DEFAULT_THEME = "theme";

/**
 * The item that picks a theme per platform at run time (`nativeTheme()`). It ships no data of its
 * own: an app on it is built on the default theme, and gets Apple's, Material's and the default's
 * under `themes/` for `selectTheme(nativeTheme())`.
 */
export const NATIVE_THEME = "theme-native";

/** The themes `init --theme` takes, by the name on the command line: the item each one installs. */
export const THEMES = {
  default: DEFAULT_THEME,
  shadcn: "theme-shadcn",
  "solid-glass": "theme-solid-glass",
  apple: "theme-apple",
  material: "theme-material",
  native: NATIVE_THEME,
} as const;

export type ThemeName = keyof typeof THEMES;

export const isThemeName = (value: string): value is ThemeName => value in THEMES;

/** The registry item `init --theme <name>` installs; an unknown name is the command's error. */
export function themeItem(name: string): string {
  if (!isThemeName(name)) {
    const options = Object.keys(THEMES).join(", ");
    throw new Error(`Unknown theme "${name}". Choose one of: ${options}.`);
  }
  return THEMES[name];
}

export const DEFAULT_CONFIG = (): NshUiConfig => ({
  registry: DEFAULT_REGISTRY,
  theme: DEFAULT_THEME,
  aliases: {
    components: "./components",
    ui: "./components/ui",
    lib: "./lib/ui",
    theme: "./lib/ui/theme",
  },
});

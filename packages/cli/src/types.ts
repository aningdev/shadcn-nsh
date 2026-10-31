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

export type NshUiConfig = {
  registry: string;
  aliases: {
    components: string;
    ui: string;
    lib: string;
    theme: string;
  };
};

export const DEFAULT_REGISTRY =
  "https://raw.githubusercontent.com/aningdev/shadcn-nsh/main/public/r/{name}.json";

export const DEFAULT_CONFIG = (): NshUiConfig => ({
  registry: DEFAULT_REGISTRY,
  aliases: {
    components: "./components",
    ui: "./components/ui",
    lib: "./lib",
    theme: "./lib/theme",
  },
});

// The gallery's photographs: SpaceX's launches, one set for every demo, so a session downloads
// few images. Demo content only (it is not a look): a demo that shows a photo reads `photoUrl`
// here; the module never goes into the registry.
//
// Ported from NSH's examples/nsh-gallery-ui (Apache-2.0, © Longbridge; see NOTICE). The region is
// filled by `bun run port:vendor`: change it upstream, or in `port-map.json`, not here.

// @port photos.ts
// The gallery's photographs: SpaceX's launches, one set for every demo, so a
// session downloads few images.

const PHOTOS = {
  arc: "HUgxtn0WYAAHEl8",
  booster: "HTpJzwHWMAAIOgb",
  dragon: "HTiUp_2WsAAwokS",
  transporter: "HTbXRu9XcAEKwGr",
  rays: "HS7_82eXsAAa-Hx",
  sunrise: "HS8AAMSWwAEg-aG",
  day: "HS8AFH2WsAASxLk",
  silver: "HS6UGjvXkAAyHtp",
  rollout: "HS6UIKjWcAAIFCz",
  liftoff: "HR4knefbgAAKXHH",
  moon: "HQ6i3NMW0AAA-TS",
  fairing: "HQ6j_THXoAAGLRX",
} as const;

export type PhotoName = keyof typeof PHOTOS;

/** The sizes the image server has, by name. */
export type PhotoSize = "360x360" | "small" | "900x900" | "medium" | "large" | "4096x4096";

/** Every photo's name, for what needs many (a long list, a reload). */
export const photoNames = Object.keys(PHOTOS) as PhotoName[];

/** The URL of a photo at a size. */
export function photoUrl(name: PhotoName, size: PhotoSize = "medium") {
  return `https://pbs.twimg.com/media/${PHOTOS[name]}?format=jpg&name=${size}`;
}
// @port end

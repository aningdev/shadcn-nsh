// The Primitives group: `nsh`'s primitives, under this library's theme.
import { Brush, Globe, Image, List, ScrollText, Sparkles, Type, Video } from "lucide";

import { lazy, notBuilt, type DemoEntry } from "./entry";

/** The Primitives demos, in the official gallery's order. */
export const primitives: DemoEntry[] = [
  {
    name: "Text",
    detail: "Fonts, spans, inline views and images, decorations, truncation, languages",
    icon: Type,
    screen: lazy(() => import("../demos/text").then((m) => m.TextDemo)),
  },
  {
    name: "Image",
    detail: "Resize modes, tint, GIF / WebP, placeholders, blur, fade",
    icon: Image,
    screen: lazy(() => import("../demos/image").then((m) => m.ImageDemo)),
  },
  {
    name: "Scroll",
    detail: "Paging, snapping, zoom, scroll events, prepending, keyboard taps",
    icon: ScrollText,
    screen: lazy(() => import("../demos/scroll").then((m) => m.ScrollDemo)),
  },
  {
    name: "List",
    detail: "Columns, sticky sections, a chat, horizontal lists",
    icon: List,
    screen: lazy(() => import("../demos/list").then((m) => m.ListDemo)),
  },
  {
    name: "Canvas",
    detail: "2D context: paths, gradients, text, images, native animation",
    icon: Brush,
    screen: notBuilt({
      name: "Canvas",
      detail: "2D context: paths, gradients, text, images, native animation",
    }),
  },
  {
    name: "Shader",
    detail: "WGSL shaders on the GPU: noise, gradients, animated uniforms",
    icon: Sparkles,
    screen: notBuilt({
      name: "Shader",
      detail: "WGSL shaders on the GPU: noise, gradients, animated uniforms",
    }),
  },
  {
    name: "WebView",
    detail: "Inline HTML with messages both ways, a web site and its navigation",
    icon: Globe,
    screen: lazy(() => import("../demos/web-view").then((m) => m.WebViewDemo)),
  },
  {
    name: "Video",
    detail: "A player: play, seek, volume and what it reports",
    icon: Video,
    screen: lazy(() => import("../demos/video").then((m) => m.VideoDemo)),
  },
];

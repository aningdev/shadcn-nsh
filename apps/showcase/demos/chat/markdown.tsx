// A reply's Markdown at a chat's scale: the library's `TextView` with the theme's ink and type.
//
// While a reply streams, syntax its end leaves open shows as if closed and only the block being
// written renders again; `caret` is drawn at the end of the last block, inline with its text.
// Every block (and each list item and table cell) is one selectable text: a long press highlights
// it and offers Copy; code blocks carry `TextView`'s built-in copy action.
//
// A press on an image opens it in the library's `ImageViewer`.
import { colors } from "@shadcn-nsh/theme";
import { type JSX, signal } from "nsh";

import { ImageViewer } from "@/packages/ui/image-viewer";
import { TextView, type TextViewImage } from "@/packages/ui/text-view";

export function Markdown(props: {
  md: string;
  id: string;
  streaming?: boolean;
  caret?: JSX.Element;
}) {
  const viewing = signal<TextViewImage | null>(null);
  const used = signal(false);
  return (
    <>
      <TextView
        markdown={props.md}
        options={{ streaming: !!props.streaming }}
        selectable
        codeBlockScrollbar={false}
        streamingCaret={props.caret}
        styles={{
          // A chat's scale: tighter than a document's.
          root: { gap: 12, fontSize: 15, lineHeight: 22, color: colors.foreground },
          heading1: { fontSize: 20, lineHeight: 26 },
          heading2: { fontSize: 17, lineHeight: 22 },
          heading3: { fontSize: 15, lineHeight: 22 },
          code: { color: colors.foreground },
          codeBlockCode: { color: colors.foreground },
          link: { color: colors.brand },
        }}
        codeBlockActions={[{ id: "copy", label: "Copy code" }]}
        onImagePress={({ image }) => {
          used.set(true);
          viewing.set(image);
        }}
      />
      {used() ? <ImageViewer image={viewing()} onClose={() => viewing.set(null)} /> : null}
    </>
  );
}

// A reply's Markdown at a chat's scale: `nsh/base`'s `TextView` with the theme's ink and type.
//
// While a reply streams, syntax its end leaves open shows as if closed and only the block being
// written renders again; `caret` is drawn at the end of the last block, inline with its text.
// Every block (and each list item and table cell) is one selectable text: a long press highlights
// it and offers Copy; code blocks carry `TextView`'s built-in copy action.
//
// A press on an image opens it in a dialog. (Upstream opens it in the gallery shell's
// `ImageViewer`, which has no counterpart in the library; the dialog is the demo's stand-in.)
import { colors, radius, rounded } from "@shadcn-nsh/theme";
import { type JSX, Image, signal } from "nsh";
import { TextView, type TextViewImage } from "nsh/base";

import { Dialog, DialogContent, DialogTitle } from "@/packages/ui/dialog";

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
          code: { color: colors.code },
          codeBlockCode: { color: colors.code },
          link: { color: colors.brand },
        }}
        codeBlockActions={[{ id: "copy", label: "Copy code" }]}
        onImagePress={({ image }) => {
          used.set(true);
          viewing.set(image);
        }}
      />
      {used() ? (
        <Dialog
          open={!!viewing()}
          onOpenChange={(event) => {
            if (!event.open) viewing.set(null);
          }}
        >
          <DialogContent style={{ width: "auto", padding: 8, ...rounded(radius.card) }}>
            <DialogTitle style={{ position: "absolute", width: 1, height: 1, opacity: 0 }}>
              Image
            </DialogTitle>
            <Image
              src={viewing()?.src ?? ""}
              style={{ maxWidth: 560, maxHeight: 460, borderRadius: radius.card }}
            />
          </DialogContent>
        </Dialog>
      ) : null}
    </>
  );
}

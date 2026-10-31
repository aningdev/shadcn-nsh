import type { JSX } from "nsh";
import { context, View } from "nsh";
import { Collapsible as BaseCollapsible } from "nsh/base";

import { Button } from "./button";
import {
  createOpenState,
  createTriggerSlot,
  type OpenState,
  type TriggerSlot,
} from "./lib/open-state";

type CollapsibleContextValue = OpenState & {
  trigger: TriggerSlot;
  content: TriggerSlot;
  reveal?: boolean;
};

const CollapsibleContext = context<CollapsibleContextValue | null>(null);

function useCollapsible() {
  const ctx = CollapsibleContext();
  if (!ctx) throw new Error("Collapsible parts must be used within <Collapsible>");
  return ctx;
}

export function Collapsible(props: {
  open?: boolean;
  defaultOpen?: boolean;
  reveal?: boolean;
  /** @deprecated Prefer `<CollapsibleContent>`. */
  content?: JSX.Element;
  children?: JSX.Element;
  onOpenChange?: (event: { open: boolean; reason: string }) => void;
}) {
  // Legacy: trigger children + content prop.
  if (props.content != null) {
    return (
      <BaseCollapsible
        open={props.open}
        reveal={props.reveal ?? true}
        content={props.content}
        style={{ gap: 0 }}
      >
        {props.children}
      </BaseCollapsible>
    );
  }

  const state = createOpenState({
    open: props.open,
    defaultOpen: props.defaultOpen,
    onOpenChange: props.onOpenChange,
  });

  return (
    <CollapsibleContext.Provider
      value={{
        ...state,
        trigger: createTriggerSlot(),
        content: createTriggerSlot(),
        reveal: props.reveal,
      }}
    >
      <View style={{ gap: 0 }}>
        {props.children}
        <CollapsibleHost />
      </View>
    </CollapsibleContext.Provider>
  );
}

function CollapsibleHost() {
  const ctx = useCollapsible();
  const triggerAccessor = ctx.trigger.get();
  const contentAccessor = ctx.content.get();
  return (
    <BaseCollapsible
      open={ctx.open()}
      reveal={ctx.reveal ?? true}
      content={(contentAccessor?.() as JSX.Element) ?? <View />}
      style={{ gap: 0 }}
    >
      <View onPress={() => ctx.setOpen(!ctx.open())} style={{ alignSelf: "flex-start" }}>
        {(triggerAccessor?.() as JSX.Element) ?? <View />}
      </View>
    </BaseCollapsible>
  );
}

export function CollapsibleTrigger(props: { children?: string | JSX.Element }) {
  const ctx = useCollapsible();
  ctx.trigger.set(() => {
    if (typeof props.children === "string") {
      return <Button>{props.children}</Button>;
    }
    return props.children ?? <View />;
  });
  return <View style={{ width: 0, height: 0 }} />;
}

export function CollapsibleContent(props: { children?: JSX.Element }) {
  const ctx = useCollapsible();
  ctx.content.set(() => props.children ?? <View />);
  return <View style={{ width: 0, height: 0 }} />;
}

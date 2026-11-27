// A toolbar: the hairline (`toolbarRule`), the inset track (`Toolbar`), groups (`ToolbarGroup`),
// foldable tools (`ToolbarButton`), and the overflow menu (`ToolbarOverflow`).
// The track (`toolbarTrack`) is shared with `ToggleGroup` and lives in `lib/surface.tsx`.
// Derived from NSH examples/nsh-gallery-ui (Apache-2.0, © Longbridge); modified. See NOTICE.

import { colors, stroke, terminal, TERMINAL_GAP } from "@shadcn-nsh/theme";
import { Ellipsis } from "lucide";
import type { JSX, StyleProp, ViewRef, ViewStyle } from "nsh";
import { cleanup, computed, context, effect, signal, split, Text, View } from "nsh";
import {
  Toolbar as BaseToolbar,
  ToolbarGroup as BaseToolbarGroup,
  ToolbarSeparator as BaseToolbarSeparator,
  type ToolbarGroupProps as BaseToolbarGroupProps,
  type ToolbarProps as BaseToolbarProps,
  type ToolbarSeparatorProps as BaseToolbarSeparatorProps,
} from "nsh/base";

import { Icon } from "./lib/icons";
import { createOpenState } from "./lib/state";
import { toolbarTrack } from "./lib/surface";
import {
  Menu,
  MenuContent,
  MenuLabel,
  MenuSeparator,
  MenuTrigger,
  type MenuOpenChangeReason,
} from "./menu";
import { Toggle, toggleGlyph, toggleLabel, toggleSizes } from "./toggle";

/** A hairline between runs of a toolbar's tools (a `ToolbarSeparator`'s or a view's `style`): 18 points tall in a row, across a column. */
export function toolbarRule(vertical = false): ViewStyle {
  return vertical
    ? {
        height: stroke.hairline,
        alignSelf: "stretch",
        marginVertical: 4,
        marginHorizontal: 6,
        backgroundColor: colors.line,
      }
    : { width: stroke.hairline, height: 18, marginHorizontal: 4, backgroundColor: colors.line };
}

/** How a `ToolbarGroup` folds when space runs out: `"unit"` folds the whole group at once; `"none"` lets its `ToolbarButton`s fold individually. */
export type ToolbarGroupFold = "unit" | "none";

/**
 * `nsh/base`'s Toolbar in the look of `toolbarTrack`. Every base prop passes through; `style`
 * goes over the look's. Items keep their own look (`Button`, `Toggle`, …).
 */
export type ToolbarProps = BaseToolbarProps;

/** A named run of items along the toolbar's axis. */
export type ToolbarGroupProps = BaseToolbarGroupProps & {
  /** Higher values stay visible on the bar longer (default 0). */
  priority?: number;
  /** `"unit"` (default): the whole group folds at once; `"none"`: its `ToolbarButton`s fold individually by their own priority. */
  fold?: ToolbarGroupFold;
};

/** A hairline between runs; never a tab stop. */
export type ToolbarSeparatorProps = BaseToolbarSeparatorProps;

/** A tool wrapped so a bar with `ToolbarOverflow` can measure and fold it. */
export type ToolbarButtonProps = {
  /** How this tool appears in `ToolbarOverflow` when folded (a `MenuItem`, `MenuCheckboxItem`, `MenuRadioItem`, …). */
  menu?: JSX.Element;
  /** Higher values stay visible on the bar longer; defaults to the enclosing `ToolbarGroup`'s priority (0 outside a group). */
  priority?: number;
  /** Whether this tool may fold into `ToolbarOverflow` (default true). */
  foldable?: boolean;
  /** Classes for the box the tool stands in (see `style`). */
  class?: string;
  /** Tailwind classes toggled on that box. */
  classList?: Record<string, boolean | null | undefined>;
  /** The box the tool stands in, after the bar's own (`style` wins). */
  style?: StyleProp<ViewStyle>;
  /** The tool itself (`Button`, `Toggle`, `Link`, or a `Menu` / `Popover` trigger). */
  children?: JSX.Element;
};

/** The "⋯" trigger and menu holding tools folded out of the bar, plus any trailing items passed as `children`. */
export type ToolbarOverflowProps = {
  /** Controlled open state of the overflow menu. */
  open?: boolean | null;
  /** Uncontrolled initial open state. */
  defaultOpen?: boolean;
  /** Called when the overflow menu opens or closes. */
  onOpenChange?: (event: { open: boolean; reason: MenuOpenChangeReason }) => void;
  /** Screen-reader name of the "⋯" trigger (default `"More"`). */
  accessibilityLabel?: string;
  /** Optional heading shown at the top of the overflow menu. */
  label?: string;
  /** Tooltip shown for the "⋯" trigger. */
  tooltip?: JSX.Element;
  /** Test identifier forwarded to the "⋯" trigger. */
  testID?: string;
  /** Disables the "⋯" trigger. */
  disabled?: boolean;
  /** Alignment of the overflow menu relative to the trigger (default `"end"`). */
  align?: "start" | "center" | "end";
  /** Gap between the trigger and the menu popup (default 6). */
  offset?: number;
  /** Safe-area margin of the menu popup (default 8). */
  margin?: number;
  /** Extra style for the "⋯" trigger. */
  style?: StyleProp<ViewStyle>;
  /** Permanent menu items appended after any folded tools. */
  children?: JSX.Element;
};

type UnitRecord = {
  id: number;
  order: number;
  isGroup: boolean;
  priority: () => number;
  fold: () => ToolbarGroupFold;
  label: () => string | undefined;
};

type ItemRecord = {
  id: number;
  unitId: number;
  order: number;
  priority: () => number;
  foldable: () => boolean;
  renderMenu: () => JSX.Element;
  width?: number;
};

type FoldedSection = {
  key: number;
  label?: string;
  items: ItemRecord[];
};

type ToolbarContextValue = {
  vertical: boolean;
  disabled: () => boolean;
  hasOverflow: () => boolean;
  ready: () => boolean;
  enableOverflow: (alwaysShown: boolean) => void;
  setOverflowWidth: (w: number) => void;
  setOverflowTrigger: (node: ViewRef | null) => void;
  registerUnit: (unit: Omit<UnitRecord, "id">) => number;
  unregisterUnit: (id: number) => void;
  registerItem: (item: Omit<ItemRecord, "id">) => number;
  unregisterItem: (id: number) => void;
  measureItem: (id: number, width: number) => void;
  folded: () => ReadonlySet<number>;
  foldedSections: () => FoldedSection[];
  unitVisible: (unitId: number) => boolean;
  unitHasLeadingRule: (unitId: number) => boolean;
  markItemFocused: (id: number) => void;
  clearBarFocus: () => void;
};

const ToolbarContext = context<ToolbarContextValue | null>(null);

type GroupContextValue = {
  unitId: number;
  priority: () => number;
};

const GroupContext = context<GroupContextValue | null>(null);

function useToolbar() {
  const ctx = ToolbarContext();
  if (!ctx) throw new Error("Toolbar parts must be used within <Toolbar>");
  return ctx;
}

/** A run's direction and gap, matching `toolbarTrack`'s tools. */
function groupChrome(vertical: boolean): ViewStyle {
  return {
    flexDirection: vertical ? "column" : "row",
    alignItems: "center",
    gap: terminal ? TERMINAL_GAP : 2,
  };
}

/** Horizontal space a `toolbarRule` and its two `gap`s add between adjacent visible units, over a single gap. */
const TRACK_PAD = 3;
const TRACK_GAP = 2;
const RULE_MARGIN_HORIZONTAL = 4;

/** Creates the reactive registration, measurement, folding, and focus state for a `Toolbar`. */
function createToolbarState(
  vertical: boolean,
  disabled: () => boolean,
): ToolbarContextValue & {
  onBarLayout: (width: number) => void;
  dispose: () => void;
} {
  const barWidth = signal(0);
  const hasOverflow = signal(false);
  const overflowAlwaysShown = signal(false);
  const overflowWidth = signal<number | undefined>(undefined);
  const overflowTrigger = signal<ViewRef | null>(null);
  const units = signal<UnitRecord[]>([]);
  const items = signal<ItemRecord[]>([]);
  const focusedItem = signal<number | null>(null);
  const timedOut = signal(false);
  let settleTimer: ReturnType<typeof setTimeout> | undefined;
  let pendingFocus = false;
  let nextId = 1;
  let nextOrder = 1;

  const dispose = () => {
    if (settleTimer !== undefined) clearTimeout(settleTimer);
  };

  const focusOverflow = (node: ViewRef | null) => {
    if (!node) return;
    pendingFocus = false;
    setTimeout(() => {
      node.focus();
    }, 0);
  };

  const scheduleSettleFallback = () => {
    if (settleTimer !== undefined || timedOut()) return;
    // Risk 5: an item that never lays out must not leave the bar hidden at opacity 0 forever.
    settleTimer = setTimeout(() => {
      timedOut.set(true);
    }, 32);
  };

  const registerUnit = (unit: Omit<UnitRecord, "id">) => {
    const id = nextId++;
    const order = unit.order || nextOrder++;
    units.update((list) => [...list, { ...unit, id, order }]);
    return id;
  };

  const unregisterUnit = (id: number) => {
    units.update((list) => list.filter((u) => u.id !== id));
  };

  const registerItem = (item: Omit<ItemRecord, "id">) => {
    const id = nextId++;
    const order = item.order || nextOrder++;
    items.update((list) => [...list, { ...item, id, order }]);
    return id;
  };

  const unregisterItem = (id: number) => {
    items.update((list) => list.filter((i) => i.id !== id));
  };

  const measureItem = (id: number, w: number) => {
    items.update((list) => {
      const at = list.findIndex((i) => i.id === id);
      if (at < 0 || list[at]!.width === w) return list;
      const next = list.slice();
      next[at] = { ...list[at]!, width: w };
      return next;
    });
  };

  // Risk 2: hide the bar on its first frame until every registered tool is measured (or the
  // one-frame fallback elapses for tools that never lay out).
  const ready = computed(() => {
    if (!hasOverflow() || vertical || terminal) return true;
    if (barWidth() <= 0) return false;
    const list = items();
    if (list.length === 0 || list.every((i) => i.width !== undefined)) return true;
    return timedOut();
  });

  const orderedUnits = computed(() => [...units()].sort((a, b) => a.order - b.order));
  const orderedItems = computed(() => [...items()].sort((a, b) => a.order - b.order));

  const folded = computed<ReadonlySet<number>>(() => {
    const set = new Set<number>();
    if (!hasOverflow() || vertical || terminal) return set;
    const w = barWidth();
    const trackInset = TRACK_PAD * 2 + stroke.control * 2;
    const budget = w - trackInset;
    const allUnits = orderedUnits();
    const allItems = orderedItems();
    if (budget <= 0 || allItems.length === 0) return set;

    const itemsByUnit = new Map<number, ItemRecord[]>();
    for (const item of allItems) {
      const bucket = itemsByUnit.get(item.unitId);
      if (bucket) bucket.push(item);
      else itemsByUnit.set(item.unitId, [item]);
    }

    const ruleExtra = stroke.hairline + RULE_MARGIN_HORIZONTAL * 2 + TRACK_GAP;
    const triggerW = overflowWidth() ?? toggleSizes.default.side;
    const alwaysOverflow = overflowAlwaysShown();

    const fits = () => {
      let visibleUnitCount = 0;
      let total = 0;
      for (const unit of allUnits) {
        const unitItems = itemsByUnit.get(unit.id);
        if (!unitItems) continue;
        const vis = unitItems.filter((i) => !set.has(i.id));
        if (vis.length === 0) continue;
        visibleUnitCount += 1;
        // Risk 5: an unmeasured item contributes 0 and stays visible.
        const unitWidth =
          vis.reduce((sum, i) => sum + (i.width ?? 0), 0) + Math.max(0, vis.length - 1) * TRACK_GAP;
        total += unitWidth;
      }
      if (visibleUnitCount > 1) {
        total += (visibleUnitCount - 1) * (TRACK_GAP + ruleExtra);
      }
      if (set.size > 0 || alwaysOverflow) {
        total += (visibleUnitCount > 0 ? TRACK_GAP : 0) + triggerW;
      }
      return total <= budget;
    };

    type Candidate = {
      priority: number;
      order: number;
      itemIds: number[];
    };

    while (!fits()) {
      const candidates: Candidate[] = [];
      for (const unit of allUnits) {
        const unitItems = itemsByUnit.get(unit.id);
        if (!unitItems || unitItems.length === 0) continue;
        if (unit.isGroup && unit.fold() === "unit") {
          // Risk 3 & 5: fold the whole group together, and only if every item is foldable & measured.
          const allUnfolded = unitItems.every((i) => !set.has(i.id));
          const allEligible = unitItems.every((i) => i.foldable() && i.width !== undefined);
          if (allUnfolded && allEligible) {
            candidates.push({
              priority: unit.priority(),
              order: unit.order,
              itemIds: unitItems.map((i) => i.id),
            });
          }
        } else {
          for (const item of unitItems) {
            if (!set.has(item.id) && item.foldable() && item.width !== undefined) {
              candidates.push({
                priority: item.priority(),
                order: item.order,
                itemIds: [item.id],
              });
            }
          }
        }
      }
      if (candidates.length === 0) break;
      // Lowest priority folds first; on ties, fold the trailing tool/unit first.
      candidates.sort((a, b) => a.priority - b.priority || b.order - a.order);
      for (const id of candidates[0]!.itemIds) set.add(id);
    }

    return set;
  });

  const visibleUnitIds = computed(() => {
    const f = folded();
    const visible = new Set<number>();
    for (const item of items()) {
      if (!f.has(item.id)) visible.add(item.unitId);
    }
    return visible;
  });

  const foldedSections = computed<FoldedSection[]>(() => {
    const f = folded();
    if (f.size === 0) return [];
    const allUnits = orderedUnits();
    const allItems = orderedItems();
    const sections: FoldedSection[] = [];
    for (const unit of allUnits) {
      const foldedInUnit = allItems.filter((i) => i.unitId === unit.id && f.has(i.id));
      if (foldedInUnit.length === 0) continue;
      sections.push({
        key: unit.id,
        label: unit.isGroup ? unit.label() : undefined,
        items: foldedInUnit,
      });
    }
    return sections;
  });

  const unitVisible = (unitId: number) => visibleUnitIds().has(unitId);

  const unitHasLeadingRule = (unitId: number) => {
    if (!hasOverflow() || vertical || terminal) return false;
    const vis = visibleUnitIds();
    if (!vis.has(unitId)) return false;
    for (const unit of orderedUnits()) {
      if (unit.id === unitId) return false;
      if (vis.has(unit.id)) return true;
    }
    return false;
  };

  // Risk 1: if the bar knew which tool held focus and that tool folds, hand focus to "⋯".
  effect(() => {
    const f = folded();
    const active = focusedItem();
    if (active !== null && f.has(active)) {
      focusedItem.set(null);
      const trigger = overflowTrigger();
      if (trigger) focusOverflow(trigger);
      else pendingFocus = true;
    }
  });

  return {
    vertical,
    disabled,
    hasOverflow: () => hasOverflow(),
    ready: () => ready(),
    enableOverflow: (alwaysShown) => {
      hasOverflow.set(true);
      overflowAlwaysShown.set(alwaysShown);
    },
    setOverflowWidth: (w) => {
      if (overflowWidth() !== w) overflowWidth.set(w);
      if (pendingFocus) focusOverflow(overflowTrigger());
    },
    setOverflowTrigger: (node) => {
      overflowTrigger.set(node);
    },
    registerUnit,
    unregisterUnit,
    registerItem,
    unregisterItem,
    measureItem,
    folded: () => folded(),
    foldedSections: () => foldedSections(),
    unitVisible,
    unitHasLeadingRule,
    markItemFocused: (id) => focusedItem.set(id),
    clearBarFocus: () => focusedItem.set(null),
    onBarLayout: (w) => {
      if (w !== barWidth()) barWidth.set(w);
      if (w > 0) scheduleSettleFallback();
    },
    dispose,
  };
}

/**
 * The bar: one toolbar for screen readers, arrow keys along `axis`.
 *
 * When a `ToolbarOverflow` is present inside a horizontal non-terminal bar, items wrapped in
 * `ToolbarButton` measure themselves with `onLayout`, lower-priority tools (or whole `fold="unit"`
 * `ToolbarGroup`s) fold into the overflow menu as space narrows, and the bar draws the rules
 * between visible units while hiding until its initial measurements arrive.
 *
 * Caveat: `nsh/base`'s `Button`, `Toggle` and `Link` do not expose `onFocus` / `onBlur`,
 * `Toolbar` does not expose `onFocusIn` / `onFocusOut`, and `nsh/base`'s roving-focus manager
 * clears focus when a focused item unmounts and marks non-stop items (`"⋯"` while an earlier
 * tool remains visible) `focusable={false}` (`roving.rs:250-258`, `:358`). Therefore, when a
 * focused tool folds while an earlier tool stays on the bar, `"⋯"` can only take focus once
 * `nsh/base` hands focus over.
 */
export function Toolbar(props: ToolbarProps) {
  const [, rest] = split(props, ["style", "axis", "onLayout", "disabled"]);
  const vertical = props.axis === "vertical";
  const ctx = createToolbarState(vertical, () => Boolean(props.disabled));
  cleanup(ctx.dispose);

  return (
    <ToolbarContext.Provider value={ctx}>
      <BaseToolbar
        {...rest}
        disabled={props.disabled}
        axis={props.axis}
        onLayout={(e) => {
          ctx.onBarLayout(e.bounds.size.width);
          props.onLayout?.(e);
        }}
        // Read in the style itself, so a theme's colors and radius are the ones in use.
        style={[
          toolbarTrack({ vertical }),
          ctx.hasOverflow() && !vertical && !terminal ? { maxWidth: "100%", minWidth: 0 } : null,
          props.style ?? null,
          !ctx.ready() ? { opacity: 0 } : null,
        ]}
      />
    </ToolbarContext.Provider>
  );
}

/** A named run of items. Its direction follows the toolbar. */
export function ToolbarGroup(props: ToolbarGroupProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style", "priority", "fold"]);
  const registeredIds = signal<number[]>([]);
  const unitId = bar.registerUnit({
    order: 0,
    isGroup: true,
    priority: () => props.priority ?? 0,
    fold: () => props.fold ?? "unit",
    label: () => props.accessibilityLabel ?? undefined,
  });
  cleanup(() => bar.unregisterUnit(unitId));

  const groupValue: GroupContextValue = {
    unitId,
    priority: () => props.priority ?? 0,
  };

  // When a bar uses `ToolbarOverflow` and every `ToolbarButton` in this group folded, hide the
  // group container with `display: "none"` (rather than unmounting) so items stay registered.
  const groupHidden = () =>
    bar.hasOverflow() &&
    !bar.vertical &&
    !terminal &&
    registeredIds().length > 0 &&
    !bar.unitVisible(unitId);

  const origRegister = bar.registerItem;
  const trackedBar: ToolbarContextValue = {
    ...bar,
    registerItem: (item) => {
      const id = origRegister(item);
      registeredIds.update((list) => [...list, id]);
      return id;
    },
    unregisterItem: (id) => {
      registeredIds.update((list) => list.filter((x) => x !== id));
      bar.unregisterItem(id);
    },
  };

  return (
    <ToolbarContext.Provider value={trackedBar}>
      <GroupContext.Provider value={groupValue}>
        <If when={bar.unitHasLeadingRule(unitId)}>
          <BaseToolbarSeparator style={toolbarRule(bar.vertical)} />
        </If>
        <BaseToolbarGroup
          {...rest}
          style={[
            groupChrome(bar.vertical),
            props.style ?? null,
            groupHidden() ? { display: "none" } : null,
          ]}
        />
      </GroupContext.Provider>
    </ToolbarContext.Provider>
  );
}

/** A hairline between runs. Not a stop of the keyboard focus. */
export function ToolbarSeparator(props: ToolbarSeparatorProps) {
  const bar = useToolbar();
  const [, rest] = split(props, ["style"]);
  // When `ToolbarOverflow` is present, the bar owns the rules between visible units.
  return (
    <If when={!(bar.hasOverflow() && !bar.vertical && !terminal)}>
      <BaseToolbarSeparator {...rest} style={[toolbarRule(bar.vertical), props.style ?? null]} />
    </If>
  );
}

/** One tool wrapped so a bar with `ToolbarOverflow` can measure and fold it. */
export function ToolbarButton(props: ToolbarButtonProps) {
  const bar = useToolbar();
  const group = GroupContext();
  const ownUnitId = group
    ? group.unitId
    : bar.registerUnit({
        order: 0,
        isGroup: false,
        priority: () => props.priority ?? 0,
        fold: () => "none",
        label: () => undefined,
      });
  if (!group) cleanup(() => bar.unregisterUnit(ownUnitId));

  const itemId = bar.registerItem({
    unitId: ownUnitId,
    order: 0,
    priority: () => props.priority ?? group?.priority() ?? 0,
    foldable: () => props.foldable ?? true,
    renderMenu: () => props.menu,
  });
  cleanup(() => bar.unregisterItem(itemId));

  const isFolded = () => bar.folded().has(itemId);

  return (
    <>
      <If when={!group && bar.unitHasLeadingRule(ownUnitId)}>
        <BaseToolbarSeparator style={toolbarRule(bar.vertical)} />
      </If>
      <If when={!isFolded()}>
        <View
          class={props.class}
          classList={props.classList}
          style={[
            { flexDirection: bar.vertical ? "column" : "row", alignItems: "center" },
            props.style ?? null,
          ]}
          onLayout={({ bounds }) => bar.measureItem(itemId, bounds.size.width)}
          onKeyDown={(e) => {
            if (e.key === "tab") bar.clearBarFocus();
            else bar.markItemFocused(itemId);
          }}
        >
          {props.children}
        </View>
      </If>
    </>
  );
}

/** The "⋯" trigger and menu holding tools folded out of the bar, in bar order and grouped by their `ToolbarGroup` label. */
export function ToolbarOverflow(props: ToolbarOverflowProps) {
  const bar = useToolbar();
  const state = createOpenState<MenuOpenChangeReason>(props);
  const hasExtra = "children" in props;
  bar.enableOverflow(hasExtra);

  const foldedSections = () => bar.foldedSections();
  const showTrigger = () => hasExtra || foldedSections().length > 0;
  const isDisabled = () => Boolean(props.disabled || bar.disabled());

  return (
    <If when={showTrigger()}>
      <Menu open={state.open()} onOpenChange={({ open, reason }) => state.setOpen(open, reason)}>
        <MenuTrigger>
          {/* `default` is the width the folding budget reserves (`toggleSizes.default.side`): the
           * trigger is a toggle now, and the bar must still fold where it did. */}
          <Toggle
            ref={(node) => bar.setOverflowTrigger(node)}
            size="default"
            pressed={state.open()}
            testID={props.testID}
            accessibilityLabel={props.accessibilityLabel ?? "More"}
            disabled={isDisabled()}
            tooltip={props.tooltip}
            onLayout={({ bounds }) => bar.setOverflowWidth(bounds.size.width)}
            style={props.style ?? null}
          >
            {terminal ? (
              <Text style={toggleLabel(state.open, { disabled: isDisabled })}>⋯</Text>
            ) : (
              <Icon
                icon={Ellipsis}
                size={toggleGlyph(state.open, { disabled: isDisabled }).size}
                tint={toggleGlyph(state.open, { disabled: isDisabled }).tint}
              />
            )}
          </Toggle>
        </MenuTrigger>
        <MenuContent
          align={props.align ?? "end"}
          offset={props.offset ?? 6}
          margin={props.margin ?? 8}
        >
          {() => {
            const sections = foldedSections();
            return (
              <>
                <If when={props.label}>
                  <MenuLabel>{props.label}</MenuLabel>
                  <If when={sections.length > 0 || hasExtra}>
                    <MenuSeparator />
                  </If>
                </If>
                {sections.map((section, idx) => (
                  <>
                    {idx > 0 ? <MenuSeparator /> : null}
                    {section.label ? <MenuLabel>{section.label}</MenuLabel> : null}
                    {section.items.map((item) => {
                      const row = item.renderMenu();
                      return typeof row === "function" ? (row as () => JSX.Element)() : row;
                    })}
                  </>
                ))}
                <If when={sections.length > 0 && hasExtra}>
                  <MenuSeparator />
                </If>
              </>
            );
          }}
          {props.children}
        </MenuContent>
      </Menu>
    </If>
  );
}

/**
 * P5: every shell keeps the base props it claims to pass through. A missing base prop is a
 * type error here, caught by `nsh check apps/website/demos`.
 *
 * Each assertion names, on purpose, the base props the shell does not carry: they are on the
 * composition root (a dialog's `open` is the root's), or replaced by another prop (`selected`
 * by the tab's `value`). A base prop that disappears from a shell by accident is not in that
 * list, so the assertion fails.
 *
 * Not applicable, listed here on purpose:
 *   - `badge`, `stat`, `status`, `spinner`, `plot`: pure upstream components (and
 *     plot's look helpers) with no `nsh/base` control underneath, so there is no base props
 *     type to keep.
 *   - `card`, `field`, `item`: composed of plain views and texts (`ViewProps`, `TextProps`),
 *     which carry no behaviour of their own; their axes are asserted below.
 *   - `color-picker`, `emoji-picker`: fixed compositions that wire `nsh/base` parts with
 *     their own props (a color panel's value and format, an emoji panel's selection); they do
 *     not claim a base props pass-through.
 *   - the facades' roots and triggers (`Dialog`, `Sheet`, `Menu`, …): they hold state and
 *     slots and expose their own props; the part that wraps a base control is asserted below.
 */
import type {
  AccordionHeaderProps as BaseAccordionHeaderProps,
  AccordionItemProps as BaseAccordionItemProps,
  AccordionPanelProps as BaseAccordionPanelProps,
  AccordionProps as BaseAccordionProps,
  AccordionTriggerProps as BaseAccordionTriggerProps,
  AlertDialogOptions as BaseAlertDialogOptions,
  AvatarGroupProps as BaseAvatarGroupProps,
  AvatarProps as BaseAvatarProps,
  ButtonProps as BaseButtonProps,
  CalendarProps as BaseCalendarProps,
  CarouselContentProps as BaseCarouselContentProps,
  CarouselItemProps as BaseCarouselItemProps,
  CarouselNextProps as BaseCarouselNextProps,
  CarouselPaginationItemProps as BaseCarouselPaginationItemProps,
  CarouselPaginationProps as BaseCarouselPaginationProps,
  CarouselPreviousProps as BaseCarouselPreviousProps,
  CarouselProps as BaseCarouselProps,
  CheckboxProps as BaseCheckboxProps,
  CollapsibleProps as BaseCollapsibleProps,
  ComboboxProps as BaseComboboxProps,
  CommandProps as BaseCommandProps,
  ContextMenuProps as BaseContextMenuProps,
  DatePickerProps as BaseDatePickerProps,
  DialogProps as BaseDialogProps,
  DiffViewProps as BaseDiffViewProps,
  DockAreaProps as BaseDockAreaProps,
  EditorProps as BaseEditorProps,
  HoverCardProps as BaseHoverCardProps,
  InputProps as BaseInputProps,
  LinkProps as BaseLinkProps,
  MenuItemProps as BaseMenuItemProps,
  MenuProps as BaseMenuProps,
  MenuSeparatorProps as BaseMenuSeparatorProps,
  NumberInputProps as BaseNumberInputProps,
  OtpInputProps as BaseOtpInputProps,
  PaginationProps as BasePaginationProps,
  PopoverProps as BasePopoverProps,
  ProgressProps as BaseProgressProps,
  RadioGroupProps as BaseRadioGroupProps,
  RadioProps as BaseRadioProps,
  ResizablePanelGroupProps as BaseResizablePanelGroupProps,
  ResizablePanelProps as BaseResizablePanelProps,
  RichEditorProps as BaseRichEditorProps,
  ScrollbarProps as BaseScrollbarProps,
  SelectProps as BaseSelectProps,
  SheetProps as BaseSheetProps,
  SliderProps as BaseSliderProps,
  SplitViewProps as BaseSplitViewProps,
  NavPageProps as BaseNavPageProps,
  SubmenuProps as BaseSubmenuProps,
  SwitchProps as BaseSwitchProps,
  TabProps as BaseTabProps,
  TableBodyProps as BaseTableBodyProps,
  TableCaptionProps as BaseTableCaptionProps,
  TableCellProps as BaseTableCellProps,
  TableFooterProps as BaseTableFooterProps,
  TableHeadProps as BaseTableHeadProps,
  TableHeaderProps as BaseTableHeaderProps,
  TableProps as BaseTableProps,
  TableRowProps as BaseTableRowProps,
  TabsProps as BaseTabsProps,
  TextViewProps as BaseTextViewProps,
  TimeFieldProps as BaseTimeFieldProps,
  ToastProps as BaseToastProps,
  ToggleGroupProps as BaseToggleGroupProps,
  ToggleProps as BaseToggleProps,
  ToolbarGroupProps as BaseToolbarGroupProps,
  ToolbarProps as BaseToolbarProps,
  ToolbarSeparatorProps as BaseToolbarSeparatorProps,
  TooltipProps as BaseTooltipProps,
  TreeProps as BaseTreeProps,
} from "nsh/base";

import type { AlertDialogRole } from "@/packages/ui/alert-dialog";
import type { CommandEntry, CommandGroup, CommandItem, CommandRef } from "@/packages/ui/command";
import type {
  DockAreaLayout,
  DockAreaRef,
  DockDropIndicator,
  DockInfo,
  DockNode,
  DockPanel,
  DockPanelOptions,
  DockPlacement,
  DockTabValue,
  DockTarget,
} from "@/packages/ui/dock-area";
import type {
  FieldLegendVariant,
  FieldOrientation,
  ItemMediaVariant,
  ItemSize,
  ItemVariant,
} from "@/packages/ui/index";
import type { ButtonSize, ButtonVariant, InputVariant } from "@/packages/ui/index";
import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionProps,
  AccordionTriggerProps,
  AlertDialogContentProps,
  AvatarGroupProps,
  AvatarProps,
  BadgeProps,
  ButtonProps,
  CalendarProps,
  CarouselContentProps,
  CarouselItemProps,
  CarouselNextProps,
  CarouselPaginationItemProps,
  CarouselPaginationProps,
  CarouselPreviousProps,
  CarouselProps,
  CheckboxProps,
  CodeEditorProps,
  CollapsibleContentProps,
  ComboboxContentProps,
  CommandProps,
  ContextMenuContentProps,
  DatePickerContentProps,
  DialogContentProps,
  DiffViewProps,
  DockAreaProps,
  HoverCardContentProps,
  IconButtonProps,
  InputGroupInputProps,
  InputGroupTextareaProps,
  IconProps,
  InputProps,
  LinkProps,
  MenuContentProps,
  MenuItemProps,
  MenuSeparatorProps,
  MenuSubContentProps,
  NumberInputProps,
  OtpInputProps,
  PaginationProps,
  PopoverContentProps,
  PressableProps,
  ProgressProps,
  RadioGroupProps,
  RadioProps,
  ResizablePanelGroupProps,
  ResizablePanelProps,
  RichEditorProps,
  RoundButtonProps,
  ScrollbarProps,
  SegmentedItemProps,
  SegmentedListProps,
  SelectContentProps,
  SelectTriggerProps,
  SheetContentProps,
  SliderProps,
  SplitViewProps,
  SplitViewColumnProps,
  SplitButtonSegmentProps,
  SwitchProps,
  TableBodyProps,
  TableCaptionProps,
  TableCellProps,
  TableFooterProps,
  TableHeadProps,
  TableHeaderProps,
  TableProps,
  TableRowProps,
  TabsListProps,
  TabsTriggerProps,
  TextViewProps,
  TimeFieldProps,
  ToastProps,
  ToggleGroupProps,
  ToggleProps,
  ToolbarGroupProps,
  ToolbarProps,
  ToolbarSeparatorProps,
  TooltipContentProps,
  TreeProps,
} from "@/packages/ui/index";
import type { MenuOpenChangeReason } from "@/packages/ui/menu";
import type { TextViewClasses, TextViewImage, TextViewRef } from "@/packages/ui/text-view";

type Assert<T extends true> = T;

/**
 * After dropping the base keys the shell owns elsewhere, every remaining base prop is still
 * one of the shell's, with a type the base's fits into. The shell's own axes (a tab's
 * `value`, a button's `variant`) are not looked at: they are additions, not omissions.
 */
type KeepsBase<Base, Shell, Dropped extends PropertyKey> = [
  Exclude<Exclude<keyof Base, Dropped>, keyof Shell>,
] extends [never]
  ? Omit<Base, Dropped> extends Pick<Shell, Extract<keyof Shell, keyof Base>>
    ? true
    : false
  : false;

/** `AccordionProps`. */
type _accordion = Assert<KeepsBase<BaseAccordionProps, AccordionProps, never>>;
/** `AccordionItemProps`. */
type _accordionItem = Assert<KeepsBase<BaseAccordionItemProps, AccordionItemProps, never>>;
/** `AccordionHeaderProps`. */
type _accordionHeader = Assert<KeepsBase<BaseAccordionHeaderProps, AccordionHeaderProps, never>>;
/** `AccordionTriggerProps`. */
type _accordionTrigger = Assert<KeepsBase<BaseAccordionTriggerProps, AccordionTriggerProps, never>>;
/** `AccordionPanelProps`. */
type _accordionPanel = Assert<KeepsBase<BaseAccordionPanelProps, AccordionPanelProps, never>>;
/** `AlertDialogContentProps` — the root holds the open state, and the parts fill what the box
 * shows: the title, the message and the buttons. */
type _alertDialogContent = Assert<
  KeepsBase<BaseAlertDialogOptions, AlertDialogContentProps, "title" | "description" | "actions">
>;
/** `AvatarProps`. */
type _avatar = Assert<KeepsBase<BaseAvatarProps, AvatarProps, never>>;
/** `AvatarGroupProps`. */
type _avatarGroup = Assert<KeepsBase<BaseAvatarGroupProps, AvatarGroupProps, never>>;
/** `ButtonProps`. */
type _button = Assert<KeepsBase<BaseButtonProps, ButtonProps, never>>;
/** `IconButtonProps` — every base prop. `accessibilityLabel` is required here, over the base's
 * optional one: the check meets the base's own form, and the `@ts-expect-error` below holds the
 * required one. */
type _iconButton = Assert<
  KeepsBase<
    BaseButtonProps,
    Omit<IconButtonProps, "accessibilityLabel"> & Pick<BaseButtonProps, "accessibilityLabel">,
    never
  >
>;
/** `RoundButtonProps` — as `IconButtonProps`, with `accessibilityLabel` required. */
type _roundButton = Assert<
  KeepsBase<
    BaseButtonProps,
    Omit<RoundButtonProps, "accessibilityLabel"> & Pick<BaseButtonProps, "accessibilityLabel">,
    never
  >
>;
/** `SplitButtonSegmentProps`. */
type _splitButtonSegment = Assert<KeepsBase<BaseButtonProps, SplitButtonSegmentProps, never>>;
/** `CalendarProps`. */
type _calendar = Assert<KeepsBase<BaseCalendarProps, CalendarProps, never>>;
/** `CarouselProps`. */
type _carousel = Assert<KeepsBase<BaseCarouselProps, CarouselProps, never>>;
/** `CarouselContentProps`. */
type _carouselContent = Assert<KeepsBase<BaseCarouselContentProps, CarouselContentProps, never>>;
/** `CarouselItemProps`. */
type _carouselItem = Assert<KeepsBase<BaseCarouselItemProps, CarouselItemProps, never>>;
/** `CarouselPaginationProps`. */
type _carouselPagination = Assert<
  KeepsBase<BaseCarouselPaginationProps, CarouselPaginationProps, never>
>;
/** `CarouselPaginationItemProps`. */
type _carouselPaginationItem = Assert<
  KeepsBase<BaseCarouselPaginationItemProps, CarouselPaginationItemProps, never>
>;
/** `CarouselPreviousProps`. */
type _carouselPrevious = Assert<KeepsBase<BaseCarouselPreviousProps, CarouselPreviousProps, never>>;
/** `CarouselNextProps`. */
type _carouselNext = Assert<KeepsBase<BaseCarouselNextProps, CarouselNextProps, never>>;
/** `CheckboxProps`. */
type _checkbox = Assert<KeepsBase<BaseCheckboxProps, CheckboxProps, never>>;
/** `CollapsibleContentProps` — the root holds `open`; children are the content. */
type _collapsibleContent = Assert<
  KeepsBase<BaseCollapsibleProps, CollapsibleContentProps, "content" | "open">
>;
/** `ComboboxContentProps` — the root holds the value, the items and the trigger. */
type _comboboxContent = Assert<
  KeepsBase<
    BaseComboboxProps,
    ComboboxContentProps,
    | "cleanable"
    | "defaultOpen"
    | "defaultValue"
    | "disabled"
    | "multiple"
    | "onCancel"
    | "onChange"
    | "onClose"
    | "onOpen"
    | "onOpenChange"
    | "open"
    | "placeholder"
    | "triggerButton"
    | "value"
  >
>;
/** `CommandProps`. */
type _command = Assert<KeepsBase<BaseCommandProps, CommandProps, never>>;
/** `ContextMenuContentProps` — the root holds the trigger and the open state. */
type _contextMenuContent = Assert<
  KeepsBase<
    BaseContextMenuProps,
    ContextMenuContentProps,
    "disabled" | "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open" | "trigger"
  >
>;
/** `DatePickerContentProps` — the root holds the value and the trigger. */
type _datePickerContent = Assert<
  KeepsBase<
    BaseDatePickerProps,
    DatePickerContentProps,
    | "cleanable"
    | "defaultOpen"
    | "defaultValue"
    | "disabled"
    | "onCancel"
    | "onChange"
    | "onClose"
    | "onOpen"
    | "onOpenChange"
    | "open"
    | "trigger"
    | "value"
  >
>;
/** `DialogContentProps` — the root holds the open state. */
type _dialogContent = Assert<
  KeepsBase<
    BaseDialogProps,
    DialogContentProps,
    "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open"
  >
>;
/** `DiffViewProps`. */
type _diffView = Assert<KeepsBase<BaseDiffViewProps, DiffViewProps, never>>;
/** `DockAreaProps`. */
type _dockArea = Assert<KeepsBase<BaseDockAreaProps, DockAreaProps, never>>;
/** `CodeEditorProps`. */
type _codeEditor = Assert<KeepsBase<BaseEditorProps, CodeEditorProps, never>>;
/** `RichEditorProps`. */
type _richEditor = Assert<KeepsBase<BaseRichEditorProps, RichEditorProps, never>>;
/** `HoverCardContentProps` — the root holds the trigger, the open state and the two delays. */
type _hoverCardContent = Assert<
  KeepsBase<
    BaseHoverCardProps,
    HoverCardContentProps,
    | "closeDelay"
    | "defaultOpen"
    | "onClose"
    | "onOpen"
    | "onOpenChange"
    | "open"
    | "openDelay"
    | "trigger"
  >
>;
/** `InputProps`. */
type _input = Assert<KeepsBase<BaseInputProps, InputProps, never>>;
/** `InputGroupInputProps` — the group holds the control's `ref`, to put the keys in it from an addon. */
type _inputGroupInput = Assert<KeepsBase<BaseInputProps, InputGroupInputProps, "ref">>;
/** `InputGroupTextareaProps` — as `InputGroupInputProps`, and `multiline` is the part's own. */
type _inputGroupTextarea = Assert<
  KeepsBase<BaseInputProps, InputGroupTextareaProps, "multiline" | "ref">
>;
/** `LinkProps`. */
type _link = Assert<KeepsBase<BaseLinkProps, LinkProps, never>>;
/** `MenuContentProps` — the root holds the trigger and the open state. */
type _menuContent = Assert<
  KeepsBase<
    BaseMenuProps,
    MenuContentProps,
    "defaultOpen" | "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open" | "trigger"
  >
>;
/** `MenuItemProps`. */
type _menuItem = Assert<KeepsBase<BaseMenuItemProps, MenuItemProps, never>>;
/** `MenuSeparatorProps`. */
type _menuSeparator = Assert<KeepsBase<BaseMenuSeparatorProps, MenuSeparatorProps, never>>;
/** `MenuSubContentProps` — the submenu root holds the trigger. */
type _menuSubContent = Assert<KeepsBase<BaseSubmenuProps, MenuSubContentProps, "trigger">>;
/** `NumberInputProps`. */
type _numberInput = Assert<KeepsBase<BaseNumberInputProps, NumberInputProps, never>>;
/** `OtpInputProps`. */
type _otpInput = Assert<KeepsBase<BaseOtpInputProps, OtpInputProps, never>>;
/** `PaginationProps`. */
type _pagination = Assert<KeepsBase<BasePaginationProps, PaginationProps, never>>;
/** `PopoverContentProps` — the root holds the trigger and the open state. */
type _popoverContent = Assert<
  KeepsBase<
    BasePopoverProps,
    PopoverContentProps,
    "defaultOpen" | "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open" | "trigger"
  >
>;
/** `PressableProps`. */
type _pressable = Assert<KeepsBase<BaseButtonProps, PressableProps, never>>;
/** `ProgressProps`. */
type _progress = Assert<KeepsBase<BaseProgressProps, ProgressProps, never>>;
/** `RadioGroupProps`. */
type _radioGroup = Assert<KeepsBase<BaseRadioGroupProps, RadioGroupProps, never>>;
/** `RadioProps`. */
type _radio = Assert<KeepsBase<BaseRadioProps, RadioProps, never>>;
/** `ResizablePanelGroupProps`. */
type _resizablePanelGroup = Assert<
  KeepsBase<BaseResizablePanelGroupProps, ResizablePanelGroupProps, never>
>;
/** `ResizablePanelProps`. */
type _resizablePanel = Assert<KeepsBase<BaseResizablePanelProps, ResizablePanelProps, never>>;
/** `ScrollbarProps`. */
type _scrollbar = Assert<KeepsBase<BaseScrollbarProps, ScrollbarProps, never>>;
/** `SegmentedListProps`. */
type _segmentedList = Assert<KeepsBase<BaseTabsProps, SegmentedListProps, never>>;
/** `SegmentedItemProps` — the list's value selects the item. */
type _segmentedItem = Assert<KeepsBase<BaseTabProps, SegmentedItemProps, "selected">>;
/** `SelectContentProps` — the root holds the value and the trigger. */
type _selectContent = Assert<
  KeepsBase<
    BaseSelectProps,
    SelectContentProps,
    | "cleanable"
    | "defaultOpen"
    | "defaultValue"
    | "disabled"
    | "onCancel"
    | "onChange"
    | "onClose"
    | "onOpen"
    | "onOpenChange"
    | "open"
    | "placeholder"
    | "trigger"
    | "value"
  >
>;
/** `SheetContentProps` — the root holds the open state. */
type _sheetContent = Assert<
  KeepsBase<
    BaseSheetProps,
    SheetContentProps,
    "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open"
  >
>;
/** `SliderProps`. */
type _slider = Assert<KeepsBase<BaseSliderProps, SliderProps, never>>;
/** `SplitViewProps`. */
type _splitView = Assert<KeepsBase<BaseSplitViewProps, SplitViewProps, never>>;
/** `SplitViewColumnProps` — the column page keeps `nsh/base`'s NavPage. */
type _splitViewColumn = Assert<KeepsBase<BaseNavPageProps, SplitViewColumnProps, never>>;
/** `SwitchProps`. */
type _switch = Assert<KeepsBase<BaseSwitchProps, SwitchProps, never>>;
/** `TableProps`. */
type _table = Assert<KeepsBase<BaseTableProps, TableProps, never>>;
/** `TableHeaderProps`. */
type _tableHeader = Assert<KeepsBase<BaseTableHeaderProps, TableHeaderProps, never>>;
/** `TableBodyProps`. */
type _tableBody = Assert<KeepsBase<BaseTableBodyProps, TableBodyProps, never>>;
/** `TableFooterProps`. */
type _tableFooter = Assert<KeepsBase<BaseTableFooterProps, TableFooterProps, never>>;
/** `TableRowProps`. */
type _tableRow = Assert<KeepsBase<BaseTableRowProps, TableRowProps, never>>;
/** `TableHeadProps`. */
type _tableHead = Assert<KeepsBase<BaseTableHeadProps, TableHeadProps, never>>;
/** `TableCellProps`. */
type _tableCell = Assert<KeepsBase<BaseTableCellProps, TableCellProps, never>>;
/** `TableCaptionProps`. */
type _tableCaption = Assert<KeepsBase<BaseTableCaptionProps, TableCaptionProps, never>>;
/** `TabsListProps`. */
type _tabsList = Assert<KeepsBase<BaseTabsProps, TabsListProps, never>>;
/** `TabsTriggerProps` — the list's value selects the tab. */
type _tabsTrigger = Assert<KeepsBase<BaseTabProps, TabsTriggerProps, "selected">>;
/** `TextViewProps`. */
type _textView = Assert<KeepsBase<BaseTextViewProps, TextViewProps, never>>;
/** `TimeFieldProps`. */
type _timeField = Assert<KeepsBase<BaseTimeFieldProps, TimeFieldProps, never>>;
/** `ToastProps`. */
type _toast = Assert<KeepsBase<BaseToastProps, ToastProps, never>>;
/** `ToggleGroupProps`. */
type _toggleGroup = Assert<KeepsBase<BaseToggleGroupProps, ToggleGroupProps, never>>;
/** `ToggleProps`. */
type _toggle = Assert<KeepsBase<BaseToggleProps, ToggleProps, never>>;
/** `ToolbarProps`. */
type _toolbar = Assert<KeepsBase<BaseToolbarProps, ToolbarProps, never>>;
/** `ToolbarGroupProps`. */
type _toolbarGroup = Assert<KeepsBase<BaseToolbarGroupProps, ToolbarGroupProps, never>>;
/** `ToolbarSeparatorProps`. */
type _toolbarSeparator = Assert<KeepsBase<BaseToolbarSeparatorProps, ToolbarSeparatorProps, never>>;
/** `TooltipContentProps`. */
type _tooltipContent = Assert<KeepsBase<BaseTooltipProps, TooltipContentProps, never>>;
/** `TreeProps`. */
type _tree = Assert<KeepsBase<BaseTreeProps, TreeProps, never>>;

/**
 * `#10`: the `nsh/base` types a shell's props, ref and callbacks name are exported by the
 * component's own file, so a call site names them from its copy and never imports `nsh/base`. The
 * tab is `DockTabValue` because `DockTab` is the component the tab is drawn with.
 */
const _dockAreaLayout: DockAreaLayout = {
  center: { type: "tabs", panels: ["readme"], activeIndex: 0 },
  left: { layout: { type: "tabs", panels: ["files"] }, size: 200, open: true },
};
const _dockNode: DockNode = { type: "split", axis: "horizontal", children: [], sizes: [null] };
const _dockPanel: DockPanel = { id: "readme" };
const _dockPanelOptions: DockPanelOptions = { id: "readme", visible: true };
const _dockTabValue: DockTabValue = {
  panel: "readme",
  group: 1,
  index: 0,
  active: true,
  closable: true,
  zoomed: false,
};
const _dockTarget: DockTarget = { group: 1, side: "left", index: 0 };
const _dockDropIndicator: DockDropIndicator = { group: 1, side: "left", index: null };
const _dockInfo: DockInfo = { placement: "left", open: true, size: 200, collapsible: true };
const _dockPlacement: DockPlacement = "center";
/** The refs, named where a call site takes one (`ref={…}`). */
const _dockAreaRef: DockAreaRef | null = null;

/** A palette's rows, sections and ref. */
const _commandItem: CommandItem = { id: "open", label: "Open", keywords: ["o"] };
const _commandEntry: CommandEntry = {
  id: "open",
  label: "Open",
  keywords: [],
  disabled: false,
  checked: false,
};
const _commandGroup: CommandGroup = { heading: "File" };
const _commandRef: CommandRef | null = null;

/** A text view's images and classes. */
const _textViewImage: TextViewImage = { src: "https://example.com/a.png", alt: "A", width: "50%" };
const _textViewClasses: TextViewClasses = { link: "text-brand" };
const _textViewRef: TextViewRef | null = null;

/** The same treatment where the base's name is taken here: the reasons, the roles. */
const _menuReason: MenuOpenChangeReason = "cancel";
const _alertDialogRole: AlertDialogRole = "destructive";

type Row = { id: number; name: string };

/**
 * The three families' axes (`#19`, `docs/archive/card-field-item.md`): each takes the words shadcn
 * has and no others, so a value from another design system is a type error at the call site.
 */
const _fieldOrientation: FieldOrientation = "responsive";
const _fieldLegendVariant: FieldLegendVariant = "label";
const _itemVariant: ItemVariant = "muted";
const _itemSize: ItemSize = "sm";
const _itemMediaVariant: ItemMediaVariant = "image";
/** An input's own axis: the field's fill and edge, or neither (`ghost`). */
const _inputGhost: InputVariant = "ghost";
const _inputDefault: InputVariant = "default";
// @ts-expect-error — an input is `default` or `ghost`: `outline` is a button's.
const _inputOutline: InputVariant = "outline";
// @ts-expect-error — an input is `default` or `ghost`, not `filled`.
const _inputFilled: InputVariant = "filled";
// @ts-expect-error — a field is `vertical`, `horizontal` or `responsive`, not stacked.
const _fieldStacked: FieldOrientation = "stacked";
// @ts-expect-error — a legend is `legend` or `label`, not `title`.
const _legendTitle: FieldLegendVariant = "title";
// @ts-expect-error — an item is `default`, `outline` or `muted`, not `bordered`.
const _itemBordered: ItemVariant = "bordered";
// @ts-expect-error — an item is `default` or `sm`, not `lg`.
const _itemLg: ItemSize = "lg";
// @ts-expect-error — media is `default`, `icon` or `image`, not `avatar`.
const _mediaAvatar: ItemMediaVariant = "avatar";

/**
 * The values and props 0.3 dropped are not accepted: there are no aliases
 * (`docs/specs/api-unify.md` §6.2), so the compiler points at the call site and the call site
 * names the new word. Every line below fails without its `@ts-expect-error`, which is the
 * assertion.
 */
// @ts-expect-error — `primary` and `accent` are `default`.
const _droppedVariant: ButtonVariant = "primary";
// @ts-expect-error — `small` / `regular` / `large` are `sm` / `default` / `lg`.
const _droppedSize: ButtonSize = "small";
// @ts-expect-error — an icon button shows as chosen through the base's `selected`, not `on`.
const _iconButtonOn: IconButtonProps = { on: true };
// @ts-expect-error — an icon alone names nothing: `accessibilityLabel` is required.
const _iconButtonUnnamed: IconButtonProps = {};
// @ts-expect-error — a round icon button names nothing either: `accessibilityLabel` is required.
const _roundButtonUnnamed: RoundButtonProps = {};
/** Named, as every icon button must be. */
const _iconButtonNamed: IconButtonProps = { accessibilityLabel: "Search" };
// @ts-expect-error — a trigger's field or outline is a `variant`, not a `kind`.
const _selectTriggerKind: SelectTriggerProps = { kind: "outline" };
// @ts-expect-error — a box's size is `sm` / `default` / `lg`, not a scale.
const _checkboxScale: CheckboxProps = { scale: 0.8 };
// @ts-expect-error — a ring's size is `sm` / `default` / `lg`, not a scale.
const _radioScale: RadioProps = { scale: 1.25 };
// @ts-expect-error — a ring is the radio's `default` variant, which needs no name.
const _radioRing: RadioProps = { variant: "ring" };
// @ts-expect-error — a badge's edge is `variant="outline"`, not an `outline` prop.
const _badgeOutline: BadgeProps = { children: "Draft", outline: true };
// @ts-expect-error — a badge's word is its child, not `label`.
const _badgeLabel: BadgeProps = { children: "12", label: "12" };
// @ts-expect-error — a pager's edge is `variant="outline"`, not `outlined`.
const _paginationOutlined: PaginationProps = { page: 1, totalPages: 2, outlined: true };
// @ts-expect-error — a menu row's danger is `variant="destructive"`, not `danger`.
const _menuItemDanger: MenuItemProps = { danger: true };
// @ts-expect-error — an icon is a lucide node (`icon={ChevronRight}`), not a name.
const _iconName: IconProps = { name: "chevron" };

export {
  _alertDialogRole,
  _commandEntry,
  _commandGroup,
  _commandItem,
  _commandRef,
  _dockAreaLayout,
  _dockAreaRef,
  _dockDropIndicator,
  _dockInfo,
  _dockNode,
  _dockPanel,
  _dockPanelOptions,
  _dockPlacement,
  _dockTabValue,
  _dockTarget,
  _menuReason,
  _textViewClasses,
  _textViewImage,
  _textViewRef,
  _fieldLegendVariant,
  _fieldOrientation,
  _inputDefault,
  _inputGhost,
  _inputOutline,
  _inputFilled,
  _itemMediaVariant,
  _itemSize,
  _itemVariant,
  _fieldStacked,
  _legendTitle,
  _itemBordered,
  _itemLg,
  _mediaAvatar,
  _badgeLabel,
  _badgeOutline,
  _checkboxScale,
  _droppedSize,
  _droppedVariant,
  _iconButtonOn,
  _iconButtonUnnamed,
  _iconButtonNamed,
  _roundButtonUnnamed,
  _iconName,
  _menuItemDanger,
  _paginationOutlined,
  _radioRing,
  _radioScale,
  _selectTriggerKind,
};

export type {
  _accordion,
  _accordionItem,
  _accordionHeader,
  _accordionTrigger,
  _accordionPanel,
  _alertDialogContent,
  _avatar,
  _button,
  _iconButton,
  _roundButton,
  _splitButtonSegment,
  _calendar,
  _carousel,
  _carouselContent,
  _carouselItem,
  _carouselPagination,
  _carouselPaginationItem,
  _carouselPrevious,
  _carouselNext,
  _checkbox,
  _collapsibleContent,
  _comboboxContent,
  _command,
  _contextMenuContent,
  _datePickerContent,
  _dialogContent,
  _diffView,
  _dockArea,
  _codeEditor,
  _richEditor,
  _hoverCardContent,
  _input,
  _link,
  _menuContent,
  _menuItem,
  _menuSeparator,
  _menuSubContent,
  _numberInput,
  _otpInput,
  _pagination,
  _popoverContent,
  _pressable,
  _progress,
  _radioGroup,
  _radio,
  _resizablePanelGroup,
  _resizablePanel,
  _scrollbar,
  _segmentedList,
  _segmentedItem,
  _selectContent,
  _sheetContent,
  _slider,
  _switch,
  _table,
  _tableHeader,
  _tableBody,
  _tableFooter,
  _tableRow,
  _tableHead,
  _tableCell,
  _tableCaption,
  _tabsList,
  _tabsTrigger,
  _textView,
  _timeField,
  _toast,
  _toggleGroup,
  _toggle,
  _toolbar,
  _toolbarGroup,
  _toolbarSeparator,
  _tooltipContent,
  _tree,
};

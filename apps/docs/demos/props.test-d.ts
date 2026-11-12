/**
 * P5: every shell keeps the base props it claims to pass through. A missing base prop is a
 * type error here, caught by `nsh check apps/docs/demos`.
 *
 * Each assertion names, on purpose, the base props the shell does not carry: they are on the
 * composition root (a dialog's `open` is the root's), or replaced by another prop (`selected`
 * by the tab's `value`). A base prop that disappears from a shell by accident is not in that
 * list, so the assertion fails.
 *
 * Not applicable, listed here on purpose:
 *   - `badge`, `stat`, `status`, `meter`, `spinner`, `plot`: pure upstream components (and
 *     plot's look helpers) with no `nsh/base` control underneath, so there is no base props
 *     type to keep.
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

import type {
  AccordionHeaderProps,
  AccordionItemProps,
  AccordionPanelProps,
  AccordionProps,
  AccordionTriggerProps,
  AlertDialogContentProps,
  AvatarProps,
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
  CollapsibleContentProps,
  ComboboxContentProps,
  CommandProps,
  ContextMenuContentProps,
  DatePickerContentProps,
  DialogContentProps,
  DiffViewProps,
  DockAreaProps,
  EditorProps,
  HoverCardContentProps,
  IconButtonProps,
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
  SheetContentProps,
  SliderProps,
  SplitButtonSegmentProps,
  SwitchProps,
  TabProps,
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

type Assert<T extends true> = T;

/**
 * After dropping the base keys the shell owns elsewhere, every remaining base prop is still
 * one of the shell's, with a type the base's fits into. The shell's own axes (a tab's
 * `value`, a button's `variant`) are not looked at: they are additions, not omissions.
 */
type KeepsBase<Base, Shell, Dropped extends PropertyKey> =
  Omit<Base, Dropped> extends Pick<Shell, Extract<keyof Shell, keyof Base>> ? true : false;

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
/** `AlertDialogContentProps` — the root holds the open state. */
type _alertDialogContent = Assert<
  KeepsBase<
    BaseDialogProps,
    AlertDialogContentProps,
    "onCancel" | "onClose" | "onOpen" | "onOpenChange" | "open"
  >
>;
/** `AvatarProps`. */
type _avatar = Assert<KeepsBase<BaseAvatarProps, AvatarProps, never>>;
/** `ButtonProps`. */
type _button = Assert<KeepsBase<BaseButtonProps, ButtonProps, never>>;
/** `IconButtonProps`. */
type _iconButton = Assert<KeepsBase<BaseButtonProps, IconButtonProps, never>>;
/** `RoundButtonProps`. */
type _roundButton = Assert<KeepsBase<BaseButtonProps, RoundButtonProps, never>>;
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
/** `EditorProps`. */
type _editor = Assert<KeepsBase<BaseEditorProps, EditorProps, never>>;
/** `RichEditorProps`. */
type _richEditor = Assert<KeepsBase<BaseRichEditorProps, RichEditorProps, never>>;
/** `HoverCardContentProps` — the root holds the trigger and the open state. */
type _hoverCardContent = Assert<
  KeepsBase<
    BaseHoverCardProps,
    HoverCardContentProps,
    "defaultOpen" | "onClose" | "onOpen" | "onOpenChange" | "open" | "trigger"
  >
>;
/** `InputProps`. */
type _input = Assert<KeepsBase<BaseInputProps, InputProps, never>>;
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
/** `TabProps`. */
type _tab = Assert<KeepsBase<BaseTabProps, TabProps, never>>;
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

type Row = { id: number; name: string };

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
  _editor,
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
  _tab,
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

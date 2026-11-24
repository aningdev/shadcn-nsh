# Build an interface

## Find the components

Everything below exists in the registry. If a screen needs something this list does not name, run `npx shadcn-nsh@latest list` before building it by hand.

| Need                                    | Components                                                                                                                                                                           |
| --------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| A surface, a page section, a split pane | `Card` `Separator` `ResizablePanelGroup` `ResizablePanel` `SplitView` `Scrollbar` `AspectRatio` `Sidebar` `CollapsingHeader` `TitleBar`                                              |
| Navigation                              | `Tabs` `Segmented` `Breadcrumb` `Pagination` `NavigationMenu` `NavStack` `Sidebar` `DockArea`                                                                                        |
| A form                                  | `Field` `Input` `NumberInput` `OtpInput` `TimeField` `Select` `Combobox` `Checkbox` `RadioGroup` `Switch` `Slider` `Calendar` `DatePicker` `ColorPanel` `ColorPopover` `Label` `Kbd` |
| An editor                               | `RichEditor` `CodeEditor` `EmojiPanel`                                                                                                                                               |
| An action                               | `Button` `ButtonGroup` `IconButton` `RoundButton` `SplitButton` `Pressable` `Toolbar` `Toggle` `ToggleGroup`                                                                         |
| An overlay                              | `Dialog` `AlertDialog` `Sheet` `Drawer` `Popover` `HoverCard` `Tooltip` `Menu` `ContextMenu` `Menubar`                                                                               |
| A message                               | `Toast` `Alert` `Status` `Bubble` `Message` `MessageScroller` `Attachment`                                                                                                           |
| Data                                    | `Table` `DataTable` `Tree` `Stat` `Badge` `Avatar` `Item` `Link` `CodeBlock` `DiffView` `TextView` `Plot` `Trace` `Terminal` `Marker` `ImageViewer`                                  |
| Loading, empty, progress                | `Spinner` `Skeleton` `Progress` `RefreshIndicator` `Empty`                                                                                                                           |
| Layout primitives from NSH              | `View` `Text` `Scroll` (from `nsh`), `Scrollbar` for a styled scroll area                                                                                                            |

Whole families: `Accordion` `Collapsible` `Carousel` `Command` `InputGroup` `ButtonGroup`; dropdown menus are `Menu`.

## Compose the parts

A component is a file that exports its whole family. Import the parts together from the same file; there are no dotted names.

```tsx
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
```

The roles repeat across families, so a family you have not read is still guessable:

| Role                                | What it does                                                 | Examples                                                       |
| ----------------------------------- | ------------------------------------------------------------ | -------------------------------------------------------------- |
| Root                                | Owns the state of the family; one per family, wraps the rest | `Card` `Select` `Dialog` `Tabs` `Field` `Menu`                 |
| Trigger                             | The control the user presses to open or switch               | `SelectTrigger` `DialogTrigger` `PopoverTrigger` `TabsTrigger` |
| Content                             | The surface that appears or the region that holds the body   | `SelectContent` `DialogContent` `PopoverContent` `TabsContent` |
| Item                                | One choice, row or panel                                     | `SelectItem` `MenuItem` `AccordionItem` `TabsTrigger`          |
| Value                               | Renders the current choice inside its trigger                | `SelectValue`                                                  |
| Label                               | Names a group or a field                                     | `SelectLabel` `FieldLabel` `CardTitle`                         |
| Group                               | Groups items or fields under one name                        | `SelectGroup` `FieldGroup` `RadioGroup` `ToggleGroup`          |
| Header, Footer, Action, Description | Fixed regions of a surface                                   | `CardHeader` `CardFooter` `CardAction` `CardDescription`       |
| Separator                           | Divides groups or rows                                       | `Separator` `FieldSeparator`                                   |

Text trees in each component's docs page show the exact shape:

```text
Select
├── SelectTrigger
│   └── SelectValue
└── SelectContent
    ├── SelectGroup
    │   ├── SelectLabel
    │   └── SelectItem
    └── SelectItem
```

```text
FieldSet
├── FieldLegend
├── FieldDescription
└── FieldGroup
    ├── Field
    │   ├── FieldLabel
    │   ├── FieldContent
    │   │   ├── FieldTitle
    │   │   └── FieldDescription
    │   └── FieldError
    └── FieldSeparator
```

## State

State lives in the Root; parts read it. Controlled props are the ones whose name ends in `value`, `checked` or `open`; the change callback receives an object with just that field.

```tsx
const language = signal<string | null>("en");
const wifi = signal(true);
const open = signal(false);

<Select value={language()} onChange={({ value }) => language.set(value)}>
  <SelectTrigger>
    <SelectValue placeholder="Language" />
  </SelectTrigger>
  <SelectContent>
    <SelectItem value="en">English</SelectItem>
    <SelectItem value="de">Deutsch</SelectItem>
  </SelectContent>
</Select>

<Switch checked={wifi()} onChange={({ checked }) => wifi.set(checked)} accessibilityLabel="Wi-Fi" />

<Dialog open={open()} onOpenChange={({ open: next }) => open.set(next)}>…</Dialog>
```

## A settings card

The row pattern: a `Field` holds the label and description, the control sits beside it, and the control repeats the label's words in `accessibilityLabel`.

```tsx
import { signal, View } from "nsh";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Field,
  FieldContent,
  FieldDescription,
  FieldGroup,
  FieldLabel,
  FieldSeparator,
} from "@/components/ui/field";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";

const wifi = signal(true);
const automatic = signal(false);
const language = signal<string | null>("en");

function Settings() {
  return (
    <View style={{ padding: 24, gap: 24 }}>
      <Card>
        <CardHeader>
          <CardTitle>General</CardTitle>
        </CardHeader>
        <CardContent>
          <FieldGroup>
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Wi-Fi</FieldLabel>
                <FieldDescription>Join known networks automatically.</FieldDescription>
              </FieldContent>
              <Switch
                checked={wifi()}
                onChange={({ checked }) => wifi.set(checked)}
                accessibilityLabel="Wi-Fi"
              />
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldContent>
                <FieldLabel>Automatic updates</FieldLabel>
                <FieldDescription>Install new versions in the background.</FieldDescription>
              </FieldContent>
              <Switch
                checked={automatic()}
                onChange={({ checked }) => automatic.set(checked)}
                accessibilityLabel="Automatic updates"
              />
            </Field>
            <FieldSeparator />
            <Field orientation="horizontal">
              <FieldLabel>Language</FieldLabel>
              <View style={{ width: 160 }}>
                <Select value={language()} onChange={({ value }) => language.set(value)}>
                  <SelectTrigger>
                    <SelectValue placeholder="Choose" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="en">English</SelectItem>
                    <SelectItem value="de">Deutsch</SelectItem>
                  </SelectContent>
                </Select>
              </View>
            </Field>
          </FieldGroup>
        </CardContent>
        <CardFooter>
          <Button variant="default" onPress={() => automatic.set(true)}>
            Check for updates
          </Button>
        </CardFooter>
      </Card>
    </View>
  );
}
```

`SelectTrigger` style carries only the trigger's own look: placing it (`width`, `flex`) goes on the `View` around the select. Keep only layout there — the fill and edge belong to the component.

## Avoid

- A `View` with `backgroundColor`/`borderColor` picked by hand: use `colors.background`, `colors.card`, `finish.card`, `stroke`.
- A `<label for>`: NSH has none. Use `FieldLabel` plus `accessibilityLabel`.
- Building a select, switch or dialog out of `Pressable`: use the family; it already handles keyboard, focus and accessibility.
- A second `mount()`: one per app.

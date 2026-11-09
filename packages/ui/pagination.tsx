import { colors, focusRing, radius } from "@shadcn-nsh/theme";
import type { JSX } from "nsh";
import { Text } from "nsh";
import { Pagination as BasePagination, type PaginationItemState } from "nsh/base";

export function Pagination(props: {
  page: number;
  totalPages: number;
  visiblePages?: number;
  compact?: boolean;
  disabled?: boolean;
  accessibilityLabel?: string | null;
  children?: JSX.Element;
  onChange?: (event: { page: number }) => void;
}) {
  return (
    <BasePagination
      page={props.page}
      totalPages={props.totalPages}
      visiblePages={props.visiblePages}
      compact={props.compact}
      disabled={props.disabled}
      accessibilityLabel={props.accessibilityLabel}
      onChange={props.onChange}
      style={{
        flexDirection: "row",
        alignItems: "center",
        gap: 4,
        opacity: props.disabled ? 0.5 : 1,
      }}
      itemStyle={{
        minWidth: 36,
        height: 36,
        paddingHorizontal: 8,
        borderRadius: radius.control,
        borderWidth: 1,
        borderColor: colors.border,
        backgroundColor: colors.background,
        color: colors.foreground,
        fontSize: 14,
        textAlign: "center",
      }}
      focusStyle={focusRing()}
      renderItem={(item: PaginationItemState) => (
        <Text
          style={{
            fontSize: 14,
            fontWeight: item.current ? "600" : "400",
            color: item.current ? colors.primary : colors.foreground,
          }}
        >
          {item.kind === "previous"
            ? "‹"
            : item.kind === "next"
              ? "›"
              : item.kind === "ellipsis"
                ? "…"
                : String(item.page)}
        </Text>
      )}
    >
      {props.children}
    </BasePagination>
  );
}

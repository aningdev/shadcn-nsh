import { colors } from "@shadcn-nsh/theme";
import type { ImageAsset, JSX } from "nsh";
import { Text } from "nsh";
import { Avatar as BaseAvatar, AvatarGroup as BaseAvatarGroup } from "nsh/base";

export function Avatar(props: {
  src?: string | ImageAsset | null;
  name?: string | null;
  size?: number;
  accessibilityLabel?: string | null;
  fallbackDelay?: number;
  fallback?: JSX.Element;
  children?: JSX.Element;
  onStatusChange?: (event: { status: string }) => void;
}) {
  const size = () => props.size ?? 40;
  const initials = () => {
    const name = props.name?.trim();
    if (!name) return "?";
    const parts = name.split(/\s+/);
    if (parts.length === 1) return parts[0]!.slice(0, 2).toUpperCase();
    return (parts[0]![0]! + parts[1]![0]!).toUpperCase();
  };

  return (
    <BaseAvatar
      src={props.src}
      name={props.name}
      accessibilityLabel={props.accessibilityLabel}
      fallbackDelay={props.fallbackDelay}
      onStatusChange={props.onStatusChange as never}
      style={{
        width: size(),
        height: size(),
        borderRadius: size() / 2,
        overflow: "hidden",
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
      }}
      imageStyle={{ width: size(), height: size() }}
      fallbackStyle={{
        width: size(),
        height: size(),
        borderRadius: size() / 2,
        backgroundColor: colors.muted,
        alignItems: "center",
        justifyContent: "center",
      }}
      fallback={
        props.fallback ?? (
          <Text
            style={{ fontSize: size() * 0.35, fontWeight: "600", color: colors.mutedForeground }}
          >
            {initials()}
          </Text>
        )
      }
    >
      {props.children}
    </BaseAvatar>
  );
}

export function AvatarGroup(props: {
  limit?: number;
  total?: number | null;
  accessibilityLabel?: string | null;
  overflow?: JSX.Element;
  children?: JSX.Element;
}) {
  const more = () => Math.max(0, (props.total ?? 0) - (props.limit ?? 3));

  return (
    <BaseAvatarGroup
      limit={props.limit}
      total={props.total}
      accessibilityLabel={props.accessibilityLabel}
      style={{ flexDirection: "row", alignItems: "center" }}
      overflowStyle={{
        width: 40,
        height: 40,
        borderRadius: 20,
        marginLeft: -8,
        backgroundColor: colors.secondary,
        alignItems: "center",
        justifyContent: "center",
        borderWidth: 2,
        borderColor: colors.background,
      }}
      overflow={
        props.overflow ?? (
          <Text style={{ fontSize: 12, fontWeight: "600", color: colors.secondaryForeground }}>
            {more() > 0 ? `+${more()}` : "…"}
          </Text>
        )
      }
    >
      {props.children}
    </BaseAvatarGroup>
  );
}

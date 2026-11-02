import { colors } from "@shadcn-nsh/theme";
import { mount, Text, View } from "nsh";

import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableFooter,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../packages/ui/table";

function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 16,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Table</Text>
      <Table accessibilityLabel="Team roster">
        <TableHeader>
          <TableRow>
            <TableHead>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                Name
              </Text>
            </TableHead>
            <TableHead>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                Role
              </Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow>
            <TableCell>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Ada</Text>
            </TableCell>
            <TableCell>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Engineer</Text>
            </TableCell>
          </TableRow>
          <TableRow>
            <TableCell>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Grace</Text>
            </TableCell>
            <TableCell>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Admiral</Text>
            </TableCell>
          </TableRow>
        </TableBody>
        <TableFooter>
          <TableRow>
            <TableCell>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.foreground }}>
                Total
              </Text>
            </TableCell>
            <TableCell>
              <Text style={{ fontSize: 13, color: colors.foreground }}>2</Text>
            </TableCell>
          </TableRow>
        </TableFooter>
        <TableCaption>
          <Text style={{ fontSize: 12, color: colors.mutedForeground }}>Team snapshot</Text>
        </TableCaption>
      </Table>
      <Table accessibilityLabel="Style merge" style={{ borderRadius: 12 }}>
        <TableHeader style={{ backgroundColor: "transparent" }}>
          <TableRow>
            <TableHead style={{ flex: 2, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                Name
              </Text>
            </TableHead>
            <TableHead>
              <Text style={{ fontSize: 13, fontWeight: "600", color: colors.mutedForeground }}>
                Role
              </Text>
            </TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          <TableRow hoverStyle={{ backgroundColor: "transparent" }}>
            <TableCell style={{ flex: 2, paddingHorizontal: 16 }}>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Style merge</Text>
            </TableCell>
            <TableCell>
              <Text style={{ fontSize: 14, color: colors.foreground }}>Consumer wins</Text>
            </TableCell>
          </TableRow>
        </TableBody>
      </Table>
    </View>
  );
}

mount(App);

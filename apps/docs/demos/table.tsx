import { colors } from "@shadcn-nsh/theme";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "../../../packages/ui/table";
import { mount, Text, View } from "nsh";

function App() {
  return (
    <View
      style={{
        flex: 1,
        backgroundColor: colors.background,
        padding: 20,
        gap: 12,
        justifyContent: "center",
      }}
    >
      <Text style={{ fontSize: 16, fontWeight: "600", color: colors.foreground }}>Table</Text>
      <Table>
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
      </Table>
    </View>
  );
}

mount(App);

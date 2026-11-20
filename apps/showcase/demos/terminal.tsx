import process, { type ChildProcess } from "process";

import { colors } from "@shadcn-nsh/theme";
// Terminal: the official gallery's scene (`references/nsh/examples/gallery/demos/TerminalDemo.tsx`)
// with this library's terminal — a small shell, the 16 ANSI colors and a 24-bit ramp, a progress
// bar redrawn in place, and on the desktop any other command through the system shell.
import { platform, signal, Text, View } from "nsh";

import { Terminal, type TerminalRef } from "@/packages/ui/terminal";

const PROMPT = "\x1b[32mnsh\x1b[0m:\x1b[34m~\x1b[0m$ ";

const HELP = [
  "Commands:",
  "  \x1b[1mls\x1b[0m        the files here",
  "  \x1b[1mcolors\x1b[0m    the 16 ANSI colors and a 24-bit ramp",
  "  \x1b[1mprogress\x1b[0m  a bar redrawn in place",
  "  \x1b[1mecho\x1b[0m …    prints what follows",
  "  \x1b[1mclear\x1b[0m     clears the screen",
  "Anything else runs in the system shell on the desktop (Ctrl+C stops it).",
].join("\r\n");

const desktop = platform.desktop && platform.os !== "web";

function colorsOf() {
  let out = "";
  for (let i = 0; i < 16; i++) {
    out += `\x1b[48;5;${i}m  \x1b[0m`;
    if (i === 7) out += "\r\n";
  }
  out += "\r\n";
  for (let i = 0; i < 48; i++) {
    const r = Math.round(255 * (1 - i / 47));
    const b = Math.round(255 * (i / 47));
    out += `\x1b[48;2;${r};96;${b}m \x1b[0m`;
  }
  return out;
}

const LS = [
  "\x1b[1;34mcrates\x1b[0m  \x1b[1;34mexamples\x1b[0m  \x1b[1;34mwebsite\x1b[0m  Cargo.toml  README.md  \x1b[1;32minstall.sh\x1b[0m",
].join("\r\n");

/**
 * A shell's colors, a progress bar redrawn in place, the keys typed sent back. The page scrolls,
 * so the terminal sits in a fixed frame (upstream fills the window; see the shell gap).
 */
export function TerminalDemo() {
  const term = signal<TerminalRef | undefined>(undefined);
  const line = signal("");
  const child = signal<ChildProcess | undefined>(undefined);
  const welcomed = signal(false);
  const write = (s: string) => term()?.write(s);

  const progress = () => {
    let done = 0;
    const tick = () => {
      done += 5;
      const filled = Math.round(done / 5);
      write(`\r\x1b[36m${"█".repeat(filled)}\x1b[2m${"░".repeat(20 - filled)}\x1b[0m ${done}%`);
      if (done < 100) setTimeout(tick, 60);
      else write(`\r\n${PROMPT}`);
    };
    tick();
  };

  const shell = (command: string) => {
    const windows = process.platform === "windows";
    try {
      child.set(
        windows
          ? process.spawn("cmd.exe", ["/d", "/c", command])
          : process.spawn("sh", ["-c", command]),
      );
    } catch (error) {
      write(`\x1b[31m${String(error)}\x1b[0m\r\n${PROMPT}`);
      return;
    }
    const running = child();
    if (!running) return;
    const out = (text: string) => write(text.replace(/\r?\n/g, "\r\n"));
    running.on("stdout", out);
    running.on("stderr", (text) => out(`\x1b[31m${text}\x1b[0m`));
    running.on("exit", () => {
      child.set(undefined);
      write(PROMPT);
    });
  };

  const run = (command: string) => {
    const [name, ...rest] = command.trim().split(/\s+/);
    switch (name) {
      case "":
        break;
      case "help":
        write(`${HELP}\r\n`);
        break;
      case "ls":
        // The desktops list the real files.
        if (desktop) {
          shell(command);
          return;
        }
        write(`${LS}\r\n`);
        break;
      case "colors":
        write(`${colorsOf()}\r\n`);
        break;
      case "echo":
        write(`${rest.join(" ")}\r\n`);
        break;
      case "clear":
        write("\x1b[2J\x1b[H");
        break;
      case "progress":
        progress();
        return;
      default:
        if (desktop) {
          shell(command);
          return;
        }
        write(`\x1b[31m${name}: command not found\x1b[0m\r\n`);
    }
    write(PROMPT);
  };

  const input = ({ data }: { data: string }) => {
    const running = child();
    if (running) {
      if (data.includes("\x03")) running.kill();
      return;
    }
    for (const ch of data) {
      if (ch === "\r") {
        write("\r\n");
        const command = line();
        line.set("");
        run(command);
      } else if (ch === "\x7f") {
        if (line().length > 0) {
          line.set(line().slice(0, -1));
          write("\b \b");
        }
      } else if (ch === "\x03") {
        line.set("");
        write(`^C\r\n${PROMPT}`);
      } else if (ch === "\x0c") {
        write(`\x1b[2J\x1b[H${PROMPT}${line()}`);
      } else if (ch >= " ") {
        line.set(line() + ch);
        write(ch);
      }
    }
  };

  return (
    <View style={{ flex: 1, gap: 12, padding: 16, backgroundColor: colors.background }}>
      <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
        Type help, then press Enter.
      </Text>
      <Terminal
        ref={(r) => {
          term.set(r);
          r.focus();
        }}
        accessibilityLabel="Terminal"
        style={{ flex: 1 }}
        onResize={() => {
          // The welcome waits for the first size, so it wraps at the terminal's width.
          if (welcomed()) return;
          welcomed.set(true);
          write(`Welcome to the \x1b[1mNSH\x1b[0m terminal.\r\n\r\n${HELP}\r\n\r\n${PROMPT}`);
        }}
        onData={input}
      />
    </View>
  );
}

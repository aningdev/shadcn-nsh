// The standard modules of nsh: buffer, crypto, path, url, zlib; os and process; fs/promises; the
// host's processes and TCP; the websocket module and the global WebSocket. Every action runs
// against the real host and shows its result or error. The scenes follow the official gallery's
// Standard demo.
import { Buffer } from "buffer";
import console from "console";
import { createHash, randomUUID } from "crypto";
import fs from "fs/promises";
import net from "net";
import os from "os";
import path from "path";
import process from "process";
import { fileURLToPath, pathToFileURL } from "url";
import { gzipSync, gunzipSync } from "zlib";

import { type Accessor, cleanup, platform, signal, Text, View } from "nsh";
import { connect } from "websocket";

import { Button } from "@/packages/ui/button";

import { DemoPage } from "../kit";
import { Card, Note, monoText } from "./platform-shared";

/** What a card reads and the call it makes: the demo's results, its busy flags, its closers. */
type Scene = {
  results: Accessor<Record<string, string>>;
  busy: Accessor<Record<string, boolean>>;
  run: (name: string, action: () => Promise<string>) => Promise<void>;
  disposed: Accessor<boolean>;
  release: Set<() => void>;
};

/** Each action calls the host's standard APIs and displays its result or error. */
export function StandardApisDemo() {
  const results = signal<Record<string, string>>({});
  const busy = signal<Record<string, boolean>>({});
  const disposed = signal(false);
  const release = new Set<() => void>();
  cleanup(() => {
    disposed.set(true);
    for (const close of release) close();
  });
  const show = (key: string, text: string) => {
    if (!disposed()) results.set({ ...results(), [key]: text });
  };
  const run = async (key: string, action: () => Promise<string>) => {
    if (disposed() || busy()[key]) return;
    busy.set({ ...busy(), [key]: true });
    try {
      show(key, await action());
    } catch (error) {
      show(key, String(error));
    } finally {
      if (!disposed()) busy.set({ ...busy(), [key]: false });
    }
  };
  const scene: Scene = {
    results,
    busy,
    run,
    disposed,
    release,
  };

  return (
    <DemoPage title="Standard APIs">
      <Utilities scene={scene} />
      <Environment scene={scene} />
      <Files scene={scene} />
      <Processes scene={scene} />
      <Tcp scene={scene} />
      <WebSockets />
      <Exit scene={scene} />
      <Note>
        Each action runs against the real host: the files land in the app's data directory, the
        process and socket actions talk to this machine.
      </Note>
    </DemoPage>
  );
}

/** One card: a run button and the result under it (the last one's stays). */
function Action(props: {
  name: string;
  detail: string;
  action: () => Promise<string>;
  scene: Scene;
}) {
  return (
    <Card title={props.name} subtitle={props.detail}>
      <Button
        disabled={props.scene.busy()[props.name] ?? false}
        onPress={() => {
          void props.scene.run(props.name, props.action);
        }}
      >
        {`Run ${props.name}`}
      </Button>
      <Text style={[monoText(13), { userSelect: "text" }]}>
        {props.scene.results()[props.name] ?? "Ready"}
      </Text>
    </Card>
  );
}

function dataDirectory(): string {
  if (!process.dataDir) throw new Error("The host has no data directory configured");
  return process.dataDir;
}

function Utilities(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="Utilities"
      detail="buffer · crypto · path · url · zlib"
      action={async () => {
        const bytes = Buffer.from("Native Shell", "utf8");
        const packed = gzipSync(bytes);
        const filename = path.join(dataDirectory(), "showcase.txt");
        const url = pathToFileURL(filename);
        const hash = createHash("sha256").update(bytes).digest("hex");
        const roundTrip = fileURLToPath(url);
        const roundTripStatus =
          roundTrip === filename ? "matches original path" : "MISMATCH (url module)";
        console.info("Showcase utilities", hash);
        return `${bytes.toString("base64")}\nSHA-256: ${hash}\nUUID: ${randomUUID()}\nGlobal UUID: ${crypto.randomUUID()}\nGlobal Buffer: ${globalThis.Buffer.from("NSH").toString("hex")}\nGzip: ${packed.length} bytes → ${gunzipSync(packed).toString()}\n${url.href}\nFile URL round trip: ${roundTripStatus}\n${roundTrip}\n${path.basename(filename)}`;
      }}
    />
  );
}

function Environment(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="Environment"
      detail="os · process.nextTick · console · import.meta.url"
      action={async () => {
        await new Promise<void>((resolve) => process.nextTick(resolve));
        return `${os.platform() || platform.os} / ${os.arch()}\nProcess: ${process.platform || platform.os} / ${process.arch}\nHome: ${platform.os === "web" ? "Browser context" : os.homedir()}\nData: ${process.dataDir}\nEOL: ${JSON.stringify(os.EOL)}\nEnv: ${JSON.stringify(process.env)}\nModule: ${import.meta.url}`;
      }}
    />
  );
}

function Files(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="Files"
      detail="fs/promises: create, write, read, list, inspect, rename, remove"
      action={async () => {
        const dir = path.join(dataDirectory(), `showcase-${randomUUID()}`);
        const file = path.join(dir, "note.txt");
        const moved = path.join(dir, "renamed.txt");
        await fs.mkdir(dir, { recursive: true });
        try {
          await fs.writeFile(file, "Hello from NSH");
          const text = await fs.readFile(file, "utf8");
          const bytes = await fs.readFile(file);
          const stats = await fs.stat(file);
          const link = await fs.lstat(file);
          const entries = await fs.readdir(dir, { withFileTypes: true });
          const names = await fs.readdir(dir);
          let linkResult: string;
          try {
            linkResult = `Unexpected symlink target: ${await fs.readlink(file)}`;
          } catch (error) {
            if (!(error instanceof Error) || !("code" in error) || error.code !== "EINVAL")
              throw error;
            linkResult = "Expected EINVAL: note.txt is a regular file, not a symbolic link";
          }
          await fs.rename(file, moved);
          const exists = await fs.exists(moved);
          await fs.unlink(moved);
          return `${text}\n${bytes.length} bytes, stat: ${stats.size}, file: ${link.isFile()}\nMode: ${stats.mode.toString(8)}, directory: ${stats.isDirectory()}, symlink: ${link.isSymbolicLink()}\nModified: ${stats.mtime.toISOString()} (${stats.mtimeMs})\nAccessed: ${stats.atime.toISOString()} (${stats.atimeMs})\nCreated: ${stats.birthtime.toISOString()} (${stats.birthtimeMs})\n${names.join(", ")}\n${entries.map((entry) => `${entry.name}: directory=${entry.isDirectory()}`).join("\n")}\nRenamed: ${exists}; removed: ${!(await fs.exists(moved))}\nreadlink validation: ${linkResult}`;
        } finally {
          for (const name of await fs.readdir(dir)) await fs.unlink(path.join(dir, name));
          await fs.rmdir(dir);
        }
      }}
    />
  );
}

function Processes(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="Processes"
      detail={
        platform.os === "web"
          ? "process.run · spawn · browser hosts return an unsupported-operation error"
          : "process.run · spawn · stdout/stderr/exit · stdin · kill"
      }
      action={async () => {
        const windows = os.platform() === "windows";
        const command = windows ? "cmd.exe" : "cat";
        const args = windows ? ["/d", "/c", "more"] : [];
        const output = await process.run(
          windows ? "cmd.exe" : "echo",
          windows ? ["/d", "/c", "echo", "Native Shell"] : ["Native Shell"],
          { timeoutMs: 3000 },
        );
        if (props.scene.disposed()) return "Closed";
        const streamed = await new Promise<string>((resolve, reject) => {
          const child = process.spawn(command, args, {
            stdin: "pipe",
            lines: true,
            timeoutMs: 3000,
          });
          const stop = () => child.kill();
          props.scene.release.add(stop);
          let text = `pid: ${child.pid}\n`;
          child.on("stdout", (line) => {
            text += line;
          });
          child.on("stderr", (line) => {
            text += line;
          });
          child.on("exit", (exit) => {
            props.scene.release.delete(stop);
            if (exit.code === 0) resolve(text);
            else reject(new Error(JSON.stringify(exit)));
          });
          child.write("Hello through stdin\n");
          child.end();
        });
        return `run: ${output.code} ${output.stdout}${output.stderr}\nspawn: ${streamed}`;
      }}
    />
  );
}

function Tcp(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="TCP"
      detail={
        platform.os === "web"
          ? "net.connect · browser hosts return an unsupported-operation error"
          : "net.connect · Socket.write/read/close · local echo on 127.0.0.1:9876"
      }
      action={async () => {
        const socket = await net.connect({ host: "127.0.0.1", port: 9876 });
        const close = () => socket.close();
        if (props.scene.disposed()) {
          close();
          return "Closed";
        }
        props.scene.release.add(close);
        const timer = setTimeout(close, 5000);
        try {
          await socket.write("Hello TCP\n");
          const bytes = await socket.read(1024);
          return bytes ? Buffer.from(bytes).toString() : "Peer closed";
        } finally {
          clearTimeout(timer);
          close();
          props.scene.release.delete(close);
        }
      }}
    />
  );
}

function Exit(props: { scene: Scene }) {
  return (
    <Action
      scene={props.scene}
      name="Request host exit"
      detail="process.exit(0) · the showcase denies exit requests, so the demo stays open"
      action={async () => {
        try {
          process.exit(0);
        } catch (error) {
          if (!(error instanceof Error) || !("code" in error) || error.code !== "ERR_ACCESS_DENIED")
            throw error;
          return "Exit request blocked by showcase policy. You can continue exploring.";
        }
        return "Exit requested from the host";
      }}
    />
  );
}

/** Both WebSocket interfaces use the host's real transport. */
function WebSockets() {
  const result = signal("Ready");
  const busy = signal(false);
  const disposed = signal(false);
  // The sockets the run holds open, so leaving the demo closes them.
  const release = signal<(() => void)[]>([]);
  const hold = (close: () => void) => release.set([...release(), close]);
  const drop = (close: () => void) => release.set(release().filter((held) => held !== close));
  cleanup(() => {
    disposed.set(true);
    for (const close of release()) close();
  });

  const run = async () => {
    if (busy() || disposed()) return;
    busy.set(true);
    try {
      const url = "ws://127.0.0.1:9877/";
      const socket = await connect(url);
      const close = () => {
        void socket.close().catch(() => {});
      };
      if (disposed()) {
        close();
        return;
      }
      hold(close);
      const timer = setTimeout(close, 5000);
      let moduleText: string;
      let moduleBytes: string;
      try {
        await socket.write("Hello module");
        moduleText = String(await socket.read());
        await socket.write(new Uint8Array([0, 127, 255]));
        moduleBytes = String(await socket.read());
      } finally {
        clearTimeout(timer);
        drop(close);
        await socket.close();
      }
      if (disposed()) return;

      const global = await new Promise<{ text: string; bytes: string }>((resolve, reject) => {
        const ws = new WebSocket(url);
        ws.binaryType = "arraybuffer";
        let text: string | undefined;
        let settled = false;
        const stop = () => ws.close();
        hold(stop);
        const finish = (error?: Error, bytes?: string) => {
          if (settled) return;
          settled = true;
          clearTimeout(timer);
          drop(stop);
          ws.onopen = null;
          ws.onmessage = null;
          ws.onerror = null;
          ws.onclose = null;
          ws.close(1000, "Demo complete");
          if (error) reject(error);
          else resolve({ text: text ?? "", bytes: bytes ?? "" });
        };
        const timer = setTimeout(() => finish(new Error("WebSocket echo timed out")), 5000);
        ws.onopen = () => ws.send("Hello global");
        ws.onmessage = (event) => {
          if (text === undefined) {
            text = typeof event.data === "string" ? event.data : "[binary]";
            ws.send(new Uint8Array([0, 127, 255]));
          } else finish(undefined, new Uint8Array(event.data as ArrayBuffer).join(","));
        };
        ws.onerror = () => finish(new Error("WebSocket connection failed"));
        ws.onclose = () => finish(new Error("Peer closed before echo"));
      });
      if (!disposed()) {
        result.set(
          `Module: ${moduleText}\nModule bytes: ${moduleBytes}\nGlobal: ${global.text}\nGlobal bytes: ${global.bytes}`,
        );
      }
    } catch (error) {
      if (!disposed()) result.set(String(error));
    } finally {
      if (!disposed()) busy.set(false);
    }
  };

  return (
    <Card
      title="WebSockets"
      subtitle="websocket module and global WebSocket · local echo on 127.0.0.1:9877"
    >
      <Button
        disabled={busy()}
        onPress={() => {
          void run();
        }}
      >
        Run WebSockets
      </Button>
      <View>
        <Text style={[monoText(13), { userSelect: "text" }]}>{result()}</Text>
      </View>
    </Card>
  );
}

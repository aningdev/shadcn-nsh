import { alpha, colors, focusRing, shape } from "@shadcn-nsh/theme";
import {
  Animated,
  cleanup,
  createAnimatedValue,
  Easing,
  Image,
  ScreenEffect,
  Shader,
  ShaderEffect,
  ShaderTransition,
  signal,
  Text,
  token,
  View,
} from "nsh";
import { NavPage } from "nsh/base";

import { Button } from "@/packages/ui/button";
import { Dialog, DialogClose, DialogContent } from "@/packages/ui/dialog";
import { pressSink } from "@/packages/ui/lib/press";
import { createNavStack, NavStack } from "@/packages/ui/nav-stack";
import { Switch } from "@/packages/ui/switch";

import logo from "../assets/logo-dark.svg";
import { Caption, photoUrl, SceneCard, ScenePage } from "./graphics-shared";

const NOISE = /* wgsl */ `
fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1664525u + 1013904223u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = h ^ (h >> 13u);
  return f32(h >> 8u) / 16777216.0;
}
fn noise(p: vec2f) -> f32 {
  let i = floor(p);
  let f = fract(p);
  let u = f * f * (3.0 - 2.0 * f);
  return mix(mix(hash(i), hash(i + vec2f(1.0, 0.0)), u.x),
             mix(hash(i + vec2f(0.0, 1.0)), hash(i + vec2f(1.0, 1.0)), u.x), u.y);
}
fn fbm(p0: vec2f) -> f32 {
  var p = p0;
  var v = 0.0;
  var a = 0.5;
  for (var i = 0; i < 5; i++) {
    v += a * noise(p);
    p = p * 2.03 + vec2f(1.7, 9.2);
    a *= 0.5;
  }
  return v;
}
`;

// A shader panel is artwork: its ground stays near-black and its ink white in both appearances,
// which is the media pair — `colors.media` under `colors.onMedia`.

const GLOW = /* wgsl */ `${NOISE}
struct Uniforms { a: vec4f, b: vec4f, c: vec4f, base: vec4f, pointer: vec2f }
fn orb(p: vec2f, center: vec2f, size: f32) -> f32 {
  let d = p - center;
  return exp(-dot(d, d) / (size * size));
}
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = uv * aspect;
  let t = nsh.time * 0.35;
  var light = vec3f(0.0);
  light += uniforms.a.rgb * orb(p, vec2f(0.3 + 0.15 * sin(t * 0.8), 0.35 + 0.2 * cos(t * 0.6)) * aspect, 0.38) * 1.1;
  light += uniforms.b.rgb * orb(p, vec2f(0.65 + 0.2 * cos(t * 0.5), 0.55 + 0.25 * sin(t * 0.7 + 1.0)) * aspect, 0.45) * 1.2;
  light += uniforms.c.rgb * orb(p, vec2f(0.85 + 0.1 * sin(t * 0.9 + 2.0), 0.25 + 0.15 * cos(t * 0.4)) * aspect, 0.32);
  light += uniforms.b.rgb * orb(p, vec2f(0.15 + 0.1 * cos(t * 0.6 + 3.0), 0.85) * aspect, 0.3) * 0.6;
  light += uniforms.c.rgb * orb(p, uniforms.pointer * aspect, 0.25) * 0.9;
  var color = uniforms.base.rgb + (vec3f(1.0) - exp(-light * 1.4)) * 0.95;
  color += vec3f((hash(uv * nsh.size * nsh.scale) - 0.5) * 0.04);
  return vec4f(color, 1.0);
}`;

const PLASMA = /* wgsl */ `
struct Uniforms { pointer: vec2f, a: vec4f, b: vec4f, c: vec4f }
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = (uv - 0.5) * aspect * 4.0;
  let m = (uniforms.pointer - 0.5) * aspect * 4.0;
  let t = nsh.time * 0.5;
  var v = sin(p.x + t) + sin((p.y + t) * 0.7) + sin((p.x + p.y + t) * 0.6);
  v += sin(length(p - m) * 2.5 - t * 2.0) * 1.2;
  let wave = 0.5 + 0.5 * sin(6.2831853 * (v * 0.18 + vec3f(0.0, 0.33, 0.66)));
  let palette = mix(uniforms.a.rgb, uniforms.b.rgb, wave.x);
  let color = mix(palette, uniforms.c.rgb, wave.z * 0.5);
  let vignette = 1.0 - 0.5 * dot(uv - 0.5, uv - 0.5) * 2.0;
  return vec4f(color * vignette, 1.0);
}`;

const RIPPLE = /* wgsl */ `
fn hash(p: vec2f) -> f32 {
  let q = bitcast<vec2u>(vec2i(floor(p)));
  var h = (q.x * 1597334677u) ^ (q.y * 3812015801u);
  h = h * 1664525u + 1013904223u;
  h = (h ^ (h >> 16u)) * 2246822519u;
  h = h ^ (h >> 13u);
  return f32(h >> 8u) / 16777216.0;
}
struct Uniforms { center: vec2f, wave: f32, tintA: vec4f, tintB: vec4f, head: vec4f, ground: vec4f, speed: f32 }
fn shade(uv: vec2f) -> vec4f {
  let g = uv * nsh.size / vec2f(12.0, 16.0);
  let cell = floor(g);
  let t = nsh.time * uniforms.speed;
  let live = step(0.45, hash(vec2f(cell.x, 3.0)));
  let speed = 3.0 + hash(vec2f(cell.x, 1.0)) * 5.0;
  let head = t * speed + hash(vec2f(cell.x, 2.0)) * 60.0;
  let phase = fract((head - cell.y) / 40.0);
  let trail = pow(clamp(1.0 - phase * 2.5, 0.0, 1.0), 2.0) * live;
  let lead = step(phase, 0.025) * live;
  let tap = floor(uniforms.center * nsh.size / vec2f(12.0, 16.0));
  let d = length((cell - tap) * vec2f(1.0, 1.4));
  let front = uniforms.wave * 14.0;
  let fade = 1.0 - uniforms.wave;
  let ring = step(abs(d - front), 0.8) * fade;
  let inside = step(d, front - 0.8) * step(front - 4.0, d) * fade;
  let rate = 0.8 + hash(cell) * 1.2 + ring * 20.0;
  let id = hash(cell + vec2f(floor(t * rate) * 13.0, 0.0)) * 4096.0;
  let f = (fract(g) - vec2f(0.2, 0.15)) / vec2f(0.6, 0.7);
  let bit = floor(f * vec2f(3.0, 5.0));
  let column = min(bit.x, 2.0 - bit.x);
  let on = step(0.5, hash(vec2f(id + column * 7.0, bit.y * 31.0 + id)))
    * step(0.0, f.x) * step(f.x, 1.0) * step(0.0, f.y) * step(f.y, 1.0);
  let tint = mix(uniforms.tintA.rgb, uniforms.tintB.rgb, uniforms.wave);
  let level = max(trail, inside * 0.5) + ring * 1.2;
  var color = tint * on * level;
  color += uniforms.head.rgb * on * (lead + ring * 0.6);
  color += tint * ring * 0.18;
  color += uniforms.ground.rgb;
  return vec4f(color, 1.0);
}`;

const HOLO = /* wgsl */ `${NOISE}
struct Uniforms { a: vec4f, b: vec4f, c: vec4f, base: vec4f, tilt: f32 }
fn glow(p: vec2f, center: vec2f, size: f32) -> f32 {
  let d = p - center;
  return exp(-dot(d, d) / (size * size));
}
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let p = uv * aspect;
  let px = 1.0 / max(nsh.size.y, 1.0);
  let t = nsh.time * 0.25;
  let shift = uniforms.tilt * 0.12;
  var light = vec3f(0.0);
  light += uniforms.a.rgb * glow(p, vec2f(0.82 + shift + 0.04 * sin(t), 0.2 + 0.06 * cos(t * 0.8)) * aspect, 0.34) * 0.9;
  light += uniforms.b.rgb * glow(p, vec2f(0.62 - shift * 0.5 + 0.05 * cos(t * 0.7), 0.85) * aspect, 0.42) * 0.8;
  light += uniforms.c.rgb * glow(p, vec2f(1.0 + 0.04 * sin(t * 0.6 + 1.0), 0.75) * aspect, 0.3) * 0.7;
  light *= smoothstep(0.0, 0.75, uv.x);
  var color = uniforms.base.rgb + (vec3f(1.0) - exp(-light * 1.3)) * 0.9;
  let cell = fract(p / (8.0 * px)) - 0.5;
  let dots = smoothstep(0.14, 0.06, length(cell));
  color += vec3f(1.0) * dots * (0.015 + 0.06 * length(light));
  let s = uv.x * 0.7 + uv.y * 0.3 - 0.55 - uniforms.tilt * 0.5;
  color += vec3f(exp(-s * s * 30.0) * 0.05);
  color += vec3f((hash(uv * nsh.size * nsh.scale + 7.0) - 0.5) * 0.03);
  return vec4f(color, 1.0);
}`;

const PIXELATE = /* wgsl */ `
fn shade(uv: vec2f) -> vec4f {
  let cell = max(nsh.progress * 14.0, 1.0 / nsh.scale) / nsh.size;
  return sample_content(min((floor(uv / cell) + 0.5) * cell, vec2f(0.999)));
}`;

const WIPE = /* wgsl */ `
fn shade(uv: vec2f) -> vec4f {
  let edge = nsh.progress * 1.4 - 0.2;
  let t = smoothstep(edge - 0.2, edge + 0.2, (uv.x + uv.y) * 0.5);
  return mix(sample_to(uv), sample_from(uv), t);
}`;

const IRIS = /* wgsl */ `
fn shade(uv: vec2f) -> vec4f {
  let aspect = vec2f(nsh.size.x / max(nsh.size.y, 1.0), 1.0);
  let d = length((uv - 0.5) * aspect);
  let t = smoothstep(nsh.progress * 1.2 - 0.04, nsh.progress * 1.2, d);
  return mix(sample_to(uv), sample_from(uv), t);
}`;

const DUOTONE = /* wgsl */ `
struct Uniforms { a: vec4f, b: vec4f }
fn shade(uv: vec2f) -> vec4f {
  let c = sample_content(uv);
  let l = dot(c.rgb, vec3f(0.299, 0.587, 0.114));
  let ink = mix(uniforms.a.rgb, uniforms.b.rgb, l);
  let vignette = 1.0 - 0.6 * dot(uv - 0.5, uv - 0.5);
  return vec4f(ink * vignette, c.a);
}`;

function drag(onMove: (x: number, y: number) => void) {
  const size = signal({ width: 1, height: 1 });
  const at = (event: { locationX: number; locationY: number }) =>
    onMove(
      Math.min(Math.max(event.locationX / size().width, 0), 1),
      Math.min(Math.max(event.locationY / size().height, 0), 1),
    );
  return {
    onLayout: ({ bounds }: { bounds: { size: { width: number; height: number } } }) => {
      size.set(bounds.size);
    },
    onStartShouldSetResponder: () => true,
    onResponderTerminationRequest: () => false,
    onResponderGrant: (event: { locationX: number; locationY: number }) => {
      at(event);
      return true;
    },
    onResponderMove: at,
  };
}

function Glow() {
  const x = createAnimatedValue(0.5);
  const y = createAnimatedValue(0.5);
  const follow = (px: number, py: number) => {
    x.set(px);
    y.set(py);
  };
  return (
    <SceneCard title="Glow" subtitle="Soft orbs of light that blend">
      <View style={{ gap: 12 }}>
        <Shader
          source={GLOW}
          uniforms={{
            a: colors.destructive,
            b: token("violet"),
            c: colors.info,
            base: colors.media,
            pointer: [x, y],
          }}
          style={{ height: 200, borderRadius: 14 }}
          {...drag(follow)}
        />
        <Caption label="Drag to lead a blue orb; the light rolls off as it adds up." />
      </View>
    </SceneCard>
  );
}

function Plasma() {
  const x = createAnimatedValue(0.5);
  const y = createAnimatedValue(0.5);
  return (
    <SceneCard title="Plasma" subtitle="Sums of sines through a cosine palette">
      <View style={{ gap: 10 }}>
        <Shader
          source={PLASMA}
          uniforms={{ pointer: [x, y], a: colors.info, b: token("violet"), c: colors.warn }}
          style={{ height: 200, borderRadius: 14 }}
          {...drag((px, py) => {
            x.set(px);
            y.set(py);
          })}
        />
        <Caption label="Drag across it: the pointer is a second wave source." />
      </View>
    </SceneCard>
  );
}

function Ripple() {
  const speed = signal(1);
  const wave = createAnimatedValue(0);
  const center = { x: createAnimatedValue(0.5), y: createAnimatedValue(0.5) };
  const loop = Animated.loop(
    Animated.timing(wave, { toValue: 1, duration: 2200, easing: Easing.out(Easing.quad) }),
  );
  void loop.start();
  cleanup(() => loop.stop());
  const fire = (x: number, y: number) => {
    loop.stop();
    center.x.set(x);
    center.y.set(y);
    wave.set(0);
    void loop.start();
  };
  const size = signal({ width: 1, height: 1 });
  return (
    <SceneCard title="Code rain" subtitle="Animated values as uniforms">
      <View style={{ gap: 10 }}>
        <Shader
          source={RIPPLE}
          uniforms={{
            center: [center.x, center.y],
            wave,
            tintA: colors.up,
            tintB: colors.brand,
            head: colors.onMedia,
            ground: colors.media,
            speed: speed(),
          }}
          style={{ height: 200, borderRadius: 14, padding: 16, justifyContent: "flex-end" }}
          onLayout={({ bounds }) => {
            size.set(bounds.size);
          }}
          onStartShouldSetResponder={() => true}
          onResponderGrant={(event) =>
            fire(event.locationX / size().width, event.locationY / size().height)
          }
        >
          <View
            style={{
              flexDirection: "row",
              alignItems: "center",
              alignSelf: "flex-start",
              paddingHorizontal: 6,
              paddingVertical: 4,
              borderRadius: 2,
              borderWidth: 1,
              borderColor: alpha(colors.up, 0.5),
              backgroundColor: alpha(colors.media, 0.85),
            }}
            onStartShouldSetResponder={() => true}
            onResponderTerminationRequest={() => false}
          >
            <Each of={[1, 2, 4]}>
              {(value) => (
                <View
                  onPress={() => speed.set(value())}
                  role="button"
                  accessibilityLabel={`${value()}×`}
                  accessibilityState={{ selected: speed() === value() }}
                  hoverStyle={{ opacity: 0.86 }}
                  activeStyle={pressSink().activeStyle}
                  focusVisibleStyle={focusRing()}
                  style={{ paddingHorizontal: 6, paddingVertical: 2 }}
                >
                  <Text
                    style={{
                      color: speed() === value() ? colors.onMedia : colors.up,
                      fontFamily: "monospace",
                      fontSize: 12,
                      fontWeight: speed() === value() ? "700" : "400",
                      opacity: speed() === value() ? 1 : 0.7,
                    }}
                  >
                    {`${value()}×`}
                  </Text>
                </View>
              )}
            </Each>
          </View>
        </Shader>
        <Caption label="Tap the rain to send a wave; pick how fast it falls." />
      </View>
    </SceneCard>
  );
}

function Holo() {
  const tilt = createAnimatedValue(0);
  const loop = Animated.loop(
    Animated.sequence([
      Animated.timing(tilt, { toValue: 1, duration: 2600, easing: Easing.inOut(Easing.sin) }),
      Animated.timing(tilt, { toValue: -1, duration: 2600, easing: Easing.inOut(Easing.sin) }),
    ]),
  );
  void loop.start();
  cleanup(() => loop.stop());
  const sweep = () => {
    loop.stop();
    tilt.set(-1);
    void Animated.timing(tilt, {
      toValue: 1,
      duration: 1200,
      easing: Easing.inOut(Easing.cubic),
    }).start();
  };
  return (
    <SceneCard title="Hero banner" subtitle="Children drawn over the shader">
      <View style={{ gap: 10 }}>
        <Shader
          source={HOLO}
          uniforms={{
            a: colors.brand,
            b: colors.up,
            c: colors.info,
            base: colors.media,
            tilt,
          }}
          style={{
            height: 200,
            borderRadius: 14,
            paddingHorizontal: 20,
            paddingVertical: 16,
            justifyContent: "space-between",
          }}
          {...drag((x) => {
            loop.stop();
            tilt.set(x * 2 - 1);
          })}
        >
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            <Image src={logo} style={{ width: 26, height: 26 }} />
            <Text style={{ flex: 1, color: colors.onMedia, fontSize: 15, fontWeight: "700" }}>
              Native Shell
            </Text>
            <View
              style={{
                flexDirection: "row",
                alignItems: "center",
                gap: 6,
                paddingHorizontal: 9,
                paddingVertical: 4,
                borderRadius: 999,
                borderWidth: 0.5,
                borderColor: alpha(colors.brand, 0.3),
                backgroundColor: alpha(colors.brand, 0.1),
              }}
            >
              <View
                style={{
                  width: 5,
                  height: 5,
                  borderRadius: 999,
                  backgroundColor: colors.brand,
                  boxShadow: `0 0 6px ${alpha(colors.brand, 0.8)}`,
                }}
              />
              <Text
                style={{
                  color: colors.brand,
                  fontSize: 10,
                  fontWeight: "600",
                  letterSpacing: 1.2,
                }}
              >
                SHADERS
              </Text>
            </View>
          </View>
          <View style={{ gap: 12 }}>
            <View style={{ gap: 4 }}>
              <Text style={{ color: colors.onMedia, fontSize: 20, fontWeight: "700" }}>
                Native UI, delivered at run time
              </Text>
              <Text style={{ color: colors.onMedia, fontSize: 13, opacity: 0.65 }}>
                Light swept by a looping animated uniform
              </Text>
            </View>
            <View style={{ flexDirection: "row", gap: 8 }}>
              <Button size="sm" onPress={sweep}>
                Sweep light
              </Button>
              <Button size="sm" variant="secondary" onPress={() => loop.start()}>
                Loop
              </Button>
            </View>
          </View>
        </Shader>
        <Caption label="Drag sideways to move the light; the buttons sit over the shader." />
      </View>
    </SceneCard>
  );
}

function Tile(props: { title: string; note: string; photo: string }) {
  return (
    <View style={{ flex: 1, borderRadius: 14, overflow: "hidden", backgroundColor: colors.media }}>
      <Image
        src={props.photo}
        style={{ position: "absolute", top: 0, start: 0, end: 0, bottom: 0, objectFit: "cover" }}
      />
      <View
        style={{
          flex: 1,
          padding: 16,
          justifyContent: "flex-end",
          gap: 2,
          backgroundImage: `linear-gradient(180deg, transparent 55%, ${token("scrim")} 100%)`,
        }}
      >
        <Text style={{ color: colors.onMedia, fontSize: 17, fontWeight: "600" }}>
          {props.title}
        </Text>
        <Text style={{ color: colors.onMedia, fontSize: 13, opacity: 0.82 }}>{props.note}</Text>
      </View>
    </View>
  );
}

function Effect() {
  const progress = createAnimatedValue(0);
  const to = (value: number) =>
    Animated.timing(progress, {
      toValue: value,
      duration: 600,
      easing: Easing.inOut(Easing.cubic),
    }).start();
  return (
    <SceneCard title="Shader effect" subtitle="Children drawn through a shader">
      <View style={{ gap: 10 }}>
        <ShaderEffect
          source={PIXELATE}
          progress={progress}
          style={{ height: 160 }}
          {...drag((x) => progress.set(x))}
        >
          <Tile
            title="Pixelated"
            note="sample_content reads what the children draw"
            photo={photoUrl("arc")}
          />
        </ShaderEffect>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button style={{ flex: 1 }} size="sm" variant="secondary" onPress={() => to(1)}>
            Pixelate
          </Button>
          <Button style={{ flex: 1 }} size="sm" variant="secondary" onPress={() => to(0)}>
            Sharpen
          </Button>
        </View>
        <Caption label="Drag across it to set nsh.progress; the buttons animate it." />
      </View>
    </SceneCard>
  );
}

const SLIDES = [
  { title: "Morning", note: "A wipe from the top left", photo: photoUrl("sunrise") },
  { title: "Noon", note: "sample_from: what showed", photo: photoUrl("day") },
  { title: "Night", note: "sample_to: what shows now", photo: photoUrl("rollout") },
] as const;

function Transition() {
  const index = signal(0);
  const slide = () => SLIDES[index()];
  return (
    <SceneCard title="Shader transition" subtitle="A change drawn through a shader">
      <View style={{ gap: 10 }}>
        <ShaderTransition source={WIPE} value={index()} duration={700} style={{ height: 160 }}>
          <Tile title={slide().title} note={slide().note} photo={slide().photo} />
        </ShaderTransition>
        <Button
          size="sm"
          variant="secondary"
          onPress={() => index.set((index() + 1) % SLIDES.length)}
        >
          Next
        </Button>
        <Caption label="Each change wipes from the old picture to the new one." />
      </View>
    </SceneCard>
  );
}

function Screen() {
  const on = signal(false);
  return (
    <SceneCard title="Screen effect" subtitle="The whole surface through a shader">
      <View style={{ gap: 10 }}>
        <If when={on()}>
          <ScreenEffect source={DUOTONE} uniforms={{ a: token("violet"), b: colors.warn }} />
        </If>
        <Switch
          checked={on()}
          onChange={({ checked }) => on.set(checked)}
          class="flex-row items-center gap-2"
        >
          <Text style={{ fontSize: 13, color: colors.foreground }}>Duotone</Text>
        </Switch>
        <Caption label="A ScreenEffect draws everything, dialogs included, in two inks." />
      </View>
    </SceneCard>
  );
}

type PageRoute = "Home" | "Iris";
const pages = createNavStack<PageRoute>(["Home"]);

function Pages() {
  const open = signal(false);
  const renderPage = (route: PageRoute) =>
    route === "Iris" ? (
      <NavPage title="Iris" transitionShader={{ source: IRIS, duration: 600 }}>
        <View style={{ flex: 1, padding: 24, gap: 16, backgroundColor: colors.background }}>
          <Tile
            title="Iris"
            note="This page came, and goes, through transitionShader"
            photo={photoUrl("moon")}
          />
          <Button size="sm" onPress={() => pages.pop()}>
            Leave the page
          </Button>
        </View>
      </NavPage>
    ) : (
      <NavPage title="Home">
        <View
          style={{
            flex: 1,
            alignItems: "center",
            justifyContent: "center",
            backgroundColor: colors.background,
          }}
        >
          <Text style={{ fontSize: 13, color: colors.mutedForeground }}>
            The iris pages open over this stack
          </Text>
        </View>
      </NavPage>
    );
  return (
    <SceneCard title="Pages and dialogs" subtitle="transitionShader">
      <View style={{ gap: 10 }}>
        <View style={{ flexDirection: "row", gap: 8 }}>
          <Button style={{ flex: 1 }} size="sm" onPress={() => pages.push("Iris")}>
            Push a page
          </Button>
          <Button style={{ flex: 1 }} size="sm" variant="secondary" onPress={() => open.set(true)}>
            Open a dialog
          </Button>
        </View>
        <Caption label="They come and go through an iris instead of the platform's animation." />
        {/* The showcase's own stack belongs to the shell, so the iris plays inside this frame. */}
        <NavStack
          state={pages}
          style={{
            height: 260,
            borderRadius: shape.card,
            borderWidth: 1,
            borderColor: colors.line,
            overflow: "hidden",
          }}
        >
          {renderPage}
        </NavStack>
        <Dialog open={open()} onOpenChange={({ open: next }) => open.set(next)}>
          <DialogContent
            width={300}
            scroll={false}
            transitionShader={{ source: IRIS, duration: 600 }}
          >
            <View style={{ height: 200, gap: 12 }}>
              <Tile title="Dialog" note="Presented through the iris" photo={photoUrl("liftoff")} />
              <DialogClose>Close</DialogClose>
            </View>
          </DialogContent>
        </Dialog>
      </View>
    </SceneCard>
  );
}

const cards = [Glow, Ripple, Holo, Plasma, Effect, Transition, Screen, Pages];

export function ShaderDemo() {
  return (
    <ScenePage
      detail="WGSL shaders on the GPU: noise, gradients, animated uniforms"
      max={2}
      cards={cards}
    />
  );
}

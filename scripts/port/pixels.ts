/**
 * The pixel comparison a `tolerance` case gets: how many pixels of two pictures differ, and by
 * how much.
 *
 * The render checks keep their pictures as PNG bytes, and the check itself compares them byte for
 * byte. A photograph inside a circular clip does not hold still to that: the web rasterizer draws
 * the clip's antialiased edge a level (1/255) apart between two page instances. The page then
 * names a tolerance (`render-cases.ts`) and `scripts/port/render.ts` compares the pair here,
 * where a PNG decoder is at hand (`node:zlib`): at most `pixels` pixels, each channel within
 * `delta` levels. Everything else fails exactly as before, so a moved edge, a wrong color or a
 * missing row is still a difference.
 */

import { inflateSync } from "node:zlib";

/**
 * A decoded picture: `channels` samples per pixel (3 RGB or 4 RGBA), rows top to bottom, each
 * sample 0-255. A 16-bit PNG (the iOS simulator's screenshots) is read and scaled down to that
 * range: the budget is 1/255-class noise, which is below what a 16-bit sample's low byte says.
 */
export type Picture = { width: number; height: number; channels: number; data: Uint8Array };

const u32 = (bytes: Uint8Array, at: number) =>
  ((bytes[at]! << 24) | (bytes[at + 1]! << 16) | (bytes[at + 2]! << 8) | bytes[at + 3]!) >>> 0;

/** Decodes a non-interlaced, 8-bit PNG (RGB or RGBA; what the screenshots are). */
export function decodePng(bytes: Uint8Array): Picture {
  if (bytes.length < 8 || bytes[0] !== 0x89 || bytes[1] !== 0x50 || bytes[2] !== 0x4e) {
    throw new Error("not a PNG");
  }
  let at = 8;
  let width = 0;
  let height = 0;
  let bitDepth = 0;
  let colorType = 0;
  let interlace = 0;
  const idat: Uint8Array[] = [];
  while (at + 8 <= bytes.length) {
    const length = u32(bytes, at);
    const type = String.fromCharCode(
      bytes[at + 4]!,
      bytes[at + 5]!,
      bytes[at + 6]!,
      bytes[at + 7]!,
    );
    const data = bytes.subarray(at + 8, at + 8 + length);
    at += 12 + length;
    if (type === "IHDR") {
      width = u32(data, 0);
      height = u32(data, 4);
      bitDepth = data[8]!;
      colorType = data[9]!;
      interlace = data[12]!;
    } else if (type === "IDAT") {
      idat.push(data);
    } else if (type === "IEND") {
      break;
    }
  }
  const channels = colorType === 6 ? 4 : colorType === 2 ? 3 : 0;
  if ((bitDepth !== 8 && bitDepth !== 16) || interlace !== 0 || channels === 0) {
    throw new Error(
      `unsupported PNG: ${bitDepth}-bit, color type ${colorType}, interlace ${interlace}`,
    );
  }
  if (width === 0 || height === 0) throw new Error("empty PNG");
  const raw = inflateSync(Buffer.concat(idat.map((chunk) => Buffer.from(chunk))));
  const sample = bitDepth === 16 ? 2 : 1;
  const stride = width * channels * sample;
  const data = new Uint8Array(height * stride);
  let pos = 0;
  for (let y = 0; y < height; y += 1) {
    const filter = raw[pos++]!;
    const row = data.subarray(y * stride, (y + 1) * stride);
    const prior = y > 0 ? data.subarray((y - 1) * stride, y * stride) : null;
    const bytesPerPixel = channels * sample;
    for (let x = 0; x < stride; x += 1) {
      const left = x >= bytesPerPixel ? row[x - bytesPerPixel]! : 0;
      const up = prior ? prior[x]! : 0;
      const upLeft = prior && x >= bytesPerPixel ? prior[x - bytesPerPixel]! : 0;
      let value = raw[pos + x]!;
      if (filter === 1) value += left;
      else if (filter === 2) value += up;
      else if (filter === 3) value += (left + up) >> 1;
      else if (filter === 4) {
        const p = left + up - upLeft;
        const pa = Math.abs(p - left);
        const pb = Math.abs(p - up);
        const pc = Math.abs(p - upLeft);
        value += pa <= pb && pa <= pc ? left : pb <= pc ? up : upLeft;
      } else if (filter !== 0) {
        throw new Error(`PNG filter ${filter}`);
      }
      row[x] = value & 0xff;
    }
    pos += stride;
  }
  if (sample === 1) return { width, height, channels, data };
  // 16 bits a sample: keep the high byte of each, which is the 8-bit value it rounds to.
  const down = new Uint8Array(width * height * channels);
  for (let pixel = 0; pixel < width * height; pixel += 1) {
    for (let c = 0; c < channels; c += 1) {
      const at = (pixel * channels + c) * 2;
      down[pixel * channels + c] = data[at]!;
    }
  }
  return { width, height, channels, data: down };
}

/** How two pictures differ: the pixels outside `delta` and the worst channel difference. */
export type Difference = { over: number; worst: number };

export function difference(a: Picture, b: Picture, delta: number): Difference {
  if (a.width !== b.width || a.height !== b.height) {
    return { over: Number.POSITIVE_INFINITY, worst: 255 };
  }
  // The color channels both pictures have (a screenshot is RGBA today; RGB compares the same).
  const channels = Math.min(a.channels, b.channels);
  let over = 0;
  let worst = 0;
  for (let pixel = 0; pixel < a.width * a.height; pixel += 1) {
    let moved = 0;
    for (let c = 0; c < channels; c += 1) {
      const d = Math.abs(a.data[pixel * a.channels + c]! - b.data[pixel * b.channels + c]!);
      if (d > moved) moved = d;
    }
    if (moved > worst) worst = moved;
    if (moved > delta) over += 1;
  }
  return { over, worst };
}

/** How a pair within `tolerance` reads: its worst pixel, and how many went past `delta`. */
export function compareWithinTolerance(
  ours: Uint8Array,
  theirs: Uint8Array,
  tolerance: { pixels: number; delta: number },
): { ok: boolean; report: string } {
  const a = decodePng(ours);
  const b = decodePng(theirs);
  const { over, worst } = difference(a, b, tolerance.delta);
  if (a.width !== b.width || a.height !== b.height) {
    return {
      ok: false,
      report: `${a.width}×${a.height} vs ${b.width}×${b.height}`,
    };
  }
  return {
    ok: over <= tolerance.pixels,
    report: `${over} pixels over ${tolerance.delta}/255 (worst ${worst}/255; allowed ${tolerance.pixels})`,
  };
}

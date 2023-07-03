import { byteLength } from "../internal/util.ts";

/**
 * A type indicating how positions are encoded,
 * specifically what column offsets mean.
 * @link https://microsoft.github.io/language-server-protocol/specifications/specification-current/#positionEncodingKind
 */
export type OffsetEncoding = UTF8 | UTF16 | UTF32;

/**
 * Character offsets count UTF-8 code units (e.g bytes).
 */
type UTF8 = "utf-8";

/**
 * Character offsets count UTF-16 code units.
 *
 * This is the default and must always be supported by servers
 */
type UTF16 = "utf-16";

/**
 * Character offsets count UTF-32 code units.
 *
 * Implementation note: these are the same as Unicode code points,
 * so this `PositionEncodingKind` may also be used for an
 * encoding-agnostic representation of character offsets.
 */
type UTF32 = "utf-32";

export function toUtf8Index(
  line: string,
  utfIndex: number,
  offsetEncoding: OffsetEncoding = "utf-16",
): number {
  if (offsetEncoding === "utf-8") {
    return utfIndex;
  }
  const utf16Index = toUtf16Index(line, utfIndex, offsetEncoding);
  return byteLength(line.slice(0, utf16Index));
}

export function toUtf16Index(
  line: string,
  utfIndex: number,
  offsetEncoding: OffsetEncoding = "utf-16",
): number {
  if (offsetEncoding === "utf-16") {
    return utfIndex;
  } else if (offsetEncoding === "utf-8") {
    return sliceByByteIndex(line, 0, utfIndex).length;
  } else if (offsetEncoding === "utf-32") {
    return [...line].slice(0, utfIndex).join("").length;
  } else {
    offsetEncoding satisfies never;
    throw new Error(`Invalid offset encoding: ${offsetEncoding}`);
  }
}

export function toUtf32Index(
  line: string,
  utfIndex: number,
  offsetEncoding: OffsetEncoding = "utf-16",
): number {
  if (offsetEncoding === "utf-32") {
    return utfIndex;
  }
  const utf16Index = toUtf16Index(line, utfIndex, offsetEncoding);
  return [...line.slice(0, utf16Index)].length;
}

const ENCODER = new TextEncoder();
const DECODER = new TextDecoder();
function sliceByByteIndex(
  s: string,
  start?: number,
  end?: number,
): string {
  const bytes = ENCODER.encode(s);
  const slicedBytes = bytes.slice(start, end);
  return DECODER.decode(slicedBytes);
}

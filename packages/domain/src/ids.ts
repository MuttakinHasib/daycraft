// Ids per ADR-0007: UUID v7 for rows a person creates, UUID v5 for rows with a natural key.
// The caller supplies random bytes, so this package stays free of platform APIs.

const HEX = Array.from({ length: 256 }, (_, byte) => byte.toString(16).padStart(2, '0'));

/** The fixed namespace for Daycraft's v5 ids. Changing it would change every derived id. */
export const DAYCRAFT_NAMESPACE = '6f1b6c2e-9d4a-4c1e-8f3b-2a7d5e0c9b41';

function format(bytes: Uint8Array): string {
  const hex = Array.from(bytes, (byte) => HEX[byte]).join('');
  return `${hex.slice(0, 8)}-${hex.slice(8, 12)}-${hex.slice(12, 16)}-${hex.slice(16, 20)}-${hex.slice(20, 32)}`;
}

function parse(uuid: string): Uint8Array {
  const hex = uuid.replaceAll('-', '');
  if (!/^[0-9a-f]{32}$/i.test(hex)) throw new Error(`Not a UUID: ${uuid}`);
  return Uint8Array.from({ length: 16 }, (_, index) => parseInt(hex.slice(index * 2, index * 2 + 2), 16));
}

/**
 * A UUID v7: 48 bits of Unix milliseconds, then random bits. Ids made in later milliseconds sort after earlier ones.
 * `randomBytes` must hold at least 10 bytes.
 */
export function uuidV7(randomBytes: Uint8Array, unixMs: number): string {
  if (randomBytes.length < 10) throw new Error('uuidV7 needs at least 10 random bytes');
  const bytes = new Uint8Array(16);
  let time = Math.floor(unixMs);
  for (let index = 5; index >= 0; index--) {
    bytes[index] = time % 256;
    time = Math.floor(time / 256);
  }
  bytes.set(randomBytes.subarray(0, 10), 6);
  bytes[6] = 0x70 | ((bytes[6] ?? 0) & 0x0f);
  bytes[8] = 0x80 | ((bytes[8] ?? 0) & 0x3f);
  return format(bytes);
}

/** A UUID v5: the same namespace and name always give the same id. */
export function uuidV5(namespace: string, name: string): string {
  const input = new Uint8Array([...parse(namespace), ...utf8(name)]);
  const hash = sha1(input).subarray(0, 16);
  hash[6] = 0x50 | ((hash[6] ?? 0) & 0x0f);
  hash[8] = 0x80 | ((hash[8] ?? 0) & 0x3f);
  return format(hash);
}

function utf8(text: string): number[] {
  const out: number[] = [];
  for (const char of text) {
    const code = char.codePointAt(0) ?? 0;
    if (code < 0x80) out.push(code);
    else if (code < 0x800) out.push(0xc0 | (code >> 6), 0x80 | (code & 0x3f));
    else if (code < 0x10000) out.push(0xe0 | (code >> 12), 0x80 | ((code >> 6) & 0x3f), 0x80 | (code & 0x3f));
    else
      out.push(
        0xf0 | (code >> 18),
        0x80 | ((code >> 12) & 0x3f),
        0x80 | ((code >> 6) & 0x3f),
        0x80 | (code & 0x3f),
      );
  }
  return out;
}

function rotl(value: number, bits: number): number {
  return (value << bits) | (value >>> (32 - bits));
}

/** SHA-1 (FIPS 180-4). Used only to derive v5 ids, never for security. */
function sha1(message: Uint8Array): Uint8Array {
  const bitLength = message.length * 8;
  const paddedLength = Math.ceil((message.length + 9) / 64) * 64;
  const data = new Uint8Array(paddedLength);
  data.set(message);
  data[message.length] = 0x80;
  const view = new DataView(data.buffer);
  view.setUint32(paddedLength - 8, Math.floor(bitLength / 2 ** 32));
  view.setUint32(paddedLength - 4, bitLength >>> 0);

  let h0 = 0x67452301;
  let h1 = 0xefcdab89;
  let h2 = 0x98badcfe;
  let h3 = 0x10325476;
  let h4 = 0xc3d2e1f0;
  const words = new Uint32Array(80);

  for (let offset = 0; offset < paddedLength; offset += 64) {
    for (let index = 0; index < 16; index++) words[index] = view.getUint32(offset + index * 4);
    for (let index = 16; index < 80; index++) {
      words[index] = rotl(
        (words[index - 3] ?? 0) ^ (words[index - 8] ?? 0) ^ (words[index - 14] ?? 0) ^ (words[index - 16] ?? 0),
        1,
      );
    }
    let a = h0;
    let b = h1;
    let c = h2;
    let d = h3;
    let e = h4;
    for (let index = 0; index < 80; index++) {
      let f: number;
      let k: number;
      if (index < 20) {
        f = (b & c) | (~b & d);
        k = 0x5a827999;
      } else if (index < 40) {
        f = b ^ c ^ d;
        k = 0x6ed9eba1;
      } else if (index < 60) {
        f = (b & c) | (b & d) | (c & d);
        k = 0x8f1bbcdc;
      } else {
        f = b ^ c ^ d;
        k = 0xca62c1d6;
      }
      const next = (rotl(a, 5) + f + e + k + (words[index] ?? 0)) >>> 0;
      e = d;
      d = c;
      c = rotl(b, 30) >>> 0;
      b = a;
      a = next;
    }
    h0 = (h0 + a) >>> 0;
    h1 = (h1 + b) >>> 0;
    h2 = (h2 + c) >>> 0;
    h3 = (h3 + d) >>> 0;
    h4 = (h4 + e) >>> 0;
  }

  const out = new Uint8Array(20);
  const outView = new DataView(out.buffer);
  [h0, h1, h2, h3, h4].forEach((word, index) => outView.setUint32(index * 4, word));
  return out;
}

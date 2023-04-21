/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import * as CryptoJs from "crypto-js";
import { ValueOf } from "./helper";

const { pad, enc, MD5, SHA1, SHA224, SHA256, SHA384, SHA512, SHA3, RIPEMD160 } =
  CryptoJs;
const { Pkcs7 } = pad;
const { Utf8, Hex } = enc;

type Padding = ValueOf<typeof CryptoJs.pad>;

export type PaddingObject = {
  name: string;
  op: Padding;
  pad?: (data: CryptoJs.lib.WordArray) => void;
  unpad?: (data: CryptoJs.lib.WordArray) => void;
};

type PaddingList = {
  AUTO: PaddingObject;
  PKCS7: PaddingObject;
  NONE: PaddingObject;
};

const Padding: PaddingList = {
  AUTO: {
    name: "auto",
    op: Pkcs7,
    pad: (data) => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  PKCS7: {
    name: "pkcs7",
    op: pad.Pkcs7,
    pad: (data) => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  NONE: {
    name: "none",
    op: pad.NoPadding,
  },
};

type IterableObject = Uint8Array | Buffer | Array<any>;

type DecodeFunction = (
  uint8ArrayOrBufferOrArray: IterableObject
) => CryptoJs.lib.WordArray;

type EncodeFunction = (wordArray: CryptoJs.lib.WordArray) => Uint8Array;

type UINT8Object = {
  decode: DecodeFunction;
  encode: EncodeFunction;
};

const Uint8: UINT8Object = {
  decode: (uint8ArrayOrBufferOrArray) => {
    let uint8Array = uint8ArrayOrBufferOrArray;
    if (Buffer.isBuffer(uint8ArrayOrBufferOrArray)) {
      const buffer = uint8ArrayOrBufferOrArray;
      uint8Array = new Uint8Array(buffer.length);
      for (let i = 0; i < buffer.length; i += 1) {
        uint8Array[i] = buffer[i];
      }
    } else if (uint8ArrayOrBufferOrArray instanceof Array) {
      uint8Array = Uint8Array.from(uint8ArrayOrBufferOrArray);
    }

    return CryptoJs.lib.WordArray.create(uint8Array as any);
  },
  encode: (wordArray) => {
    const { words, sigBytes } = wordArray;
    const uint8Array = new Uint8Array(sigBytes);
    let offset = 0;
    let word: number;
    for (let i = 0; i < words.length; i += 1) {
      word = words[i];
      uint8Array[offset++] = word >> 24;
      uint8Array[offset++] = (word >> 16) & 0xff;
      uint8Array[offset++] = (word >> 8) & 0xff;
      uint8Array[offset++] = word & 0xff;
    }
    return uint8Array;
  },
};

export type EncodingObject = {
  name: string;
  decode: (str: string | IterableObject) => CryptoJs.lib.WordArray;
  encode: (wordArray: CryptoJs.lib.WordArray) => string | Uint8Array;
};

type EncodingList = {
  UTF8: EncodingObject;
  HEX: EncodingObject;
  UINT8: EncodingObject;
  BUFFER: EncodingObject;
};

const Encoding: EncodingList = {
  UTF8: {
    name: "utf8",
    decode: Utf8.parse,
    encode: Utf8.stringify,
  },
  HEX: {
    name: "hex",
    decode: Hex.parse,
    encode: Hex.stringify,
  },
  UINT8: {
    name: "uint8",
    decode: Uint8.decode,
    encode: Uint8.encode,
  },
  BUFFER: {
    name: "buffer",
    decode: (data) => Uint8.decode([...data]),
    encode: (data) => Buffer.from(Uint8.encode(data)),
  },
};

const prepareHash = (any: any) => {
  if (Buffer.isBuffer(any)) {
    return Encoding.BUFFER.decode(any);
  }
  if (any instanceof Uint8Array || any instanceof Array) {
    return Encoding.UINT8.decode(any);
  }
  return any;
};

type HashFunction = (
  any: any,
  encoding?: EncodingObject
) => string | Uint8Array | Buffer;

type HashList = {
  md5: HashFunction;
  sha1: HashFunction;
  sha224: HashFunction;
  sha256: HashFunction;
  sha384: HashFunction;
  sha512: HashFunction;
  sha3: (
    any: any,
    size: number,
    encoding?: EncodingObject
  ) => ReturnType<HashFunction>;
  ripemd160: HashFunction;
};

const Hash: HashList = {
  md5: (any, encoding = Encoding.HEX) => encoding.encode(MD5(prepareHash(any))),
  sha1: (any, encoding = Encoding.HEX) =>
    encoding.encode(SHA1(prepareHash(any))),
  sha224: (any, encoding = Encoding.HEX) =>
    encoding.encode(SHA224(prepareHash(any))),
  sha256: (any, encoding = Encoding.HEX) =>
    encoding.encode(SHA256(prepareHash(any))),
  sha384: (any, encoding = Encoding.HEX) =>
    encoding.encode(SHA384(prepareHash(any))),
  sha512: (any, encoding = Encoding.HEX) =>
    encoding.encode(SHA512(prepareHash(any))),
  sha3: (any, size = 512, encoding = Encoding.HEX) =>
    encoding.encode(SHA3(prepareHash(any), { outputLength: size })),
  ripemd160: (any, encoding = Encoding.HEX) =>
    encoding.encode(RIPEMD160(prepareHash(any))),
};

export { Padding, Encoding, Hash };

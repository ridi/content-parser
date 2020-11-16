import * as CryptoJs from 'crypto-js';

const {
  pad, enc, SHA224, SHA256, SHA384, SHA512, SHA3, RIPEMD160,
} = CryptoJs;
const { Pkcs7 } = pad;
const { Utf8, Hex } = enc;

interface IPadding {
  pad(data: CryptoJS.lib.WordArray, blockSize: number): void;
  unpad(data: CryptoJS.lib.WordArray): void;
}

export interface PaddingObject {
  name: string;
  op: IPadding;
  pad: ((data: CryptoJS.lib.WordArray) => void);
  unpad: ((data: CryptoJS.lib.WordArray) => void);
}

interface Paddings {
  readonly AUTO: PaddingObject;
  readonly PKCS7: PaddingObject;
  readonly NONE: Pick<PaddingObject, 'name' | 'op'>;
}

const Padding: Paddings = {
  AUTO: {
    name: 'auto',
    op: Pkcs7,
    pad: (data: CryptoJS.lib.WordArray): void => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  PKCS7: {
    name: 'pkcs7',
    op: pad.Pkcs7,
    pad: (data: CryptoJS.lib.WordArray): void => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  NONE: {
    name: 'none',
    op: pad.NoPadding,
  },
};

const Uint8 = {
  decode: (uint8ArrayOrBufferOrArray: Uint8Array | Buffer | Array<number>) => {
    let uint8Array: Uint8Array;
    if (Buffer.isBuffer(uint8ArrayOrBufferOrArray)) {
      const buffer = uint8ArrayOrBufferOrArray;
      uint8Array = new Uint8Array(buffer.length);
      for (let i = 0; i < buffer.length; i += 1) {
        uint8Array[i] = buffer[i];
      }
    } else if (uint8ArrayOrBufferOrArray instanceof Array) {
      uint8Array = Uint8Array.from(uint8ArrayOrBufferOrArray);
    } else {
      uint8Array = uint8ArrayOrBufferOrArray;
    }
    return CryptoJs.lib.WordArray.create(Array(...uint8Array));
  },
  encode: (wordArray: CryptoJs.lib.WordArray) => {
    const { words, sigBytes } = wordArray;
    const uint8Array = new Uint8Array(sigBytes);
    let offset = 0;
    let word;
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

interface EncodingObject {
  name: string;
  decode: (str: string) => CryptoJs.lib.WordArray;
  encode: (wordArray: CryptoJs.lib.WordArray) => string;
}
type Uint8andBufferEncodingObject =
  Omit<Omit<EncodingObject, 'decode'>, 'encode'> & {
    decode: (uint8ArrayOrBufferOrArray: Uint8Array | Buffer | Array<number>) => CryptoJs.lib.WordArray
    encode: (wordArray: CryptoJs.lib.WordArray) => Uint8Array
  };
interface Encodings {
  readonly UTF8: EncodingObject;
  readonly HEX: EncodingObject;
  readonly UINT8: Uint8andBufferEncodingObject
  readonly BUFFER: Uint8andBufferEncodingObject;

}
const Encoding: Encodings = {
  UTF8: {
    name: 'utf8',
    decode: Utf8.parse,
    encode: Utf8.stringify,
  },
  HEX: {
    name: 'hex',
    decode: Hex.parse,
    encode: Hex.stringify,
  },
  UINT8: {
    name: 'uint8',
    decode: Uint8.decode,
    encode: Uint8.encode,
  },
  BUFFER: {
    name: 'buffer',
    decode: (data: Uint8Array | Buffer | Array<number>): CryptoJs.lib.WordArray => Uint8.decode(data),
    encode: (data: CryptoJs.lib.WordArray): Buffer => Buffer.from(Uint8.encode(data)),
  },
};


const prepareHash = (target: Buffer | string | Array<number> | Uint8Array): string | CryptoJs.lib.WordArray => {
  if (Buffer.isBuffer(target)) {
    return Encoding.BUFFER.decode(target);
  }
  if (target instanceof Uint8Array || target instanceof Array) {
    return Encoding.UINT8.decode(target);
  }
  return target;
};

type HashableType = Buffer | string | Array<number> | Uint8Array;
type Hashing = (target: HashableType, encoding?: EncodingObject) => string;
type HashingWithSize = (target: HashableType, size: number, encoding?: EncodingObject) => string;

interface Hashs {
  readonly sha224: Hashing;
  readonly sha256: Hashing;
  readonly sha384: Hashing;
  readonly sha512: Hashing;
  readonly sha3: HashingWithSize;
  readonly ripemd160: Hashing;
}


const Hash: Hashs = {
  sha224: (target, encoding = Encoding.HEX) => encoding.encode(SHA224(prepareHash(target))),
  sha256: (target, encoding = Encoding.HEX) => encoding.encode(SHA256(prepareHash(target))),
  sha384: (target, encoding = Encoding.HEX) => encoding.encode(SHA384(prepareHash(target))),
  sha512: (target, encoding = Encoding.HEX) => encoding.encode(SHA512(prepareHash(target))),
  sha3: (target, size = 512, encoding = Encoding.HEX) => encoding.encode(SHA3(prepareHash(target), { outputLength: size })),
  ripemd160: (target, encoding = Encoding.HEX) => encoding.encode(RIPEMD160(prepareHash(target))),
};

export {
  Padding,
  Encoding,
  Hash,
};

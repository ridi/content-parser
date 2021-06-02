/* eslint-disable no-plusplus */
/* eslint-disable no-bitwise */
import * as CryptoJs from 'crypto-js';

const {
  pad, enc, MD5, SHA1, SHA224, SHA256, SHA384, SHA512, SHA3, RIPEMD160,
} = CryptoJs;
const { Pkcs7 } = pad;
const { Utf8, Hex } = enc;

/**
 * @typedef {Object} PaddingObject
 * @property {string} name
 * @property {Padding} op
 * @property {(data:CryptoJs.lib.WordArray)=>void} pad
 * @property {(data:CryptoJs.lib.WordArray)=>void} unpad
 */

/**
 * @typedef {Object} PaddingList
 * @property {PaddingObject} AUTO
 * @property {PaddingObject} PKCS7
 * @property {PaddingObject} NONE
 */

/**
 * @type {PaddingList}
 */
const Padding = Object.freeze({
  AUTO: {
    name: 'auto',
    op: Pkcs7,
    pad: data => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  PKCS7: {
    name: 'pkcs7',
    op: pad.Pkcs7,
    pad: data => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  NONE: {
    name: 'none',
    op: pad.NoPadding,
  },
});

/**
 * @typedef {Uint8Array|Buffer|Array} IterableObject
 * @typedef {(uint8ArrayOrBufferOrArray:IterableObject)=>CryptoJs.lib.WordArray} DecodeFunction
 * @typedef {(wordArray:CryptoJs.lib.WordArray)=>Uint8Array} EncodeFunction
 * @typedef {Object} UINT8Object
 * @property {DecodeFunction} decode
 * @property {EncodeFunction} encode
 */

/**
 * @type {UINT8Object}
 */
const Uint8 = {
  decode: uint8ArrayOrBufferOrArray => {
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
    return CryptoJs.lib.WordArray.create(uint8Array);
  },
  encode: wordArray => {
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

/**
 * @typedef {Object} EncodingObject
 * @property {string} name
 * @property {(str: string|IterableObject)=>CryptoJs.lib.WordArray} decode
 * @property {(wordArray: CryptoJs.lib.WordArray)=>(string|Uint8Array)} encode
 */

/**
 * @typedef {Object} EncodingList
 * @property {EncodingObject} UTF8
 * @property {EncodingObject} HEX
 * @property {EncodingObject} UINT8
 * @property {EncodingObject} BUFFER
 */

/**
 * @type {EncodingList}
 */
const Encoding = Object.freeze({
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
    decode: data => Uint8.decode(data),
    encode: data => Buffer.from(Uint8.encode(data)),
  },
});

/**
 * @param {any} any
 * @returns {any}
 */
const prepareHash = any => {
  if (Buffer.isBuffer(any)) {
    return Encoding.BUFFER.decode(any);
  }
  if (any instanceof Uint8Array || any instanceof Array) {
    return Encoding.UINT8.decode(any);
  }
  return any;
};

/**
 * @typedef {(any:any, encoding?:EncodingObject)=>string} HashFunction Use `Encoding`
 */

/**
 * @typedef {Object} HashList
 * @property {HashFunction} md5
 * @property {HashFunction} sha1
 * @property {HashFunction} sha224
 * @property {HashFunction} sha256
 * @property {HashFunction} sha384
 * @property {HashFunction} sha512
 * @property {HashFunction} sha3
 * @property {HashFunction} ripemd160
 */

/**
 * @type {HashList}
 */
const Hash = Object.freeze({
  md5: (any, encoding = Encoding.HEX) => encoding.encode(MD5(prepareHash(any))),
  sha1: (any, encoding = Encoding.HEX) => encoding.encode(SHA1(prepareHash(any))),
  sha224: (any, encoding = Encoding.HEX) => encoding.encode(SHA224(prepareHash(any))),
  sha256: (any, encoding = Encoding.HEX) => encoding.encode(SHA256(prepareHash(any))),
  sha384: (any, encoding = Encoding.HEX) => encoding.encode(SHA384(prepareHash(any))),
  sha512: (any, encoding = Encoding.HEX) => encoding.encode(SHA512(prepareHash(any))),
  sha3: (any, size = 512, encoding = Encoding.HEX) => encoding.encode(SHA3(prepareHash(any), { outputLength: size })),
  ripemd160: (any, encoding = Encoding.HEX) => encoding.encode(RIPEMD160(prepareHash(any))),
});

export {
  Padding,
  Encoding,
  Hash,
};

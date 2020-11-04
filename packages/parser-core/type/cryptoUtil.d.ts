export type PaddingObject = {
    name: string;
    op: PaddingList;
    pad: (data: CryptoJs.lib.WordArray) => void;
    unpad: (data: CryptoJs.lib.WordArray) => void;
};
export type PaddingList = {
    AUTO: PaddingObject;
    PKCS7: PaddingObject;
    NONE: PaddingObject;
};
export type IterableObject = any[] | Uint8Array | Buffer;
export type DecodeFunction = (uint8ArrayOrBufferOrArray: IterableObject) => CryptoJs.lib.WordArray;
export type EncodeFunction = (wordArray: CryptoJs.lib.WordArray) => Uint8Array;
export type UINT8Object = {
    decode: DecodeFunction;
    encode: EncodeFunction;
};
export type EncodingObject = {
    name: string;
    decode: (str: string) => CryptoJs.lib.WordArray;
    encode: (wordArray: CryptoJs.lib.WordArray) => string;
};
export type EncodingList = {
    UTF8: EncodingObject;
    HEX: EncodingObject;
    UINT8: EncodingObject;
    BUFFER: EncodingObject;
};
/**
 * Use `Encoding`
 */
export type HashFunction = (any: any, encoding: EncodingObject) => string;
export type HashList = {
    md5: HashFunction;
    sha1: HashFunction;
    sha224: HashFunction;
    sha256: HashFunction;
    sha384: HashFunction;
    sha512: HashFunction;
    sha3: HashFunction;
    ripemd160: HashFunction;
};
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
export const Padding: PaddingList;
/**
 * @typedef {Object} EncodingObject
 * @property {string} name
 * @property {(str: string)=>CryptoJs.lib.WordArray} decode
 * @property {(wordArray: CryptoJs.lib.WordArray)=>string} encode
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
export const Encoding: EncodingList;
/**
 * @typedef {(any:any, encoding:EncodingObject)=>string} HashFunction Use `Encoding`
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
export const Hash: HashList;
import * as CryptoJs from "crypto-js";

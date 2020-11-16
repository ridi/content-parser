/// <reference types="node" />
import * as CryptoJs from 'crypto-js';
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
declare const Padding: Paddings;
interface EncodingObject {
    name: string;
    decode: (str: string) => CryptoJs.lib.WordArray;
    encode: (wordArray: CryptoJs.lib.WordArray) => string;
}
declare type Uint8andBufferEncodingObject = Omit<Omit<EncodingObject, 'decode'>, 'encode'> & {
    decode: (uint8ArrayOrBufferOrArray: Uint8Array | Buffer | Array<number>) => CryptoJs.lib.WordArray;
    encode: (wordArray: CryptoJs.lib.WordArray) => Uint8Array;
};
interface Encodings {
    readonly UTF8: EncodingObject;
    readonly HEX: EncodingObject;
    readonly UINT8: Uint8andBufferEncodingObject;
    readonly BUFFER: Uint8andBufferEncodingObject;
}
declare const Encoding: Encodings;
declare type HashableType = Buffer | string | Array<number> | Uint8Array;
declare type Hashing = (target: HashableType, encoding?: EncodingObject) => string;
declare type HashingWithSize = (target: HashableType, size: number, encoding?: EncodingObject) => string;
interface Hashs {
    readonly sha224: Hashing;
    readonly sha256: Hashing;
    readonly sha384: Hashing;
    readonly sha512: Hashing;
    readonly sha3: HashingWithSize;
    readonly ripemd160: Hashing;
}
declare const Hash: Hashs;
export { Padding, Encoding, Hash, };

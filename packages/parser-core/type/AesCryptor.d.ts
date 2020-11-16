/// <reference types="node" />
import * as CryptoJs from 'crypto-js';
import { Padding, Encoding } from './cryptoUtil';
import type BaseCryptor from './BaseCryptor';
declare type PossibleDataTypes = string | Buffer | Uint8Array | Array<number>;
interface ModeConfig {
    key: PossibleDataTypes;
    iv?: Buffer | Uint8Array | Array<number>;
}
declare type ModeConfigType = {
    [key in keyof ModeConfig]: string;
};
interface Cipher {
    keySize: number;
    ivSize: number;
    readonly _ENC_XFORM_MODE: number;
    readonly _DEV_XFORM_MODE: number;
    reset(): void;
    process(dataUpdate: CryptoJS.lib.WordArray | string): CryptoJS.lib.WordArray;
    finalize(dataUpdate?: CryptoJS.lib.WordArray | string): CryptoJS.lib.WordArray;
}
interface Mode {
    processBlock(words: number[], offset: number): void;
}
interface BlockCipherMode {
    createEncryptor(cipher: Cipher): Mode;
}
interface ModeObject {
    name: string;
    op: BlockCipherMode;
    configTypes: ModeConfigType;
}
interface IMode {
    readonly ECB: Omit<ModeObject, 'configTypes'> & {
        configTypes: Pick<ModeConfigType, 'key'>;
    };
    readonly CBC: ModeObject;
    readonly CFB: ModeObject;
    readonly OFB: ModeObject;
    readonly CTR: ModeObject;
}
interface CryptOption {
    padding?: typeof Padding.PKCS7 | typeof Padding.NONE;
    encoding?: typeof Encoding.UTF8 | typeof Encoding.UINT8;
}
export declare const Mode: IMode;
interface Operator {
    name: string;
    encrypt: (data: CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray;
    decrypt: (data: CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray;
}
declare class AesCryptor implements BaseCryptor {
    private operator;
    /**
     * Construct AesCryptor
     */
    constructor(mode: ModeObject, config: ModeConfig);
    makeOperator(mode: ModeObject, config: ModeConfig): Operator;
    encrypt(data: string | Buffer | Uint8Array | number[], options?: CryptOption): string | Uint8Array;
    decrypt(data: Buffer | Uint8Array | number[], options?: CryptOption): string | Uint8Array;
}
export default AesCryptor;

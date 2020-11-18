export default AesCryptor;
export type ModeConfig = {
    key: string;
    iv?: string;
};
export type ModeObject = {
    name: string;
    op: any;
    configTypes: ModeConfig;
};
export type ModeList = {
    ECB: ModeObject;
    CBC: ModeObject;
    CFB: ModeObject;
    OFB: ModeObject;
    CTR: ModeObject;
};
declare class AesCryptor {
    /**
     * Construct AesCryptor
     * @param {ModeObject} mode Crypto mode
     * @param {ModeConfig} config Crypto config
     */
    constructor(mode: ModeObject, config: ModeConfig);
    /**
     * @typedef {(data: string | CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray} EncodeAndDecode
     * @typedef {Object} Operator
     * @property {string} name
     * @property {EncodeAndDecode} encrypt
     * @property {EncodeAndDecode} decrypt
     */
    /**
     * @private
     * @type {Operator}
     */
    private operator;
    /**
     * Make an operator
     * @private
     * @param {ModeObject} mode
     * @param {ModeConfig} config
     * @returns {Operator} Operator
     */
    private makeOperator;
    /**
     * @typedef {Object} CryptOption
     * @property {import('./cryptoUtil').PaddingObject} padding
     * @property {import('./cryptoUtil').EncodingObject} encoding
     */
    /**
     * Encrypt string
     * @param {Buffer | Uint8Array | number[]} data
     * @param {CryptOption} options
     * @returns {string} encrypted string
     */
    encrypt(data: Buffer | Uint8Array | number[], options?: {
        padding: import('./cryptoUtil').PaddingObject;
        encoding: import('./cryptoUtil').EncodingObject;
    }): string;
    /**
     * Decrupt string
     * @param {Buffer | Uint8Array | number[]} data
     * @param {CryptOption} options
     * @returns {string} decrypted string
     */
    decrypt(data: Buffer | Uint8Array | number[], options?: {
        padding: import('./cryptoUtil').PaddingObject;
        encoding: import('./cryptoUtil').EncodingObject;
    }): string;
}
declare namespace AesCryptor {
    export { Padding };
    export { Encoding };
    export { Mode };
}
import { Padding } from "./cryptoUtil";
import { Encoding } from "./cryptoUtil";
/**
 * @typedef {Object} ModeObject
 * @property {string} name
 * @property {import('../type/CryptoJs').BlockCipherMode} op
 * @property {ModeConfig} configTypes
 *
 * @typedef {Object} ModeList
 * @property {ModeObject} ECB
 * @property {ModeObject} CBC
 * @property {ModeObject} CFB
 * @property {ModeObject} OFB
 * @property {ModeObject} CTR
*/
/**
 * @type {ModeList}
*/
export const Mode: ModeList;
export { Padding, Encoding };

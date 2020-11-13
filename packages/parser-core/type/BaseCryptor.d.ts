export default BaseCryptor;
export type EncodeAndDecode = (data: string | any) => any;
export type Operator = {
    name: string;
    encrypt: EncodeAndDecode;
    decrypt: EncodeAndDecode;
};
/**
 * @typedef {(data: string | CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray} EncodeAndDecode
 * @typedef {Object} Operator
 * @property {string} name
 * @property {EncodeAndDecode} encrypt
 * @property {EncodeAndDecode} decrypt
 */
declare class BaseCryptor {
    /**
     * Encrypt string
     * @param {string} data
     * @param {CryptOption} options
     * @returns {string} encrypted string
     */
    encrypt(data: string): string;
    /**
     * Decrupt string
     * @param {string} data
     * @param {CryptOption} options
     * @returns {string} decrypted string
     */
    decrypt(data: string): string;
}

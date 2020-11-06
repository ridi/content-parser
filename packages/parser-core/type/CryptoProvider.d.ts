export default CryptoProvider;
export type CryptoProviderOption = string;
export type CryptoProviderPurpose = {
    /**
     * "read_in_zip"
     */
    READ_IN_ZIP: CryptoProviderOption;
    /**
     * "read_in_dir"
     */
    READ_IN_DIR: CryptoProviderOption;
    /**
     * "write"
     */
    WRITE: CryptoProviderOption;
};
export type Purpose = {
    /**
     * "read_in_zip"
     */
    READ_IN_ZIP: CryptoProviderOption;
    /**
     * "read_in_dir"
     */
    READ_IN_DIR: CryptoProviderOption;
    /**
     * "write"
     */
    WRITE: CryptoProviderOption;
};
declare class CryptoProvider {
    isStreamMode: boolean;
    /**
     * Size of data to process at once
     *
     * `null` means use nodejs default (default: 65535)
     * @returns {number}
     */
    get bufferSize(): number;
    /**
     * Create or reuse AesCryptor by condition
     * @abstract
     * @param {string} filePath
     * @param {string} purpose
     * @returns {AesCryptor}
     */
    getCryptor(filePath: string, purpose: string): AesCryptor;
    /**
     * Should execute encrypt or decrypt by condition if needed
     * @abstract
     * @param {Buffer} data
     * @param {string} filePath
     * @param {string} purpose
     */
    run(data: Buffer, filePath: string, purpose: string): void;
}
declare namespace CryptoProvider {
    export { Purpose };
}
import AesCryptor from "./AesCryptor";
/**
 * @typedef {string} CryptoProviderOption
 *
 * @typedef {Object} CryptoProviderPurpose
 * @property {CryptoProviderOption} READ_IN_ZIP "read_in_zip"
 * @property {CryptoProviderOption} READ_IN_DIR "read_in_dir"
 * @property {CryptoProviderOption} WRITE "write"
*/
/**
 * @enum {CryptoProviderPurpose}
 */
declare const Purpose: Readonly<{
    READ_IN_ZIP: string;
    READ_IN_DIR: string;
    WRITE: string;
}>;

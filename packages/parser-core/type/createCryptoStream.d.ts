export default createCryptoStream;
/**
 * @param  {string} filePath
 * @param  {number} totalSize
 * @param  {CryptoProvider} cryptoProvider
 * @param  {import('./CryptoProvider').CryptoProviderPurpose} purpose
 * @returns {es.MapStream}
 */
declare function createCryptoStream(filePath: string, totalSize: number, cryptoProvider: CryptoProvider, purpose: import('./CryptoProvider').CryptoProviderPurpose): es.MapStream;
import CryptoProvider from "./CryptoProvider";
import * as es from "event-stream";

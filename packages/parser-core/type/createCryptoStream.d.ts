import * as es from 'event-stream';
import type CryptoProvider from './CryptoProvider';
import type { Purpose } from './CryptoProvider';
declare const createCryptoStream: (filePath: string, totalSize: number, cryptoProvider: CryptoProvider, purpose: Purpose) => es.MapStream;
export default createCryptoStream;

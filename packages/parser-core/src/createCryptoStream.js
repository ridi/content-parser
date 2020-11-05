import * as es from 'event-stream';
// eslint-disable-next-line no-unused-vars
import CryptoProvider from './CryptoProvider';
/**
 * @param  {string} filePath
 * @param  {number} totalSize
 * @param  {CryptoProvider} cryptoProvider
 * @param  {import('./CryptoProvider').CryptoProviderOption} purpose
 * @returns {es.MapStream}
 */
const createCryptoStream = (filePath, totalSize, cryptoProvider, purpose) => {
  let tmpChunk = Buffer.from([]);
  let pushedSize = 0;
  return es.map(async (chunk, callback) => {
    chunk = Buffer.from(chunk, 'binary');
    const subTotalSize = pushedSize + tmpChunk.length + chunk.length;
    if (subTotalSize < totalSize && subTotalSize % 16 !== 0) {
      tmpChunk = Buffer.concat([tmpChunk, chunk]);
      callback();
    } else {
      chunk = cryptoProvider.run(Buffer.concat([tmpChunk, chunk]), filePath, purpose);
      if (Promise.resolve(chunk) === chunk) {
        chunk = await chunk;
      }
      pushedSize += chunk.length;
      tmpChunk = Buffer.from([]);
      callback(null, chunk);
    }
  });
};

export default createCryptoStream;

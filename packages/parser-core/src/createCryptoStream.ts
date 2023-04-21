import * as es from "event-stream";

// eslint-disable-next-line no-unused-vars
import CryptoProvider, { CryptoProviderOption } from "./CryptoProvider";

/* eslint-disable no-param-reassign */
const createCryptoStream = (
  filePath: string,
  totalSize: number,
  cryptoProvider: CryptoProvider,
  purpose: CryptoProviderOption
) => {
  let tmpChunk = Buffer.from([]);
  let pushedSize = 0;
  return es.map(async (chunk, callback) => {
    chunk = Buffer.from(chunk, "binary");
    const subTotalSize = pushedSize + tmpChunk.length + chunk.length;
    if (subTotalSize < totalSize && subTotalSize % 16 !== 0) {
      tmpChunk = Buffer.concat([tmpChunk, chunk]);
      callback();
    } else {
      chunk = cryptoProvider.run(
        Buffer.concat([tmpChunk, chunk]),
        filePath,
        purpose
      );
      if (Promise.resolve(chunk) === chunk) {
        chunk = await chunk;
      }
      pushedSize += chunk.length;
      tmpChunk = Buffer.from([]);
      callback(null, chunk);
    }
  });
};
/* eslint-enable no-param-reassign */

export default createCryptoStream;

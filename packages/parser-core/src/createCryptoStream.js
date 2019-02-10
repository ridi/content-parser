import es from 'event-stream';

import { isExists } from './typecheck';

const createCryptoStream = (filePath, totalSize, cryptoProvider, purpose) => {
  let tmpChunk = Buffer.from([]);
  let pushedSize = 0;
  return es.map((chunk, callback) => { // eslint-disable-line
    chunk = Buffer.from(chunk, 'binary');
    const subTotalSize = pushedSize + tmpChunk.length + chunk.length;
    if (subTotalSize < totalSize && subTotalSize % 16 !== 0) {
      tmpChunk = Buffer.concat([tmpChunk, chunk]);
      callback();
    } else {
      chunk = Buffer.concat([tmpChunk, chunk]);
      if (isExists(cryptoProvider)) {
        chunk = cryptoProvider.run(chunk, filePath, purpose);
      }
      pushedSize += chunk.length;
      tmpChunk = Buffer.from([]);
      callback(null, chunk);
    }
  });
};

export default createCryptoStream;

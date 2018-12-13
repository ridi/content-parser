import fs from 'fs-extra';
import path from 'path';

import { defaultBufferSize } from './CryptoProvider';
import { getPathes, safePath } from './pathUtil';
import { isExists } from './typecheck';
import openZip from './zipUtil';

function create(source, entries) {
  return {
    first: entries[0],
    find: entryPath => entries.find(entry => entryPath === entry.entryPath),
    map: callback => entries.map(callback),
    forEach: callback => entries.forEach(callback),
    reduce: (callback, initial) => entries.reduce(callback, initial),
    length: entries.length,
    source,
  };
}

function fromZip(zip) {
  return create(zip, Object.values(zip.files).reduce((entries, entry) => { // eslint-disable-line arrow-body-style
    return entries.concat([{
      entryPath: entry.path,
      getFile: encoding => zip.getFile(entry, encoding),
      size: entry.uncompressedSize,
      method: entry.compressionMethod,
      extraFieldLength: entry.extraFieldLength,
    }]);
  }, []));
}

function fromDirectory(dir, cryptoProvider) {
  return create(dir, getPathes(dir).reduce((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    return entries.concat([{
      entryPath: safePath(fullPath).substring(subPathOffset),
      getFile: async (encoding) => {
        let file = await new Promise((resolve, reject) => {
          const bufferSize = isExists(cryptoProvider) ? cryptoProvider.bufferSize : defaultBufferSize;
          const stream = fs.createReadStream(fullPath, { highWaterMark: bufferSize, encoding: 'binary' });
          let buffer = Buffer.from([]);
          stream.on('data', (chunk) => {
            chunk = Buffer.from(chunk, 'binary');
            if (isExists(cryptoProvider)) {
              buffer = Buffer.concat([buffer, cryptoProvider.run(chunk, fullPath)]);
            } else {
              buffer = Buffer.concat([buffer, chunk]);
            }
          }).on('error', e => reject(e)).on('end', () => resolve(buffer));
        });
        if (isExists(encoding)) {
          file = file.toString(encoding);
        }
        return file;
      },
      size: fs.lstatSync(fullPath).size,
    }]);
  }, []));
}

export default async function readEntries(input, cryptoProvider) {
  if (fs.lstatSync(input).isFile()) {
    if (isExists(cryptoProvider)) {
      input = cryptoProvider.run(fs.readFileSync(input), input);
    }
    const zip = await openZip(input, cryptoProvider);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider);
}

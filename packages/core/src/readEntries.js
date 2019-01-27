import fs from 'fs-extra';
import path from 'path';

import { readCacheFile, writeCacheFile } from './cacheFile';
import createCryptoStream from './createCryptoStream';
import CryptoProvider from './CryptoProvider';
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

function fromDirectory(dir, cryptoProvider, resetCache) {
  let pathes = JSON.parse(readCacheFile(dir) || '[]');
  if (resetCache || pathes.length === 0) {
    pathes = getPathes(dir);
    writeCacheFile(dir, JSON.stringify(pathes), resetCache);
  }
  return create(dir, pathes.reduce((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    const size = (() => {
      try { return fs.lstatSync(fullPath).size; } catch (e) { return 0; }
    })();
    return entries.concat([{
      entryPath: safePath(fullPath).substring(subPathOffset),
      getFile: async (encoding) => {
        let file = await new Promise((resolve, reject) => {
          const stream = fs.createReadStream(fullPath, { encoding: 'binary' });
          let data = Buffer.from([]);
          stream
            .pipe(createCryptoStream(fullPath, size, cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR))
            .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
            .on('error', e => reject(e))
            .on('end', () => resolve(data));
        });
        if (isExists(encoding)) {
          file = file.toString(encoding);
        }
        return file;
      },
      size,
    }]);
  }, []));
}

export default async function readEntries(input, cryptoProvider, logger, resetCache = false) {
  if (fs.lstatSync(input).isFile()) { // TODO: When input is Buffer.
    if (isExists(cryptoProvider)) {
      input = cryptoProvider.run(fs.readFileSync(input), input, CryptoProvider.Purpose.READ_IN_DIR);
    }
    const zip = await openZip(input, cryptoProvider, logger);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider, resetCache);
}

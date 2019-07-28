/* eslint-disable max-len */
import fs from 'fs-extra';
import path from 'path';

import { removeCacheFile, readCacheFile, writeCacheFile } from './cacheFile';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import Errors, { createError } from './errors';
import { getPathes, safePath } from './pathUtil';
import { conditionally } from './streamUtil';
import { isExists } from './typecheck';
import openZip from './zipUtil';

function getReadStreamOptions(bufferSize) {
  let options = {};
  if (isExists(bufferSize)) {
    options = { ...options, highWaterMark: bufferSize };
  }
  return options;
}

function create(source, entries) {
  return {
    first: entries[0],
    length: entries.length,
    source,
    get: idx => entries[idx],
    find: entryPath => entries.find(entry => entryPath === entry.entryPath),
    forEach: callback => entries.forEach(callback),
    map: callback => entries.map(callback),
    sort: callback => entries.sort(callback),
  };
}

function fromZip(zip) {
  return create(zip, Object.values(zip.files).reduce((entries, entry) => {
    return entries.concat([{
      entryPath: entry.path,
      getFile: options => zip.getFile(entry, options),
      size: entry.uncompressedSize,
      method: entry.compressionMethod,
      extraFieldLength: entry.extraFieldLength,
    }]);
  }, []));
}

function fromDirectory(dir, cryptoProvider) {
  let paths = (() => {
    /* istanbul ignore next */
    try { return JSON.parse(readCacheFile(dir) || '[]'); } catch (e) { return []; }
  })();
  if (paths.length === 0) {
    paths = getPathes(dir);
    writeCacheFile(dir, JSON.stringify(paths), true);
  }
  return create(dir, paths.reduce((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    const size = (() => {
      /* istanbul ignore next */
      try { return fs.lstatSync(fullPath).size; } catch (e) { return 0; }
    })();
    return entries.concat([{
      entryPath: safePath(fullPath).substring(subPathOffset),
      getFile: async (options = {}) => {
        const { encoding, end, bufferSize } = options;
        let file = await new Promise((resolve, reject) => {
          if (fs.existsSync(fullPath)) {
            const stream = fs.createReadStream(fullPath, getReadStreamOptions(bufferSize));
            const totalSize = Math.min(end || Infinity, size);
            let data = Buffer.from([]);
            stream
              .pipe(conditionally(isExists(end), createSliceStream(0, end)))
              .pipe(conditionally(isExists(cryptoProvider), createCryptoStream(fullPath, totalSize, cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR)))
              .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
              .on('error', e => reject(e))
              .on('end', () => resolve(data));
          } else {
            removeCacheFile(dir);
            throw createError(Errors.ENOFILE, fullPath);
          }
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

function fromFile(filePath, cryptoProvider) {
  const size = (() => {
    /* istanbul ignore next */
    try { return fs.lstatSync(filePath).size; } catch (e) { return 0; }
  })();
  return create(filePath, [{
    entryPath: filePath,
    getFile: async (options = {}) => {
      const { encoding, end, bufferSize } = options;
      let file = await new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
          const stream = fs.createReadStream(filePath, getReadStreamOptions(bufferSize));
          const totalSize = Math.min(end || Infinity, size);
          let data = Buffer.from([]);
          stream
            .pipe(conditionally(isExists(end), createSliceStream(0, end)))
            .pipe(conditionally(isExists(cryptoProvider), createCryptoStream(filePath, totalSize, cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR)))
            .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
            .on('error', e => reject(e))
            .on('end', () => resolve(data));
        } else {
          throw createError(Errors.ENOFILE, filePath);
        }
      });
      if (isExists(encoding)) {
        file = file.toString(encoding);
      }
      return file;
    },
    size,
  }]);
}

export default async function readEntries(input, cryptoProvider, logger) {
  if (fs.lstatSync(input).isFile()) { // TODO: When input is Buffer.
    if (path.extname(input).toLowerCase() === '.pdf') {
      return fromFile(input, cryptoProvider);
    }
    /* istanbul ignore if */
    if (isExists(cryptoProvider)) {
      /* istanbul ignore next */
      input = cryptoProvider.run(fs.readFileSync(input), input, CryptoProvider.Purpose.READ_IN_DIR);
    }
    const zip = await openZip(input, cryptoProvider, logger);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider);
}

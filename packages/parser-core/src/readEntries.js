import * as fs from 'fs-extra';
import path from 'path';

import { trimEnd } from './bufferUtil';
import { removeCacheFile, readCacheFile, writeCacheFile } from './cacheFile';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import Errors, { createError } from './errors';
import { getPathes, safePath } from './pathUtil';
import { conditionally } from './streamUtil';
import { safeDecodeURI } from './stringUtil';
import { isExists } from './typecheck';
import openZip from './zipUtil';

/**
 * @typedef {Object} ReadStreamOption
 * @property {number} highWaterMark
 */
/**
 * Get read stream option
 * @param  {CryptoProvider} cryptoProvider
 * @returns {ReadStreamOption}
 */
function getReadStreamOptions(cryptoProvider) {
  let options = {};
  if (isExists(cryptoProvider) && isExists(cryptoProvider.bufferSize)) {
    options = { highWaterMark: cryptoProvider.bufferSize };
  }
  return options;
}
/**
 * @typedef {Object} FileEntryObject
 * @property {S} first
 * @property {number} length
 * @property {T} source
 * @property {(idx:number)=>S} get
 * @property {(entryPath:string,strict:boolean)=>S} find
 * @property {(callback:(value: S, index: number, array: S[]) => void)=>void} forEach
 * @property {(callback: (value: S, index: number, array: S[]) => any)=>void} map
 * @property {(callback: (a: S, b: S) => number)=>void} sort
 * @template T, S
 */

/**
 * @param  {T} source
 * @param  {S[]} entries
 * @returns {FileEntryObject<T, S>}
 * @template T, S
 */
function create(source, entries) {
  return {
    first: entries[0],
    length: entries.length,
    source,
    get: idx => entries[idx],
    find: (entryPath, strict = true) => entries.find(entry => {
      const lhs = strict ? entryPath : safeDecodeURI(entryPath);
      const rhs = strict ? entry.entryPath : safeDecodeURI(entry.entryPath);
      return lhs === rhs;
    }),
    forEach: callback => entries.forEach(callback),
    map: callback => entries.map(callback),
    sort: callback => entries.sort(callback),
  };
}

/**
 * @typedef {Object} EntryBasicInformation
 * @property {string} entryPath
 * @property {number} size
 * @property {(options:{endocing:string, end: number})=>(Promise<Buffer>|Buffer)} getFile
 *
 * @typedef {Object} ZipfileEntryInformation
 * @property {string} method
 * @property {number} extraFieldLength
 *
 * @typedef {import('adm-zip').IZipEntry & EntryBasicInformation & ZipfileEntryInformation} IZipEntryPlus
*/

/**
 * Get FileEntryObject from the zip file
 * @param  {import('./zipUtil').ZipFileInformation} zip
 * @returns {FileEntryObject<import('./zipUtil').ZipFileInformation, IZipEntryPlus}
 */
function fromZip(zip) {
  const zipCopy = { ...zip };
  zipCopy.files = zip.files.map((file) => {
    const getFile = (options = {}) => {
      let data = file.getData();
      if (options.encoding) {
        data = data.toString(options.encoding);
      }
      if (options.end) {
        data = data.slice(0, options.end);
      }
      return data;
    };
    return {
      ...file,
      getFile,
      entryPath: file.entryName,
      size: file.header.length,
      method: file.header.method,
      extraFieldLength: file.extra.length,
    };
  });
  return create(zipCopy, zipCopy.files);
}

/**
 * @param  {string} dir
 * @param  {CryptoProvider} cryptoProvider
 * @returns {FileEntryObject<string, EntryBasicInformation>}
 */
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
        const { encoding, end } = options;
        let file = await new Promise((resolve, reject) => {
          if (fs.existsSync(fullPath)) {
            const stream = fs.createReadStream(fullPath, getReadStreamOptions(cryptoProvider));
            const totalSize = Math.min(end || Infinity, size);
            let data = Buffer.from([]);
            stream
              .pipe(conditionally(isExists(end), createSliceStream(0, end)))
              .pipe(conditionally(cryptoProvider && !!cryptoProvider.isStreamMode, createCryptoStream(fullPath, totalSize, cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR)))
              .on('data', (chunk) => {
                data = Buffer.concat([data, chunk]);
              })
              .on('error', e => reject(e))
              .on('end', () => resolve(data));
          } else {
            removeCacheFile(dir);
            throw createError(Errors.ENOFILE, fullPath);
          }
        });
        if (cryptoProvider && !cryptoProvider.isStreamMode) {
          file = cryptoProvider.run(file, fullPath, CryptoProvider.Purpose.READ_IN_DIR);
          if (Promise.resolve(file) === file) {
            file = await file;
          }
        }
        if (isExists(encoding)) {
          file = trimEnd(file).toString(encoding);
        }
        return file;
      },
      size,
    }]);
  }, []));
}

/**
 * @param  {string} filePath
 * @param  {CryptoProvider} cryptoProvider
 * @returns {FileEntryObject<string, EntryBasicInformation>}
 */
function fromFile(filePath, cryptoProvider) {
  const size = (() => {
    /* istanbul ignore next */
    try { return fs.lstatSync(filePath).size; } catch (e) { return 0; }
  })();
  return create(filePath, [{
    entryPath: filePath,
    getFile: async (options = {}) => {
      const { encoding, end } = options;
      let file = await new Promise((resolve, reject) => {
        if (fs.existsSync(filePath)) {
          const stream = fs.createReadStream(filePath, getReadStreamOptions(cryptoProvider));
          let data = Buffer.from([]);
          const totalSize = Math.min(end || Infinity, size);
          stream
            .pipe(conditionally(isExists(end), createSliceStream(0, end)))
            .pipe(conditionally(cryptoProvider && !!cryptoProvider.isStreamMode, createCryptoStream(filePath, totalSize, cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR)))
            .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
            .on('error', e => reject(e))
            .on('end', () => resolve(data));
        } else {
          throw createError(Errors.ENOFILE, filePath);
        }
      });
      if (cryptoProvider && !cryptoProvider.isStreamMode) {
        file = cryptoProvider.run(file, filePath, CryptoProvider.Purpose.READ_IN_DIR);
        if (Promise.resolve(file) === file) {
          file = await file;
        }
      }
      if (isExists(encoding)) {
        file = trimEnd(file).toString(encoding);
      }
      return file;
    },
    size,
  }]);
}

/**
 * @async
 * @param  {string} input
 * @param  {CryptoProvider} cryptoProvider
 * @param  {import('./Logger').default} logger
 */
export default async function readEntries(input, cryptoProvider, logger) {
  if (fs.lstatSync(input).isFile()) { // TODO: When input is Buffer.
    if (path.extname(input).toLowerCase() === '.pdf') {
      return fromFile(input, cryptoProvider);
    }
    /* istanbul ignore if */
    if (isExists(cryptoProvider)) {
      /* istanbul ignore next */
      input = cryptoProvider.run(fs.readFileSync(input), input, CryptoProvider.Purpose.READ_IN_DIR);
      if (Promise.resolve(input) === input) {
        input = await input;
      }
    }
    const zip = await openZip(input, cryptoProvider, logger);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider);
}

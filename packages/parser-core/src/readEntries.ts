import type { IZipEntry } from 'adm-zip';
import * as fs from 'fs-extra';
import path from 'path';

import { trimEnd } from './bufferUtil';
import { removeCacheFile, readCacheFile, writeCacheFile } from './cacheFile';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider, { Purpose } from './CryptoProvider';
import Errors, { createError } from './errors';
import type Logger from './Logger';
import { getPathes, safePath } from './pathUtil';
import { conditionally } from './streamUtil';
import { safeDecodeURI } from './stringUtil';
import { isExists } from './typecheck';
import openZip, { ZipFileInformation } from './zipUtil';



interface FileEntryObject<T, S extends { entryPath: string }> {
  first: S;
  length: number;
  source: T;
  get: (idx: number) => S;
  find: (entryPath: string, strict: boolean) => S | undefined;
  forEach: (callback: (value: S, index: number, array: S[]) => void) => void;
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  map: (callback: (value: S, index: number, array: S[]) => any) => void;
  sort: (callback: (a: S, b: S) => number) => void;
}


function create<T, S extends { entryPath: string }>(source: T, entries: S[]): FileEntryObject<T, S> {
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
interface GetFileOption { encoding?: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined; end?: number }
interface EntryBasicInformation {
  entryPath: string;
  size: number;
  getFile: (options?: GetFileOption) => (Buffer | string) | Promise<string | Buffer>
}

interface ZipfileEntryInformation {
  extraFieldLength: number;
}

type IZipEntryPlus = IZipEntry & EntryBasicInformation & ZipfileEntryInformation;


function fromZip(zip: ZipFileInformation): FileEntryObject<ZipFileInformation, IZipEntryPlus> {
  const zipCopy = { ...zip };
  const files = zip.files.map<IZipEntryPlus>((file) => {
    const getFile = (options?: GetFileOption) => {
      let data: Buffer | string = file.getData();
      if (options?.encoding) {
        data = data.toString(options.encoding);
      }
      if (options?.end) {
        data = data.slice(0, options.end);
      }
      return data;
    };
    return {
      ...file,
      getFile,
      entryPath: file.entryName,
      size: file.header.length,
      extraFieldLength: file.extra.length,
    };
  });
  return create(zipCopy, files);
}

/**
 * @param {string} dir
 * @param {CryptoProvider} cryptoProvider
 * @returns {FileEntryObject<string, EntryBasicInformation>}
 */
function fromDirectory(dir: string, cryptoProvider: CryptoProvider): FileEntryObject<string, EntryBasicInformation> {
  let paths: string[] = (() => {
    /* istanbul ignore next */
    try { return JSON.parse(readCacheFile(dir) || '[]'); } catch (e) { return []; }
  })();
  if (paths.length === 0) {
    paths = getPathes(dir);
    writeCacheFile(dir, JSON.stringify(paths), true);
  }
  return create(dir, paths.reduce<EntryBasicInformation[]>((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    const size = (() => {
      try { return fs.lstatSync(fullPath).size; } catch (e) { return 0; }
    })();
    return entries.concat([{
      entryPath: safePath(fullPath).substring(subPathOffset),
      getFile: async (options) => {
        let file = await new Promise<Buffer>((resolve, reject) => {
          if (fs.existsSync(fullPath)) {
            const stream = fs.createReadStream(fullPath);
            const totalSize = Math.min(options?.end || Infinity, size);
            let data = Buffer.from([]);
            const bindedConditionally = conditionally.bind(stream);
            stream
              .pipe(bindedConditionally(isExists(options?.end), createSliceStream(0, options?.end)))
              .pipe(bindedConditionally(cryptoProvider && !!cryptoProvider.isStreamMode,
                createCryptoStream(fullPath, totalSize, cryptoProvider, Purpose.READ_IN_DIR)))
              .on('data', (chunk: Buffer) => {
                data = Buffer.concat([data, chunk]);
              })
              .on('error', (e:Error) => reject(e))
              .on('end', () => resolve(data));
          } else {
            removeCacheFile(dir);
            throw createError(Errors.ENOFILE, fullPath);
          }
        });
        if (cryptoProvider && !cryptoProvider.isStreamMode) {
          file = await cryptoProvider.run(file, fullPath, Purpose.READ_IN_DIR);
        }
        if (isExists(options?.encoding)) {
          return trimEnd(file).toString(options?.encoding);
        }
        return file;
      },
      size,
    }]);
  }, []));
}


function fromFile(filePath: string, cryptoProvider: CryptoProvider): FileEntryObject<string, EntryBasicInformation> {
  const size = (() => {
    /* istanbul ignore next */
    try { return fs.lstatSync(filePath).size; } catch (e) { return 0; }
  })();
  return create<string, EntryBasicInformation>(filePath, [{
    entryPath: filePath,
    size,
    getFile: async (options?: GetFileOption) => {
      let file = await new Promise<Buffer>((resolve, reject) => {
        const stream = fs.createReadStream(filePath);
        let data = Buffer.from([]);
        const totalSize = Math.min(options?.end || Infinity, size);
        const bindedConditionally = conditionally.bind(stream);
        stream
          .pipe(bindedConditionally(isExists(options?.end), createSliceStream(0, options?.end)))
          .pipe(bindedConditionally(cryptoProvider && !!cryptoProvider.isStreamMode,
            createCryptoStream(filePath, totalSize, cryptoProvider, Purpose.READ_IN_DIR)))
          .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
          .on('error', e => reject(e))
          .on('end', () => resolve(data));
      });
      if (cryptoProvider && !cryptoProvider.isStreamMode) {
        file = await cryptoProvider.run(file, filePath, Purpose.READ_IN_DIR);
      }
      if (isExists(options?.encoding)) {
        return trimEnd(file).toString(options?.encoding);
      }
      return file;
    },
  }]);
}

export type ReadEntriesReturnType = FileEntryObject<string, EntryBasicInformation> | FileEntryObject<ZipFileInformation, IZipEntryPlus>;

export default async function readEntries(input: string, cryptoProvider: CryptoProvider, logger: Logger): Promise<ReadEntriesReturnType> {
  if (fs.lstatSync(input).isFile()) { // TODO: When input is Buffer.
    if (path.extname(input).toLowerCase() === '.pdf') {
      return fromFile(input, cryptoProvider);
    }
    /* istanbul ignore if */
    const result = isExists(cryptoProvider) ? await cryptoProvider.run(fs.readFileSync(input), input, Purpose.READ_IN_DIR) : input;
    const zip = await openZip(result, cryptoProvider, logger);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider);
}

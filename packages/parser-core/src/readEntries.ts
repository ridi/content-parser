import * as fs from "fs-extra";

import path from "path";

import { trimEnd } from "./bufferUtil";
import { removeCacheFile, readCacheFile, writeCacheFile } from "./cacheFile";
import createCryptoStream from "./createCryptoStream";
import createSliceStream from "./createSliceStream";
import CryptoProvider from "./CryptoProvider";
import Errors, { createError } from "./errors";
import { getPathes, safePath } from "./pathUtil";
import { conditionally } from "./streamUtil";
import { safeDecodeURI } from "./stringUtil";
import { isExists } from "./typecheck";
import openZip, { ZipFileInformation } from "./zipUtil";
import { IZipEntry } from "adm-zip";
import Logger from "./Logger";
import { Stream, Readable } from "stream";

type ArrayItem<Type> = Type extends (infer Item)[] ? Item : Type;

type FileEntryObject<Source, Entry extends EntryBasicInformation> = {
  first: Entry;
  length: number;
  source: Source;
  get(index: number): Entry;
  find(entryPath: string, strict?: boolean): Entry | undefined;
  forEach(f: (value: Entry, index: number, array: Entry[]) => void): void;
  map<Return>(
    f: (value: Entry, index: number, array: Entry[]) => Return
  ): Return[];
  sort(f: (a: Entry, b: Entry) => number): Entry[];
};

function create<Source, Entry extends EntryBasicInformation>(
  source: Source,
  entries: Entry[]
): FileEntryObject<Source, Entry> {
  return {
    first: entries[0],
    length: entries.length,
    source,
    get: (idx) => entries[idx],
    find: (entryPath, strict = true) =>
      entries.find((entry) => {
        const lhs = strict ? entryPath : safeDecodeURI(entryPath);
        const rhs = strict ? entry.entryPath : safeDecodeURI(entry.entryPath);
        return lhs === rhs;
      }),
    forEach: (callback) => entries.forEach(callback),
    map: (callback) => entries.map(callback),
    sort: (callback) => entries.sort(callback),
  };
}

export type EntryBasicInformation = {
  entryPath: string;
  size: number;
  getFile(options?: {
    encoding?: BufferEncoding;
    end?: number;
  }): Promise<Buffer | string> | Buffer | string;
};

type ZipfileEntryInformation = {
  method: number;
  extraFieldLength: number;
};

type IZipEntryPlus = IZipEntry &
  EntryBasicInformation &
  ZipfileEntryInformation;

/**
 * Get FileEntryObject from the zip file
 */
function fromZip(
  zip: ZipFileInformation
): FileEntryObject<ZipFileInformation, IZipEntryPlus> {
  const zipCopy = { ...zip };
  const result = {
    ...zipCopy,
    files: zip.files.map<IZipEntryPlus>((file) => {
      const getFile: EntryBasicInformation["getFile"] = (options = {}) => {
        let data: Buffer | string = file.getData();
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
        size: file.header.size,
        method: file.header.method,
        extraFieldLength: file.extra.length,
      };
    }),
  };

  return create(result, result.files);
}

function fromDirectory(
  dir: string,
  cryptoProvider: CryptoProvider
): FileEntryObject<string, EntryBasicInformation> {
  let paths: string[] = (() => {
    /* istanbul ignore next */
    try {
      return JSON.parse(readCacheFile(dir) || "[]");
    } catch (e) {
      return [];
    }
  })();
  if (paths.length === 0) {
    paths = getPathes(dir);
    writeCacheFile(dir, JSON.stringify(paths), true);
  }
  return create(
    dir,
    paths.reduce<EntryBasicInformation[]>((entries, fullPath) => {
      const subPathOffset = path.normalize(dir).length + path.sep.length;
      const size = (() => {
        /* istanbul ignore next */
        try {
          return fs.lstatSync(fullPath).size;
        } catch (e) {
          return 0;
        }
      })();
      return entries.concat([
        {
          entryPath: safePath(fullPath).substring(subPathOffset),
          getFile: async (options = {}) => {
            const { encoding, end } = options;
            let file: Buffer | string = await new Promise<Buffer>(
              (resolve, reject) => {
                if (fs.existsSync(fullPath)) {
                  const stream = fs.createReadStream(fullPath);
                  const totalSize = Math.min(end || Infinity, size);
                  let data = Buffer.from([]);
                  stream
                    .pipe(
                      conditionally(isExists(end), createSliceStream(0, end))
                    )
                    .pipe(
                      conditionally(
                        cryptoProvider && !!cryptoProvider.isStreamMode,
                        createCryptoStream(
                          fullPath,
                          totalSize,
                          cryptoProvider,
                          CryptoProvider.Purpose.READ_IN_DIR
                        )
                      )
                    )
                    .on("data", (chunk) => {
                      data = Buffer.concat([data, chunk]);
                    })
                    .on("error", (e) => reject(e))
                    .on("end", () => resolve(data));
                } else {
                  removeCacheFile(dir);
                  throw createError(Errors.ENOFILE, fullPath);
                }
              }
            );
            if (cryptoProvider && !cryptoProvider.isStreamMode) {
              file = (await cryptoProvider.run(
                file,
                fullPath,
                CryptoProvider.Purpose.READ_IN_DIR
              )) as unknown as Buffer;
            }
            if (isExists(encoding)) {
              file = trimEnd(file).toString(encoding);
            }
            return file;
          },
          size,
        },
      ]);
    }, [])
  );
}

function fromFile(
  filePath: string,
  cryptoProvider: CryptoProvider
): FileEntryObject<string, EntryBasicInformation> {
  const size = (() => {
    /* istanbul ignore next */
    try {
      return fs.lstatSync(filePath).size;
    } catch (e) {
      return 0;
    }
  })();
  return create(filePath, [
    {
      entryPath: filePath,
      getFile: async (options = {}) => {
        const { encoding, end } = options;
        const streamOption =
          cryptoProvider && cryptoProvider.bufferSize
            ? { highWaterMark: cryptoProvider.bufferSize }
            : {};
        let file: Buffer | string = await new Promise<Buffer>(
          (resolve, reject) => {
            const stream = fs.createReadStream(filePath, streamOption);
            let data = Buffer.from([]);
            const totalSize = Math.min(end || Infinity, size);
            stream
              .pipe(conditionally(isExists(end), createSliceStream(0, end)))
              .pipe(
                conditionally(
                  cryptoProvider && !!cryptoProvider.isStreamMode,
                  createCryptoStream(
                    filePath,
                    totalSize,
                    cryptoProvider,
                    CryptoProvider.Purpose.READ_IN_DIR
                  )
                )
              )
              .on("data", (chunk) => {
                data = Buffer.concat([data, chunk]);
              })
              .on("error", (e) => reject(e))
              .on("end", () => resolve(data));
          }
        );
        if (cryptoProvider && !cryptoProvider.isStreamMode) {
          file = (await cryptoProvider.run(
            file,
            filePath,
            CryptoProvider.Purpose.READ_IN_DIR
          )) as unknown as Buffer;
        }
        if (isExists(encoding)) {
          file = trimEnd(file).toString(encoding);
        }
        return file;
      },
      size,
    },
  ]);
}

export type ReadEntriesReturnType =
  | FileEntryObject<string, EntryBasicInformation>
  | FileEntryObject<ZipFileInformation, IZipEntryPlus>;

/* eslint-disable no-param-reassign */
export default async function readEntries(
  input: string,
  cryptoProvider: CryptoProvider,
  logger: Logger
): Promise<ReadEntriesReturnType> {
  if (fs.lstatSync(input).isFile()) {
    // TODO: When input is Buffer.
    if (path.extname(input).toLowerCase() === ".pdf") {
      return fromFile(input, cryptoProvider);
    }
    /* istanbul ignore if */
    if (isExists(cryptoProvider)) {
      /* istanbul ignore next */
      input = (await cryptoProvider.run(
        fs.readFileSync(input),
        input,
        CryptoProvider.Purpose.READ_IN_DIR
      )) as unknown as string;
    }
    const zip = await openZip(input, cryptoProvider, logger);
    return fromZip(zip);
  }
  return fromDirectory(input, cryptoProvider);
}
/* eslint-enable no-param-reassign */

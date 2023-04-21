import AdmZip, { IZipEntry } from 'adm-zip';
import fs from 'fs-extra';

import { Readable } from 'stream';

import { trimEnd } from './bufferUtil';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import Errors, { createError } from './errors';
import { conditionally } from './streamUtil';
import { isExists } from './typecheck';
import Logger from './Logger';

type GetFileOptions = {
  encoding: BufferEncoding;
  end?: number;
};

export type ZipFileInformation = {
  file?: string;
  files: IZipEntry[];
  cryptoProvider: CryptoProvider;
  find(entryPath: string): IZipEntry;
  getFile(entry: IZipEntry, options?: GetFileOptions): Promise<Buffer | String>;
  extractAll(unzipPath: string, overwrite?: boolean): Promise<void>;
  logger: Logger;
};

/**
 * Find the file with a path. A file with path or undefined if there is none.
 * */
function find(this: ZipFileInformation, entryPath: string) {
  return this.files.find((entry) => entryPath === entry.entryName);
}

/**
 * @returns {Promise<Buffer | String>} String is encoding is provided, Buffer otherwise
 */
async function getFile(
  this: ZipFileInformation,
  entry: IZipEntry,
  options: GetFileOptions = { encoding: undefined, end: undefined }
): Promise<Buffer | String> {
  const { encoding, end } = options;
  let file: Buffer | string = await new Promise<Buffer>((resolveFile) => {
    // const totalSize = Math.min(end || Infinity, entry.header.size); // 알 수 없는 속성
    const totalSize = Math.min(end || Infinity);
    let data = Buffer.from([]);
    const readable = Readable.from(entry.getData());
    readable
      .pipe(conditionally(isExists(end), createSliceStream(0, end)))
      .pipe(
        conditionally(
          this.cryptoProvider && !!this.cryptoProvider.isStreamMode,
          createCryptoStream(
            entry.entryName,
            totalSize,
            this.cryptoProvider,
            CryptoProvider.Purpose.READ_IN_DIR
          )
        )
      )
      .on('data', (chunk) => {
        data = Buffer.concat([data, chunk]);
      })
      .on('end', () => {
        resolveFile(data);
      });
  });
  if (this.cryptoProvider && !this.cryptoProvider.isStreamMode) {
    file = (await this.cryptoProvider.run(
      file,
      entry.entryName,
      CryptoProvider.Purpose.READ_IN_DIR
    )) as unknown as Buffer;
  }
  if (isExists(encoding)) {
    file = trimEnd(file).toString(encoding);
  }
  return file;
}

/**
 * Extract zip file to path
 * @param {string} unzipPath Path where files will be extracted
 */
async function extractAll(
  this: ZipFileInformation,
  unzipPath: string,
  overwrite = true
) {
  if (overwrite) {
    fs.removeSync(unzipPath);
  }
  fs.mkdirpSync(unzipPath);
  const zip = new AdmZip();
  await Promise.all(
    this.files.map(async (entry) => {
      if (this.cryptoProvider && !entry.isDirectory) {
        entry.setData(
          (await this.cryptoProvider.run(
            entry.getData(),
            entry.entryName,
            CryptoProvider.Purpose.WRITE
          )) as unknown as string | Buffer
        );
      }
      zip.addFile(entry.entryName, entry.getData());
    })
  );
  zip.extractAllTo(unzipPath);
}

/**
 * @throws {Errors.ENOENT} When file can't be found
 */
export default async function openZip(
  file: string | Buffer,
  cryptoProvider?: CryptoProvider,
  logger?: Logger
): Promise<ZipFileInformation> {
  try {
    const files = new AdmZip(file).getEntries();
    return {
      files,
      cryptoProvider,
      find,
      getFile,
      extractAll,
      logger,
    };
  } catch (err) {
    throw createError(Errors.ENOENT, file.toString());
  }
}

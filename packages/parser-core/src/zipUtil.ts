import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

import { trimEnd } from './bufferUtil';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider, { Purpose } from './CryptoProvider';
import { isExists } from './typecheck';
import { conditionally } from './streamUtil';
import Errors, { createError } from './errors';
import type Logger from './Logger';

interface GetFileOption {
  encoding: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined;
  end: number | undefined;
}
export interface ZipFileInformation {
  file: string | Buffer;
  files: AdmZip.IZipEntry[];
  cryptoProvider: CryptoProvider;
  find: (entryPath: string) => AdmZip.IZipEntry | undefined,
  getFile: (entry: AdmZip.IZipEntry, options?: GetFileOption) => Promise<Buffer | string>
  extractAll: (unzipPath: string, overwrite?: boolean) => Promise<void>;
  logger: Logger;
}

function find(this: ZipFileInformation, entryPath: string): AdmZip.IZipEntry | undefined {
  return this.files.find(entry => entryPath === entry.entryName);
}

async function getFile(this: ZipFileInformation, entry: AdmZip.IZipEntry, options: GetFileOption = { encoding: undefined, end: undefined }) {
  const { encoding, end } = options;
  let file = await new Promise<Buffer>((resolveFile) => {
    let data = Buffer.from([]);
    const readable = Readable.from(entry.getData());
    const bindedConditionally = conditionally.bind(readable);
    readable
      .pipe(bindedConditionally(isExists(end), createSliceStream(0, end)))
      .pipe(bindedConditionally(this.cryptoProvider && !!this.cryptoProvider.isStreamMode,
        createCryptoStream(entry.entryName, Infinity, this.cryptoProvider, Purpose.READ_IN_DIR)))
      .on('data', (chunk: Uint8Array) => { data = Buffer.concat([data, chunk]); })
      .on('end', () => { resolveFile(data); });
  });
  if (this.cryptoProvider && !this.cryptoProvider.isStreamMode) {
    file = await this.cryptoProvider.run(file, entry.entryName, Purpose.READ_IN_DIR);
  }
  if (isExists(encoding)) {
    return trimEnd(file).toString(encoding);
  }
  return file;
}

async function extractAll(this: ZipFileInformation, unzipPath: string, overwrite = true): Promise<void> {
  if (overwrite) {
    fs.removeSync(unzipPath);
  }
  fs.mkdirpSync(unzipPath);
  const zip = new AdmZip();
  await Promise.all(this.files.map(async (entry) => {
    if (this.cryptoProvider && !entry.isDirectory) {
      entry.setData(await this.cryptoProvider.run(entry.getData(), entry.entryName, Purpose.WRITE));
    }
    zip.addFile(entry.entryName, entry.getData());
  }));
  zip.extractAllTo(unzipPath);
}

export default async function openZip(file: string | Buffer, cryptoProvider: CryptoProvider, logger: Logger): Promise<ZipFileInformation> {
  try {
    const files = new AdmZip(file).getEntries();
    return {
      file,
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

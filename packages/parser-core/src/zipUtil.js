import fs from 'fs-extra';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

import { trimEnd } from './bufferUtil';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import { isExists } from './typecheck';
import { conditionally } from './streamUtil';
import Errors, { createError } from './errors';

/**
 * @typedef GetFileOptions
 * @property {string} encoding
 * @property {number} end
 */

/**
 * @typedef {Object} ZipFileInformation
 * @property {string} file
 * @property {AdmZip.IZipEntry[]} files
 * @property {CryptoProvider} cryptoProvider
 * @property {(entryPath: string) => AdmZip.IZipEntry} find
 * @property {(entry: AdmZip.IZipEntry, options?: GetFileOptions) => Promise<Buffer | String>} getFile
 * @property {(unzipPath: string, overwrite?: boolean) => Promise<any>} extractAll
 * @property {import('./Logger').default} logger
 */

/**
 * Find the file with a path.
 * @param {string} entryPath File Path
 * @returns {AdmZip.IZipEntry | undefined} A file with path or undefined if there is none.
 * */
function find(entryPath) {
  return this.files.find(entry => entryPath === entry.entryName);
}

/**
 *
 * @async
 * @this {ZipFileInformation}
 * @param {import('adm-zip').IZipEntry} entry
 * @param {GetFileOptions} options
 * @returns {Promise<Buffer | String>} String is encoding is provided, Buffer otherwise
 */
async function getFile(entry, options = { encoding: undefined, end: undefined }) {
  const { encoding, end } = options;
  let file = await new Promise((resolveFile) => {
    const totalSize = Math.min(end || Infinity, entry.uncompressedSize);
    let data = Buffer.from([]);
    const readable = Readable.from(entry.getData());
    readable
      .pipe(conditionally(isExists(end), createSliceStream(0, end)))
      .pipe(conditionally(this.cryptoProvider && !!this.cryptoProvider.isStreamMode,
        createCryptoStream(entry.path, totalSize, this.cryptoProvider, CryptoProvider.Purpose.READ_IN_DIR)))
      .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
      .on('end', () => { resolveFile(data); });
  });
  if (this.cryptoProvider && !this.cryptoProvider.isStreamMode) {
    file = this.cryptoProvider.run(file, entry.path, CryptoProvider.Purpose.READ_IN_DIR);
    if (Promise.resolve(file) === file) {
      file = await file;
    }
  }
  if (isExists(encoding)) {
    file = trimEnd(file).toString(encoding);
  }
  return file;
}

/**
 * Extract zip file to path
 * @this {ZipFileInformation}
 * @param {string} unzipPath Path where files will be extracted
 * @param {boolean} overwrite
 * @returns {Promise<void>}
 */
async function extractAll(unzipPath, overwrite = true) {
  if (overwrite) {
    fs.removeSync(unzipPath);
  }
  fs.mkdirpSync(unzipPath);
  const zip = new AdmZip();
  await Promise.all(this.files.map(async (entry) => {
    if (this.cryptoProvider && !entry.isDirectory) {
      entry.setData(await this.cryptoProvider.run(entry.getData(), entry.entryPath, CryptoProvider.Purpose.WRITE));
    }
    zip.addFile(entry.entryName, entry.getData());
  }));
  zip.extractAllTo(unzipPath);
}

/**
 * @param {string | Buffer} file
 * @param {CryptoProvider} cryptoProvider
 * @param {Logger} logger
 * @returns {ZipFileInformation}
 * @throws {Errors.ENOENT} When file can't be found
 */
export default async function openZip(file, cryptoProvider, logger) {
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
    throw createError(Errors.ENOENT, file);
  }
}

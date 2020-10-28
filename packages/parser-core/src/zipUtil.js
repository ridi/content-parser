/* eslint-disable max-len */
import fs from 'fs-extra';
import StreamChopper from 'stream-chopper';
import AdmZip from 'adm-zip';
import { Readable } from 'stream';

import { trimEnd } from './bufferUtil';
import createCryptoStream from './createCryptoStream';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import { isExists } from './typecheck';
import { conditionally } from './streamUtil';
import Errors, { createError } from './errors';

function find(entryPath) {
  return this.files.find(entry => entryPath === entry.entryName);
}

function _getBufferSize(cryptoProvider) {
  if (isExists(cryptoProvider)) {
    return cryptoProvider.bufferSize;
  }
  return undefined;
}

async function getFile(entry, options = {}) {
  const { encoding, end } = options;
  let file = await new Promise((resolve, reject) => {
    const totalSize = Math.min(end || Infinity, entry.uncompressedSize);
    const bufferSize = _getBufferSize(this.cryptoProvider);
    let data = Buffer.from([]);
    const readable = Readable.from(entry.getData());
    readable
      .pipe(conditionally(isExists(bufferSize), new StreamChopper({ size: Math.min(bufferSize, entry.uncompressedSize) })))
      .pipe(conditionally(isExists(end), createSliceStream(0, end)))
      .pipe(conditionally(this.cryptoProvider && !!this.cryptoProvider.isStreamMode, createCryptoStream(entry.path, totalSize, this.cryptoProvider, CryptoProvider.Purpose.READ_IN_ZIP)))
      .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
      .on('error', e => reject(e))
      .on('end', () => resolve(data));
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

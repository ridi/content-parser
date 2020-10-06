/* eslint-disable max-len */
import fs from 'fs-extra';
import path from 'path';
import StreamChopper from 'stream-chopper';
import unzipper from 'unzipper';

import { trimEnd } from './bufferUtil';
import createSliceStream from './createSliceStream';
import CryptoProvider from './CryptoProvider';
import { isExists, isString } from './typecheck';
import { safePathJoin } from './pathUtil';
import { conditionally } from './streamUtil';

function find(entryPath) {
  return this.files.find(entry => entryPath === entry.path);
}

function _getBufferSize(cryptoProvider) {
  if (isExists(cryptoProvider)) {
    return cryptoProvider.bufferSize;
  }
  return undefined;
}

async function getFile(entry, options = {}) {
  console.log('zipUtil getFile');
  const { encoding, end } = options;
  let file = await new Promise((resolve, reject) => {
    // const totalSize = Math.min(end || Infinity, entry.uncompressedSize);
    const bufferSize = _getBufferSize(this.cryptoProvider);
    let data = Buffer.from([]);
    entry.stream() // is DuplexStream.
      .pipe(conditionally(isExists(bufferSize), new StreamChopper({ size: Math.min(bufferSize, entry.uncompressedSize) })))
      .pipe(conditionally(isExists(end), createSliceStream(0, end)))
      // .pipe(conditionally(isExists(this.cryptoProvider), createCryptoStream(entry.path, totalSize, this.cryptoProvider, CryptoProvider.Purpose.READ_IN_ZIP)))
      .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
      .on('error', e => reject(e))
      .on('end', () => resolve(data));
  });
  if (this.cryptoProvider) {
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
  console.log('zipUtil extractAll');
  if (overwrite) {
    fs.removeSync(unzipPath);
  }
  fs.mkdirpSync(unzipPath);
  const flags = overwrite ? 'w' : 'wx';
  const writeFile = (entry, output) => {
    return new Promise((resolve, reject) => {
      const bufferSize = _getBufferSize(this.cryptoProvider);
      const writeStream = fs.createWriteStream(output, { encoding: 'binary', flags });
      const onError = (error) => {
        writeStream.end();
        reject(error);
      };
      let data = Buffer.from([]);
      writeStream.on('error', onError);
      writeStream.on('close', resolve);
      // Stream is DuplexStream.
      entry.stream()
        .pipe(conditionally(isExists(bufferSize), new StreamChopper({ size: Math.min(bufferSize, entry.uncompressedSize) })))
        .on('error', onError)
        .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
        .on('end', () => {
          if (this.cryptoProvider) {
            data = this.cryptoProvider.run(data, entry.path, CryptoProvider.Purpose.WRITE);
            if (Promise.resolve(data) === data) {
              data.then(result => {
                writeStream.write(result);
                writeStream.end();
              });
            } else {
              writeStream.write(data);
              writeStream.end();
            }
          } else {
            writeStream.write(data);
            writeStream.end();
          }
        });
    });
  };

  await this.files.reduce((prevPromise, entry) => {
    return prevPromise.then(async () => {
      const output = safePathJoin(unzipPath, entry.path);
      if (entry.path.split('/').length > 1) {
        const dir = path.dirname(output);
        if (!fs.existsSync(dir)) {
          fs.mkdirpSync(dir);
        }
      }
      if (!entry.path.endsWith('/')) {
        const error = await writeFile(entry, output);
        if (error) {
          throw error;
        }
      }
    });
  }, Promise.resolve());
}

export default async function openZip(file, cryptoProvider, logger) {
  const open = (!isString(file)) ? unzipper.Open.buffer : unzipper.Open.file;
  const zip = await open(file);
  zip.cryptoProvider = cryptoProvider;
  return {
    ...zip,
    find,
    getFile,
    extractAll,
    logger,
  };
}

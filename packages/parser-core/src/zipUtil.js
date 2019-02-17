import fs from 'fs-extra';
import path from 'path';
import unzipper from 'unzipper';

import createCryptoStream from './createCryptoStream';
import createRangeStream from './createRangeStream';
import CryptoProvider from './CryptoProvider';
import { isExists, isString } from './typecheck';
import { safePathJoin } from './pathUtil';

function find(entryPath) {
  return this.files.find(entry => entryPath === entry.path);
}

async function getFile(entry, options = {}) {
  const { encoding, end } = options;
  let file = await new Promise((resolve, reject) => {
    const totalSize = Math.min(end || Infinity, entry.uncompressedSize);
    let data = Buffer.from([]);
    const stream = entry.stream();
    stream // is DuplexStream.
      .pipe(createRangeStream(0, end))
      .pipe(createCryptoStream(entry.path, totalSize, this.cryptoProvider, CryptoProvider.Purpose.READ_IN_ZIP))
      .on('data', (chunk) => { data = Buffer.concat([data, chunk]); })
      .on('error', e => reject(e))
      .on('end', () => resolve(data));
  });
  if (isExists(encoding)) {
    file = file.toString(encoding);
  }
  return file;
}

async function extractAll(unzipPath, overwrite = true) {
  if (overwrite) {
    fs.removeSync(unzipPath);
  }
  fs.mkdirpSync(unzipPath);

  const writeFile = (entry, output) => {
    return new Promise((resolve) => {
      const writeStream = fs.createWriteStream(output, { encoding: 'binary' });
      const onError = (error) => {
        resolve(error);
        writeStream.end();
      };
      writeStream.on('error', onError);
      writeStream.on('close', () => resolve());
      entry.stream() // is DuplexStream.
        .on('error', onError)
        .on('data', (chunk) => {
          /* istanbul ignore if */
          if (isExists(this.cryptoProvider)) {
            /* istanbul ignore next */
            chunk = this.cryptoProvider.run(chunk, entry.path, CryptoProvider.Purpose.WRITE);
          }
          writeStream.write(chunk);
        })
        .on('finish', () => writeStream.end());
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
          this.logger.error(error);
        }
      }
    });
  }, Promise.resolve());
}

export default async function openZip(file, cryptoProvider, logger) {
  let open = unzipper.Open.file;
  if (!isString(file)) {
    open = unzipper.Open.buffer;
  }
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

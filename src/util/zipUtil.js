import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

import { createDirectory, removeDirectory } from './directory';
import { safePathJoin } from './pathUtil';
import { isExists, isString } from './typecheck';

function find(entryPath) {
  return this.files.find(entry => entryPath === entry.path);
}

async function getFile(entry, encoding) {
  let buffer = await entry.buffer();
  if (isExists(this.cryptoProvider)) {
    buffer = this.cryptoProvider.run(buffer, path.basename(entry.path));
  }
  if (isExists(encoding)) {
    return buffer.toString(encoding);
  }
  return buffer;
}

async function extractAll(unzipPath, overwrite = true) {
  if (overwrite) {
    removeDirectory(unzipPath);
  }
  createDirectory(unzipPath);

  await this.files.reduce((prevPromise, entry) => { // eslint-disable-line arrow-body-style
    return prevPromise.then(async () => {
      const output = safePathJoin(unzipPath, entry.path);
      if (entry.path.split('/').length > 1) {
        const dir = path.dirname(output);
        if (!fs.existsSync(dir)) {
          createDirectory(dir);
        }
      }
      const writeStream = fs.createWriteStream(output);
      await entry.stream()
        .on('data', (data) => {
          if (isExists(this.cryptoProvider)) {
            writeStream.write(this.cryptoProvider.run(data, path.basename(entry.path)));
          } else {
            writeStream.write(data);
          }
        })
        .on('error', () => {
          writeStream.close();
        })
        .on('finish', () => {
          writeStream.close();
        });
    });
  }, Promise.resolve());
}

export default async function openZip(file, cryptoProvider) {
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
  };
}

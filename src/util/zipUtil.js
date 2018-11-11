import fs from 'fs';
import path from 'path';
import unzipper from 'unzipper';

import { createDirectory, removeDirectory } from './directory';
import { safePathJoin } from './pathUtil';
import { isExists } from './typecheck';

function find(entryPath) {
  return this.files.find(entry => entryPath === entry.path);
}

async function getFile(entry, encoding) {
  const file = await entry.buffer();
  if (isExists(encoding)) {
    return file.toString(encoding);
  }
  return file;
}

function extractAll(unzipPath, overwrite = true) {
  return new Promise((resolve, reject) => {
    if (overwrite) {
      removeDirectory(unzipPath);
    }
    createDirectory(unzipPath);

    let count = 0;
    this.files.forEach((entry) => {
      const output = safePathJoin(unzipPath, entry.path);
      if (entry.path.split('/').length > 1) {
        const dir = path.dirname(output);
        if (!fs.existsSync(dir)) {
          createDirectory(dir);
        }
      }
      entry.stream()
        .pipe(fs.createWriteStream(output))
        .on('error', reject)
        .on('finish', () => {
          if (count === this.files.length - 1) {
            resolve();
          } else {
            count += 1;
          }
        });
    });
  });
}

export default async function openZip(file) {
  const zip = await unzipper.Open.file(file);
  return {
    ...zip,
    find,
    getFile,
    extractAll,
  };
}

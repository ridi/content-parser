import StreamZip from 'node-stream-zip';

import { isExists } from './typecheck';
import { createDirectory, removeDirectory } from './directory';

export function openZip(file) {
  return new Promise((resolve, reject) => {
    const zip = new StreamZip({ file });
    zip.on('ready', () => {
      resolve(zip);
    });
    zip.on('error', (err) => {
      reject(err);
    });
  });
}

export function extractAll(zip, unzipPath, overwrite = true, close = false) {
  return new Promise((resolve, reject) => {
    if (overwrite) {
      removeDirectory(unzipPath);
    }
    createDirectory(unzipPath);

    zip.extract(null, unzipPath, (err) => {
      if (close) {
        zip.close();
      }
      if (isExists(err)) {
        reject(err);
      } else {
        resolve();
      }
    });
  });
}

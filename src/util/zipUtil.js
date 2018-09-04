import StreamZip from 'node-stream-zip';

import { isExists } from './typecheck';
import { createDirectory, removeDirectory } from './directory';
import mergeObjects from './mergeObjects';

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

export function extractAll(zip, unzipPath, options = {}) {
  return new Promise((resolve, reject) => {
    options = mergeObjects({
      createIntermediateDirectories: true,
      removePreviousFile: true,
      close: false,
    }, options);

    const { close, createIntermediateDirectories, removePreviousFile } = options;
    if (removePreviousFile) {
      removeDirectory(unzipPath);
    }
    if (createIntermediateDirectories) {
      createDirectory(unzipPath);
    }

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

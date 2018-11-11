import fs from 'fs';
import path from 'path';

import { getPathes, safePath } from './pathUtil';
import openZip from './zipUtil';

function create(source, entries) {
  return {
    first: entries[0],
    find: entryPath => entries.find(entry => entryPath === entry.entryPath),
    map: callback => entries.map(callback),
    forEach: callback => entries.forEach(callback),
    length: entries.length,
    source,
  };
}

function fromZip(zip) {
  return create(zip, Object.values(zip.files).reduce((entries, entry) => { // eslint-disable-line arrow-body-style
    return entries.concat([{
      entryPath: entry.path,
      getFile: encoding => zip.getFile(entry, encoding),
      size: () => entry.uncompressedSize,
      method: entry.compressionMethod,
      extraFieldLength: entry.extraFieldLength,
    }]);
  }, []));
}

function fromDirectory(dir) {
  return create(dir, getPathes(dir).reduce((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    return entries.concat([{
      entryPath: safePath(fullPath).substring(subPathOffset),
      getFile: async (encoding) => {
        const file = await new Promise((resolve, reject) => {
          fs.readFile(fullPath, encoding, (err, data) => {
            if (err) {
              reject(err);
            } else {
              resolve(data);
            }
          });
        });
        return file;
      },
      size: () => fs.lstatSync(fullPath).size,
    }]);
  }, []));
}

export default function readEntries(input) {
  return new Promise((resolve) => {
    if (fs.lstatSync(input).isFile()) {
      openZip(input).then((zip) => {
        resolve(fromZip(zip));
      });
    } else {
      resolve(fromDirectory(input));
    }
  });
}

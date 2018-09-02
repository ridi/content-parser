import fs from 'fs';
import path from 'path';

import { getPathes, safePath } from './pathUtil';
import { isExists } from './typecheck';
import { openZip } from './zipUtil';

function fromZip(zip) {
  return Object.values(zip.entries()).reduce((entries, entry) => { // eslint-disable-line arrow-body-style
    return entries.concat([{
      entryName: entry.name,
      getFile: (encoding) => {
        if (isExists(encoding)) {
          return zip.entryDataSync(entry).toString(encoding);
        }
        return zip.entryDataSync(entry);
      },
      getSize: () => entry.size,
      method: entry.method,
      extraLength: entry.extraLen,
    }]);
  }, []);
}

function fromDirectory(dir) {
  return getPathes(dir).reduce((entries, fullPath) => {
    const subPathOffset = path.normalize(dir).length + path.sep.length;
    return entries.concat([{
      entryName: safePath(fullPath).substring(subPathOffset),
      getFile: encoding => fs.readFileSync(fullPath, encoding),
      getSize: () => fs.lstatSync(fullPath).size,
    }]);
  }, []);
}

export const findEntry = (entries, entryName) => entries.find(entry => entry.entryName === entryName);

export function readEntries(input) {
  return new Promise((resolve) => {
    if (fs.lstatSync(input).isFile()) {
      openZip(input).then((zip) => {
        resolve({ entries: fromZip(zip), zip });
      });
    } else {
      resolve({ entries: fromDirectory(input) });
    }
  });
}

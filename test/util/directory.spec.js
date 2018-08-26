import { should } from 'chai';
import fs from 'fs';
import path from 'path';

import { createDirectory, removeDirectory } from '../../src/util/directory';
import { safeDirname } from '../../src/util/pathUtil';

should(); // Initialize should

describe('Util - Directory manage', () => {
  it('createDirectory and removeDirectory test', () => {
    [
      {
        createPath: path.join('.', 'temp', 'a', 'b', 'c'),
        removePath: path.join('.', 'temp'),
      },
      {
        createPath: path.join('temp', '..', 'temp', 'a', 'b', 'c'),
        removePath: path.join('temp'),
      },
      {
        createPath: path.join('~', 'temp', 'a', 'b', 'c'),
        removePath: path.join('~'),
      },
      {
        createPath: path.join(process.cwd(), 'temp', 'a', 'b', 'c'),
        removePath: path.join(process.cwd(), 'temp'),
      },
    ].forEach((item) => {
      createDirectory(item.createPath);
      fs.existsSync(item.createPath).should.be.true;
      fs.lstatSync(item.createPath).isDirectory().should.be.true;
      removeDirectory(item.removePath);
      let current = item.createPath;
      while (current.length > item.removePath.length) {
        fs.existsSync(current).should.be.false;
        current = safeDirname(current);
      }
    });
  });
});

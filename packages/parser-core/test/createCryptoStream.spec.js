import { assert } from 'chai';
import fs from 'fs';

import createCryptoStream from '../src/createCryptoStream';
import Paths from '../../../test/paths';
import TestCryptoProvider from '../../epub-parser/test/TestCryptoProvider';
import TestPromiseCryptoProvider from '../../epub-parser/test/TestPromiseCryptoProvider';


describe('Util - createCryptoStream', () => {
  it('Always send a size that can be divided by 16', () => {
    const filePath = Paths.ENCRYPTED_DEFAULT;
    const fileSize = fs.lstatSync(filePath).size;
    const readStream = fs.createReadStream(filePath, { highWaterMark: 111 });
    const provider = new TestCryptoProvider('epub-parser');
    return new Promise((resolve, reject) => {
      let size = 0;
      readStream
        .pipe(createCryptoStream(filePath, fileSize, provider, 'test'))
        .on('error', error => reject(error))
        .on('data', chunk => {
          if (size + chunk.length < fileSize) {
            assert(chunk.length % 16 === 0);
          }
          size += chunk.length;
        })
        .on('end', resolve());
    });
  });
  it('it should work with the cryptoprovider that returnsa promise', () => {
    const filePath = Paths.ENCRYPTED_DEFAULT;
    const fileSize = fs.lstatSync(filePath).size;
    const readStream = fs.createReadStream(filePath, { highWaterMark: 111 });
    const provider = new TestPromiseCryptoProvider('epub-parser');
    return new Promise((resolve, reject) => {
      let size = 0;
      readStream
        .pipe(createCryptoStream(filePath, fileSize, provider, 'test'))
        .on('error', error => reject(error))
        .on('data', chunk => {
          if (size + chunk.length < fileSize) {
            assert(chunk.length % 16 === 0);
          }
          size += chunk.length;
        })
        .on('end', resolve());
    });
  });
});

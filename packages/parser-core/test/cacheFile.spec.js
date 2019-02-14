import { assert, should } from 'chai';
import fs from 'fs';

import {
  getCachePath,
  removeCacheFile,
  removeAllCacheFiles,
  readCacheFile,
  writeCacheFile,
} from '../src/cacheFile';

import Errors from '../src/errors';

should(); // Initialize should

describe('Util - read/write cache file', () => {
  const key = 'key';
  const value = '껄껄';

  it('Access to non-existent key', () => {
    assert(readCacheFile(key) === null);
  });

  it('Access to existent key', () => {
    writeCacheFile(key, value);
    readCacheFile(key).should.equal(value);

    writeCacheFile(key, value);
    readCacheFile(key).should.equal(`${value}${value}`);
  });

  it('Overwrite cache by existent key', () => {
    writeCacheFile(key, value, true);
    readCacheFile(key).should.equal(value);
  });

  it('Cache by invalid key', () => {
    try { writeCacheFile(undefined, value); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }
  });

  it('Remove cache by key', () => {
    removeCacheFile(key);
    assert(readCacheFile(key) === null);
    removeCacheFile(key); // retry
  });

  it('Remove all caches', () => {
    removeAllCacheFiles();
    fs.existsSync(getCachePath()).should.be.false;
    removeAllCacheFiles(); // retry
  });
});

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
  const value = 'value';

  it('cache test', () => {
    assert(readCacheFile(key) === null);

    writeCacheFile(key, value);
    readCacheFile(key).should.equal(value);

    writeCacheFile(key, value);
    readCacheFile(key).should.equal(`${value}${value}`);

    writeCacheFile(key, value, true);
    readCacheFile(key).should.equal(value);

    try { writeCacheFile(undefined, value); } catch (e) { e.code.should.equal(Errors.EINVAL.code); }

    removeAllCacheFiles();
    fs.existsSync(getCachePath()).should.be.false;
  });
});

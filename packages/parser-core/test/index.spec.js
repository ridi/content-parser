import { assert } from 'chai';

import {
  getCachePath, removeCacheFile, removeAllCacheFiles, readCacheFile, writeCacheFile,
  AesCryptor, CryptoProvider,
  Errors, createError, mustOverride,
  Logger,
  LogLevel,
  mergeObjects,
  parseBool,
  Parser,
  safeDirname, safePath, safePathJoin, getPathes,
  readEntries,
  stringContains,
  getType, isArray, isBool, isExists, isFunc, isObject, isString, isUrl,
  validateOptions,
  openZip,
} from '../lib/index';

describe('parser-core', () => {
  it('Check imports', () => {
    assert(getCachePath !== null);
    assert(removeCacheFile !== null);
    assert(removeAllCacheFiles !== null);
    assert(readCacheFile !== null);
    assert(writeCacheFile !== null);

    assert(CryptoProvider.constructor !== null);
    assert(CryptoProvider.Purpose !== null);
    assert(AesCryptor.constructor !== null);
    assert(AesCryptor.hex !== null);
    assert(AesCryptor.utf8 !== null);
    assert(AesCryptor.Modes !== null);
    assert(AesCryptor.Counter !== null);
    assert(AesCryptor.Padding !== null);

    assert(Errors !== null);
    assert(createError !== null);
    assert(mustOverride !== null);

    assert(Logger.constructor !== null);
    assert(LogLevel !== null);

    assert(mergeObjects !== null);

    assert(parseBool !== null);

    assert(Parser.constructor !== null);
    assert(Parser.Action !== null);

    assert(safeDirname !== null);
    assert(safePath !== null);
    assert(safePathJoin !== null);
    assert(getPathes !== null);

    assert(readEntries !== null);

    assert(stringContains !== null);

    assert(getType !== null);
    assert(isArray !== null);
    assert(isBool !== null);
    assert(isExists !== null);
    assert(isFunc !== null);
    assert(isObject !== null);
    assert(isString !== null);
    assert(isUrl !== null);

    assert(validateOptions !== null);

    assert(openZip !== null);
  });
});

import { createDirectory, removeDirectory } from './directory';
import mergeObjects from './mergeObjects';
import stringContains from './stringContains';
import validateOptions from './validateOptions';
import openZip from './zip';

import {
  safeDirname,
  safePath,
  safePathJoin,
  safePathNormalize,
  getPathes,
} from './pathUtil';

import {
  getType,
  isArray,
  isExists,
  isObject,
  isString,
  isUrl,
} from './typecheck';

export {
  createDirectory,
  removeDirectory,

  mergeObjects,

  safeDirname,
  safePath,
  safePathJoin,
  safePathNormalize,
  getPathes,

  stringContains,

  validateOptions,

  openZip,

  getType,
  isArray,
  isExists,
  isObject,
  isString,
  isUrl,
};

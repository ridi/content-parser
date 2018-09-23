import aes from 'aes-js';

import Errors, { createError } from '../constant/errors';
import {
  isExists,
  isObject,
  isString,
  getType,
} from './typecheck';
import mergeObjects from './mergeObjects';
import stringContains from './stringContains';
import validateOptions from './validateOptions';

const { hex, utf8 } = aes.utils;

const defaultConfigTypes = {
  key: 'String|Buffer|Uint8Array|Array',
  padding: 'String',
};

const Modes = Object.freeze({
  ECB: { // Electronic Codebook (key)
    name: 'ECB',
    op: aes.ModeOfOperation.ecb,
    configTypes: defaultConfigTypes,
  },
  CBC: { // Cipher-Block Chaining (key + iv)
    name: 'CBC',
    op: aes.ModeOfOperation.cbc,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CFB: { // Cipher Feedback (key + IV + segmentSize)
    name: 'CFB',
    op: aes.ModeOfOperation.cfb,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
      segmentSize: 'Number',
    }),
  },
  OFB: { // Output Feedback (key + IV)
    name: 'OFB',
    op: aes.ModeOfOperation.ofb,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CTR: { // Counter (key + Counter)
    name: 'CTR',
    op: aes.ModeOfOperation.ctr,
    configTypes: mergeObjects(defaultConfigTypes, {
      counter: 'Counter',
    }),
  },
});

const { Counter } = aes;

const { pkcs7 } = aes.padding;

const Padding = Object.freeze({
  PKCS7: 'pkcs7',
  NONE: 'none',
});

class Cryptor {
  constructor(mode, config) {
    if (!isExists(mode)) {
      throw createError(Errors.EREQPRM, 'mode');
    } else if (!isObject(mode) || !stringContains(Object.keys(Modes), mode.name)) {
      throw createError(Errors.EINVAL, 'mode', 'mode', 'use Modes');
    }
    if (!isExists(config)) {
      throw createError(Errors.EREQPRM, 'config');
    }
    if (!isExists(config.key)) {
      throw createError(Errors.EREQPRM, 'config.key');
    }
    switch (mode.name) {
      case Modes.CFB.name:
        if (!isExists(config.segmentSize)) {
          throw createError(Errors.EREQPRM, 'config.segmentSize');
        }
      case Modes.CBC.name: // eslint-disable-line no-fallthrough
      case Modes.OFB.name:
        if (!isExists(config.iv)) {
          throw createError(Errors.EREQPRM, 'config.iv');
        }
        break;
      case Modes.CTR.name:
        if (!isExists(config.counter)) {
          throw createError(Errors.EREQPRM, 'config.counter');
        }
        break;
      default: break;
    }
    validateOptions(config, mode.configTypes, true);
    this.padding = config.padding || Padding.NONE;
    this.operator = this.makeOperator(mode, config);
    Object.freeze(this);
  }

  makeOperator(mode, config) {
    const {
      key, iv, segmentSize, counter,
    } = config;
    let keyBytes = key;
    if (isString(key)) {
      keyBytes = pkcs7.pad(utf8.toBytes(key));
    }
    switch (mode.name) {
      case Modes.ECB.name: return new mode.op(keyBytes); // eslint-disable-line new-cap
      case Modes.CBC.name: return new mode.op(keyBytes, iv); // eslint-disable-line new-cap
      case Modes.CFB.name: return new mode.op(keyBytes, iv, segmentSize); // eslint-disable-line new-cap
      case Modes.OFB.name: return new mode.op(keyBytes, iv); // eslint-disable-line new-cap
      case Modes.CTR.name: return new mode.op(keyBytes, counter); // eslint-disable-line new-cap
      /* istanbul ignore next: untestable */
      default: return undefined;
    }
  }

  encrypt(bytes) {
    if (!stringContains(['Buffer', 'Uint8Array', 'Array'], getType(bytes))) {
      throw createError(Errors.EINVAL, 'bytes type', 'reason', 'require Buffer or Uint8Array or Array');
    }
    if (this.padding === Padding.PKCS7) {
      return this.operator.encrypt(pkcs7.pad(bytes));
    }
    return this.operator.encrypt(bytes);
  }

  decrypt(bytes) {
    if (!stringContains(['Buffer', 'Uint8Array', 'Array'], getType(bytes))) {
      throw createError(Errors.EINVAL, 'bytes type', 'reason', 'require Buffer or Uint8Array or Array');
    }
    const decryptedBytes = this.operator.decrypt(bytes);
    if (this.padding === Padding.PKCS7) {
      return pkcs7.strip(decryptedBytes);
    }
    return decryptedBytes;
  }
}

export {
  hex,
  utf8,
  Modes,
  Counter,
  Padding,
};

export default Cryptor;

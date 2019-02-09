import aes from 'aes-js';

import Errors, { createError } from './errors';
import mergeObjects from './mergeObjects';
import stringContains from './stringContains';
import validateOptions from './validateOptions';

import {
  isExists,
  isObject,
  isString,
  getType,
} from './typecheck';

const { ModeOfOperation, Counter } = aes;

const { hex, utf8 } = aes.utils;

const { pkcs7 } = aes.padding;

const Padding = Object.freeze({
  AUTO: 'auto',
  PKCS7: 'pkcs7',
  NONE: 'none',
});

const defaultConfigTypes = {
  key: 'String|Buffer|Uint8Array|Array',
  padding: 'String',
};

const Modes = Object.freeze({
  ECB: { // Electronic Codebook (key)
    name: 'ECB',
    op: ModeOfOperation.ecb,
    configTypes: defaultConfigTypes,
  },
  CBC: { // Cipher-Block Chaining (key + iv)
    name: 'CBC',
    op: ModeOfOperation.cbc,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CFB: { // Cipher Feedback (key + IV + segmentSize)
    name: 'CFB',
    op: ModeOfOperation.cfb,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
      segmentSize: 'Number',
    }),
  },
  OFB: { // Output Feedback (key + IV)
    name: 'OFB',
    op: ModeOfOperation.ofb,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CTR: { // Counter (key + Counter)
    name: 'CTR',
    op: ModeOfOperation.ctr,
    configTypes: mergeObjects(defaultConfigTypes, {
      counter: 'Counter',
    }),
  },
});

const checkDataType = (data) => {
  if (!stringContains(['Buffer', 'Uint8Array', 'Array'], getType(data))) {
    throw createError(Errors.EINVAL, 'bytes type', 'reason', 'require Buffer or Uint8Array or Array');
  }
};

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
    this.operator = this.makeOperator(mode, config);
    Object.freeze(this);
  }

  makeOperator(mode, config) {
    const {
      key, iv, segmentSize, counter,
    } = config;
    let keyBytes = key;
    if (isString(key)) {
      if (key.length % 16 === 0) {
        keyBytes = utf8.toBytes(key);
      } else {
        keyBytes = pkcs7.pad(utf8.toBytes(key));
      }
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

  encrypt(bytes, padding = Padding.NONE) {
    checkDataType(bytes);
    if (padding === Padding.PKCS7 || (padding === Padding.AUTO && bytes.length % 16 !== 0)) {
      return this.operator.encrypt(pkcs7.pad(bytes));
    }
    return this.operator.encrypt(bytes);
  }

  decrypt(bytes, padding = Padding.NONE) {
    checkDataType(bytes);
    const decryptedBytes = Buffer.from(this.operator.decrypt(bytes));
    if (padding === Padding.PKCS7 || padding === Padding.AUTO) {
      try {
        return pkcs7.strip(decryptedBytes);
      } catch (e) {
        if (padding !== Padding.AUTO) {
          throw e;
        }
      }
    }
    return decryptedBytes;
  }
}

Cryptor.hex = hex;
Cryptor.utf8 = utf8;
Cryptor.Modes = Modes;
Cryptor.Counter = Counter;
Cryptor.Padding = Padding;

export default Cryptor;

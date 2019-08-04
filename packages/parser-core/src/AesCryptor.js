/* eslint-disable no-bitwise, no-plusplus */
import CryptoJs from 'crypto-js';

import Errors, { createError } from './errors';
import mergeObjects from './mergeObjects';
import { stringContains } from './stringContains';
import validateOptions from './validateOptions';

import { isExists, isObject, isString } from './typecheck';

const {
  pad, enc, mode: aesMode, AES,
} = CryptoJs;
const { Pkcs7 } = pad;
const { Utf8, Hex } = enc;

const Padding = Object.freeze({
  AUTO: {
    name: 'auto',
    op: Pkcs7,
    pad: data => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  PKCS7: {
    name: 'pkcs7',
    op: pad.Pkcs7,
    pad: data => Pkcs7.pad(data, 4),
    unpad: Pkcs7.unpad,
  },
  NONE: {
    name: 'none',
    op: pad.NoPadding,
  },
});

const Uint8 = {
  decode: (uint8Array) => {
    const len = uint8Array.length;
    const words = [];
    let i = 0;
    while (i < len) {
      words.push((uint8Array[i++] << 24) | (uint8Array[i++] << 16) | (uint8Array[i++] << 8) | (uint8Array[i++]));
    }
    return CryptoJs.lib.WordArray.create(words, words.length * 4);
  },
  encode: (wordArray) => {
    const { words, sigBytes } = wordArray;
    const uint8Array = new Uint8Array(sigBytes);
    let offset = 0;
    let word;
    for (let i = 0; i < words.length; i++) {
      word = words[i];
      uint8Array[offset++] = word >> 24;
      uint8Array[offset++] = (word >> 16) & 0xff;
      uint8Array[offset++] = (word >> 8) & 0xff;
      uint8Array[offset++] = word & 0xff;
    }
    return uint8Array;
  },
};

const Encoding = Object.freeze({
  UTF8: {
    name: 'utf8',
    decode: Utf8.parse,
    encode: Utf8.stringify,
  },
  HEX: {
    name: 'hex',
    decode: Hex.parse,
    encode: Hex.stringify,
  },
  UINT8: {
    name: 'uint8',
    decode: Uint8.decode,
    encode: Uint8.encode,
  },
  BUFFER: {
    name: 'buffer',
    decode: data => Uint8.decode(new Uint8Array(data)),
    encode: data => Buffer.from(Uint8.encode(data)),
  },
});

const defaultConfigTypes = {
  key: 'String|Buffer|Uint8Array|Array',
};

const Mode = Object.freeze({
  ECB: { // Electronic Codebook (key)
    name: 'ECB',
    op: aesMode.ECB,
    configTypes: defaultConfigTypes,
  },
  CBC: { // Cipher-Block Chaining (key + iv)
    name: 'CBC',
    op: aesMode.CBC,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CFB: { // Cipher Feedback (key + iv + {segmentSize})
    name: 'CFB',
    op: aesMode.CFB,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  OFB: { // Output Feedback (key + iv)
    name: 'OFB',
    op: aesMode.OFB,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CTR: { // Counter (key + iv + {counter})
    name: 'CTR',
    op: aesMode.CTR,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
});

class AesCryptor {
  constructor(mode, config) {
    if (!isExists(mode)) {
      throw createError(Errors.EREQPRM, 'mode');
    } else if (!isObject(mode) || !stringContains(Object.keys(Mode), mode.name)) {
      throw createError(Errors.EINVAL, 'mode', 'mode', 'use Modes');
    }
    if (!isExists(config)) {
      throw createError(Errors.EREQPRM, 'config');
    }
    if (!isExists(config.key)) {
      throw createError(Errors.EREQPRM, 'config.key');
    }
    switch (mode.name) {
      case Mode.CFB.name:
      case Mode.CBC.name:
      case Mode.OFB.name:
      case Mode.CTR.name:
        if (!isExists(config.iv)) {
          throw createError(Errors.EREQPRM, 'config.iv');
        }
        break;
      default: break;
    }
    validateOptions(config, mode.configTypes, true);
    this.operator = this.makeOperator(mode, config);
    Object.freeze(this);
  }

  makeOperator(mode, config) {
    let { key, iv } = config;

    // convert key to WordArray
    if (isString(key)) {
      const { length } = key;
      key = Encoding.UTF8.decode(key);
      if (length % 16 !== 0) {
        Padding.PKCS7.pad(key);
      }
    } else if (Buffer.isBuffer(key)) {
      key = Encoding.BUFFER.decode(key);
    } else if (key instanceof Uint8Array || key instanceof Array) {
      key = Encoding.UINT8.decode(key);
    }

    // convert iv to WordArray
    if (Buffer.isBuffer(iv)) {
      iv = Encoding.BUFFER.decode(iv);
    } else if (iv instanceof Uint8Array || iv instanceof Array) {
      iv = Encoding.UINT8.decode(iv);
    }

    const checkType = (data, allow) => {
      if (!isExists(data)) {
        const message = `require Buffer or Uint8Array or Array${isExists(allow) ? ` ${allow}` : ''}`;
        throw createError(Errors.ECRYT, 'data type', 'reason', message);
      }
      return data;
    };

    // return operator
    const options = { iv, mode: mode.op, padding: Padding.NONE.op };
    return { // Note that all data and return type is a WordArray
      name: mode.name,
      encrypt: data => AES.encrypt(checkType(data, 'or String'), key, options).ciphertext,
      decrypt: (data) => {
        const cipherParams = CryptoJs.lib.CipherParams.create({ ciphertext: checkType(data) });
        return AES.decrypt(cipherParams, key, options);
      },
    };
  }

  encrypt(data, options = {}) {
    const padding = options.padding || Padding.NONE;
    const encoding = options.encoding || Encoding.BUFFER;
    const length = isExists(data) && isExists(data.length) ? data.length : 0;

    // convert data to WordArray
    if (isString(data)) {
      data = Encoding.UTF8.decode(data);
    } else if (Buffer.isBuffer(data)) {
      data = Encoding.BUFFER.decode(data);
    } else if (data instanceof Uint8Array || data instanceof Array) {
      data = Encoding.UINT8.decode(data);
    }

    // padding data if needed as padding type
    if (padding === Padding.PKCS7 || (padding === Padding.AUTO && length % 16 !== 0)) {
      padding.pad(data);
    }

    // encrypt data and convert to encoding type
    return encoding.encode(this.operator.encrypt(data));
  }

  decrypt(data, options = {}) {
    const padding = options.padding || Padding.NONE;
    const encoding = options.encoding || Encoding.BUFFER;

    // convert data to WordArray
    if (Buffer.isBuffer(data)) {
      data = Encoding.BUFFER.decode(data);
    } else if (data instanceof Uint8Array || data instanceof Array) {
      data = Encoding.UINT8.decode(data);
    }

    // decrypt data
    const decryptedData = this.operator.decrypt(data);

    // unpadding data if needed as padding type
    if (padding === Padding.PKCS7 || padding === Padding.AUTO) {
      try {
        const array = Encoding.UINT8.encode(decryptedData);
        if (array.length < 16) {
          throw createError(Errors.ECRYT, 'invalid data length');
        }
        const padder = array[array.length - 1];
        if (padder > 16) {
          throw createError(Errors.ECRYT, 'padding byte out of range');
        }
        const length = array.length - padder;
        for (let i = 0; i < padder; i += 1) {
          if (array[length + i] !== padder) {
            throw createError(Errors.ECRYT, 'invalid padding byte');
          }
        }
        padding.unpad(decryptedData);
      } catch (e) {
        if (padding !== Padding.AUTO) {
          throw createError(Errors.ECRYT, e.message);
        }
      }
    }
    pad.ZeroPadding.unpad(decryptedData);

    // convert WordArray to encoding type
    return encoding.encode(decryptedData);
  }
}

AesCryptor.Padding = Padding;
AesCryptor.Encoding = Encoding;
AesCryptor.Mode = Mode;

export default AesCryptor;

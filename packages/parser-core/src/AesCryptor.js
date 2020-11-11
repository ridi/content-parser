import * as CryptoJs from 'crypto-js';

import { Padding, Encoding } from './cryptoUtil';
import Errors, { createError } from './errors';
import mergeObjects from './mergeObjects';
import { stringContains } from './stringUtil';
import validateOptions from './validateOptions';
import { isExists, isObject, isString } from './typecheck';

const { mode: aesMode, AES } = CryptoJs;

/**
 * @typedef {Object} ModeConfig
 * @property {string} key
 * @property {string} [iv]
*/

/**
 * @type {ModeConfig}
 */
const defaultConfigTypes = {
  key: 'String|Buffer|Uint8Array|Array',
};

/**
 * @typedef {Object} ModeObject
 * @property {string} name
 * @property {import('../type/CryptoJs').BlockCipherMode} op
 * @property {ModeConfig} configTypes
 *
 * @typedef {Object} ModeList
 * @property {ModeObject} ECB
 * @property {ModeObject} CBC
 * @property {ModeObject} CFB
 * @property {ModeObject} OFB
 * @property {ModeObject} CTR
*/

/**
 * @type {ModeList}
*/
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
  /**
   * @typedef {(data: string | CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray} EncodeAndDecode
   * @typedef {Object} Operator
   * @property {string} name
   * @property {EncodeAndDecode} encrypt
   * @property {EncodeAndDecode} decrypt
   */

  /**
   * @private
   * @type {Operator}
   */
  operator;

  /**
   * Construct AesCryptor
   * @param {ModeObject} mode Crypto mode
   * @param {ModeConfig} config Crypto config
   */
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

  /**
   * Make an operator
   * @private
   * @param {ModeObject} mode
   * @param {ModeConfig} config
   * @returns {Operator} Operator
   */
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

  /**
   * @typedef {Object} CryptOption
   * @property {import('./cryptoUtil').PaddingObject} padding
   * @property {import('./cryptoUtil').EncodingObject} encoding
   */

  /**
   * Encrypt string
   * @param {string} data
   * @param {CryptOption} options
   * @returns {string} encrypted string
   */
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

  /**
   * Decrupt string
   * @param {string} data
   * @param {CryptOption} options
   * @returns {string} decrypted string
   */
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

    // convert WordArray to encoding type
    return encoding.encode(decryptedData);
  }
}

AesCryptor.Padding = Padding;
AesCryptor.Encoding = Encoding;
AesCryptor.Mode = Mode;

export default AesCryptor;

export {
  Padding,
  Encoding,
  Mode,
};

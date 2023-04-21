import * as CryptoJs from 'crypto-js';

import { Padding, Encoding, PaddingObject, EncodingObject } from './cryptoUtil';
import Errors, { createError } from './errors';
import mergeObjects from './mergeObjects';
import { stringContains } from './stringUtil';
import { isExists, isObject, isString } from './typecheck';
import validateOptions from './validateOptions';
import { ValueOf } from './helper';

const { mode: aesMode, AES } = CryptoJs;

type WordArray = CryptoJs.lib.WordArray;

type ModeConfig = {
  key: string | WordArray | number[] | Buffer | Uint8Array;
  iv?: WordArray | number[] | Buffer;
};

const defaultConfigTypes: ModeConfig = {
  key: 'String|Buffer|Uint8Array|Array',
};

type BlockCipherMode = ValueOf<typeof CryptoJs.mode>;

type ModeObject = {
  name: string;
  op: BlockCipherMode;
  configTypes: ModeConfig;
};

type ModeList = {
  ECB: ModeObject;
  CBC: ModeObject;
  CFB: ModeObject;
  OFB: ModeObject;
  CTR: ModeObject;
};

const Mode: ModeList = {
  ECB: {
    // Electronic Codebook (key)
    name: 'ECB',
    op: aesMode.ECB,
    configTypes: defaultConfigTypes,
  },
  CBC: {
    // Cipher-Block Chaining (key + iv)
    name: 'CBC',
    op: aesMode.CBC,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CFB: {
    // Cipher Feedback (key + iv + {segmentSize})
    name: 'CFB',
    op: aesMode.CFB,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  OFB: {
    // Output Feedback (key + iv)
    name: 'OFB',
    op: aesMode.OFB,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
  CTR: {
    // Counter (key + iv + {counter})
    name: 'CTR',
    op: aesMode.CTR,
    configTypes: mergeObjects(defaultConfigTypes, {
      iv: 'Buffer|Uint8Array|Array',
    }),
  },
};

type EncodeAndDecode = (data: string | WordArray) => WordArray;

type Operator = {
  name: string;
  encrypt: EncodeAndDecode;
  decrypt: EncodeAndDecode;
};

type CryptOption = {
  padding: PaddingObject;
  encoding: EncodingObject;
};

class AesCryptor {
  static Padding = Padding;
  static Encoding = Encoding;
  static Mode = Mode;

  private operator: Operator;

  /**
   * Construct AesCryptor
   */
  constructor(mode: ModeObject, config: ModeConfig) {
    if (!isExists(mode)) {
      throw createError(Errors.EREQPRM, 'mode');
    } else if (
      !isObject(mode) ||
      !stringContains(Object.keys(Mode), mode.name)
    ) {
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
      default:
        break;
    }
    validateOptions(config, mode.configTypes, true);
    this.operator = this.makeOperator(mode, config);
    Object.freeze(this);
  }

  /**
   * Make an operator
   */
  private makeOperator(mode: ModeObject, config: ModeConfig): Operator {
    let { key, iv } = config;

    // convert key to WordArray
    if (isString(key)) {
      const { length } = key;
      key = Encoding.UTF8.decode(key);
      if (length % 16 !== 0) {
        // ** 콛, 확인필요
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

    const checkType = <T>(data: T, allow?: string) => {
      if (!isExists(data)) {
        const message = `require Buffer or Uint8Array or Array${
          isExists(allow) ? ` ${allow}` : ''
        }`;
        throw createError(Errors.ECRYT, 'data type', 'reason', message);
      }
      return data;
    };

    // return operator
    const options = {
      iv,
      mode: mode.op,
      padding: Padding.NONE.op,
    };
    return {
      // Note that all data and return type is a WordArray
      name: mode.name,
      encrypt: (data) =>
        AES.encrypt(checkType(data, 'or String'), key as any, options)
          .ciphertext,
      decrypt: (data) => {
        const cipherParams = CryptoJs.lib.CipherParams.create({
          ciphertext: checkType(data) as WordArray,
        });
        return AES.decrypt(cipherParams, key as any, options);
      },
    };
  }

  /* eslint-disable no-param-reassign */
  encrypt(
    data: string | Buffer | Uint8Array | number[] | WordArray,
    options: Partial<CryptOption> = {}
  ) {
    const padding = options.padding || Padding.NONE;
    const encoding = options.encoding || Encoding.BUFFER;
    const length =
      isExists(data) && isExists((data as any).length)
        ? (data as any).length
        : 0;

    // convert data to WordArray
    if (isString(data)) {
      data = Encoding.UTF8.decode(data);
    } else if (Buffer.isBuffer(data)) {
      data = Encoding.BUFFER.decode(data);
    } else if (data instanceof Uint8Array || data instanceof Array) {
      data = Encoding.UINT8.decode(data);
    }

    // padding data if needed as padding type
    if (
      padding === Padding.PKCS7 ||
      (padding === Padding.AUTO && length % 16 !== 0)
    ) {
      padding.pad(data);
    }

    // encrypt data and convert to encoding type
    return encoding.encode(this.operator.encrypt(data));
  }
  /* eslint-enable no-param-reassign */

  /**
   * Decrupt string
   * @returns {string} decrypted string
   */
  /* eslint-disable no-param-reassign */
  decrypt(
    data: string | Buffer | Uint8Array | number[] | WordArray,
    options: Partial<CryptOption> = {}
  ) {
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
        const array = Encoding.UINT8.encode(decryptedData) as Uint8Array;
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
  /* eslint-enable no-param-reassign */
}

export default AesCryptor;

export { Padding, Encoding, Mode };

import * as CryptoJs from 'crypto-js';

import { Padding, Encoding } from './cryptoUtil';
import Errors, { createError } from './errors';
import mergeObjects from './mergeObjects';
import { stringContains } from './stringUtil';
import validateOptions from './validateOptions';
import { isExists, isObject, isString } from './typecheck';
import type BaseCryptor from './BaseCryptor';

const { mode: aesMode, AES } = CryptoJs;

type PossibleDataTypes = string | Buffer | Uint8Array | Array<number>;
interface ModeConfig { key: PossibleDataTypes; iv?: Buffer | Uint8Array | Array<number> }
type ModeConfigType = { [key in keyof ModeConfig]: string }

const defaultConfigTypes: Pick<ModeConfigType, 'key'> = {
  key: 'String|Buffer|Uint8Array|Array',
};

interface Cipher {
  keySize: number;
  ivSize: number;
  readonly _ENC_XFORM_MODE: number;
  readonly _DEV_XFORM_MODE: number;
  reset(): void;
  process(dataUpdate: CryptoJS.lib.WordArray | string): CryptoJS.lib.WordArray;
  finalize(dataUpdate?: CryptoJS.lib.WordArray | string): CryptoJS.lib.WordArray;
}

interface Mode {
  processBlock(words: number[], offset: number): void;
}

interface BlockCipherMode {
  createEncryptor(cipher: Cipher): Mode;
}


interface ModeObject {
  name: string;
  op: BlockCipherMode;
  configTypes: ModeConfigType
}

interface IMode {
  readonly ECB: Omit<ModeObject, 'configTypes'> & { configTypes: Pick<ModeConfigType, 'key'> };
  readonly CBC: ModeObject;
  readonly CFB: ModeObject;
  readonly OFB: ModeObject;
  readonly CTR: ModeObject;
}

interface CryptOption {
  padding?: typeof Padding.PKCS7 | typeof Padding.NONE;
  encoding?: typeof Encoding.UTF8 | typeof Encoding.UINT8;
}

export const Mode: IMode = {
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
};

interface Operator {
  name: string;
  encrypt: (data: CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray;
  decrypt: (data: CryptoJs.lib.WordArray) => CryptoJs.lib.WordArray;
}
class AesCryptor implements BaseCryptor {
  private operator: Operator
  /**
   * Construct AesCryptor
   */
  constructor(mode: ModeObject, config: ModeConfig) {
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
    switch (mode) {
      case Mode.CFB:
      case Mode.CBC:
      case Mode.OFB:
      case Mode.CTR:
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

  makeOperator(mode: ModeObject, config: ModeConfig): Operator {
    const { key, iv } = config;

    let keyWordArray: CryptoJS.lib.WordArray;
    let ivWordArray: CryptoJS.lib.WordArray;


    if (isString(key)) {
      keyWordArray = Encoding.UTF8.decode(key as string);
      if (key.length % 16 !== 0) {
        Padding.PKCS7.pad(keyWordArray);
      }
    } else if (Buffer.isBuffer(key)) {
      keyWordArray = Encoding.BUFFER.decode(key);
    } else if (key instanceof Uint8Array || key instanceof Array) {
      keyWordArray = Encoding.UINT8.decode(key);
    }

    if (Buffer.isBuffer(iv)) {
      ivWordArray = Encoding.BUFFER.decode(iv);
    } else if (iv instanceof Uint8Array || iv instanceof Array) {
      ivWordArray = Encoding.UINT8.decode(iv);
    } else {
      throw Error('iv must be buffer or uint8array or array');
    }

    const checkType = (data: CryptoJs.lib.WordArray, allow?: string): CryptoJs.lib.WordArray => {
      if (!isExists(data)) {
        const message = `require Buffer or Uint8Array or Array${isExists(allow) ? ` ${allow}` : ''}`;
        throw createError(Errors.ECRYT, 'data type', 'reason', message);
      }
      return data;
    };

    // return operator
    const options = { ivWordArray, mode: mode.op, padding: Padding.NONE.op };
    return { // Note that all data and return type is a WordArray
      name: mode.name,
      encrypt: (data: CryptoJs.lib.WordArray) => AES.encrypt(checkType(data, 'or String'), keyWordArray, options).ciphertext,
      decrypt: (data: CryptoJs.lib.WordArray) => {
        const cipherParams = CryptoJs.lib.CipherParams.create({ ciphertext: checkType(data) });
        return AES.decrypt(cipherParams, keyWordArray, options);
      },
    };
  }

  encrypt(data: string | Buffer | Uint8Array | number[], options?: CryptOption): string | Uint8Array {

    const encoding = options?.encoding || Encoding.BUFFER;

    let dataWordArray: CryptoJs.lib.WordArray;
    // convert data to WordArray
    if (Buffer.isBuffer(data)) {
      dataWordArray = Encoding.BUFFER.decode(data);
    } else if (data instanceof Uint8Array || data instanceof Array) {
      dataWordArray = Encoding.UINT8.decode(data);
    } else {
      dataWordArray = Encoding.UTF8.decode(data as string);
    }

    if (options?.padding) {
      const paddable = [Padding.PKCS7, Padding.AUTO];
      const length = isExists(data) && isExists(data.length) ? data.length : 0;
      const selected = paddable.find((pad => { options?.padding?.name === pad.name || (options?.padding?.name === pad.name && length % 16 !== 0) }));
      selected?.pad(dataWordArray);
    }

    // encrypt data and convert to encoding type
    return encoding.encode(this.operator.encrypt(dataWordArray));
  }

  decrypt(data: Buffer | Uint8Array | number[], options?: CryptOption): string | Uint8Array {
    const padding = options?.padding || Padding.NONE;
    const encoding = options?.encoding || Encoding.BUFFER;
    let dataWordArray: CryptoJs.lib.WordArray;
    // convert data to WordArray
    if (Buffer.isBuffer(data)) {
      dataWordArray = Encoding.BUFFER.decode(data);
    } else {
      dataWordArray = Encoding.UINT8.decode(data);
    }

    // decrypt data
    const decryptedData = this.operator.decrypt(dataWordArray);

    if (options?.padding) {
      const paddable = [Padding.PKCS7, Padding.AUTO];
      const length = isExists(data) && isExists(data.length) ? data.length : 0;
      const selected = paddable.find((pad => { options?.padding?.name === pad.name || (options?.padding?.name === pad.name && length % 16 !== 0) }));

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
          selected?.unpad(decryptedData);
        } catch (e) {
          if (padding !== Padding.AUTO) {
            throw createError(Errors.ECRYT, e.message);
          }
        }
      }
    }

    // convert WordArray to encoding type
    return encoding.encode(decryptedData);
  }
}

export default AesCryptor;

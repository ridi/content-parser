import Zip from 'adm-zip';
import fs from 'fs';

import Errors from './Errors';
import {
  isBuffer,
  isExists,
  isString,
} from './utils';

const privateProps = new WeakMap();

class EpubLoader {
  static get defaultOptions() {
    return {
      // If specified then this function returns a string. Otherwise it returns a buffer.
      encoding: undefined,
      // If extractHead or extractBody is specified, this function returns an object that is not a string.
      // Otherwise it returns a full string from xhtml or html.
      // If true, extracts head from an xhtml or html file. (e.g. { head: '...' })
      extractHead: false,
      // If true, extracts body from an xhtml or html file. (e.g. { body: '...' })
      extractBody: false,
    };
  }

  static get defaultOptionTypes() {
    return {
      encoding: 'string',
    };
  }

  get input() { return privateProps.get(this).input; }

  get options() { return privateProps.get(this).options; }

  constructor(input) {
    if (isString(input)) {
      if (!fs.existsSync(input)) {
        throw Errors.PATH_NOT_FOUND;
      } else if (!fs.lstatSync(input).isDirectory()) {
        throw Errors.DIRECTROY_INPUT_REQUIRED;
      }
    } else if (!isExists(input) || !isBuffer(input)) {
      throw Errors.INVALID_INPUT;
    }
    privateProps.set(this, { input, zip: isBuffer(input) ? new Zip(input) : undefined });
  }

  read(item, options = {}) {

  }
}

export default EpubLoader;

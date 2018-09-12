import { isExists, isString, stringContains } from '../util';

const Schemes = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
  DOI: 'doi',
  ISBN: 'isbn',
  ISBN13: 'isbn13',
  ISBN10: 'isbn10',
  ISSN: 'issn',
  UUID: 'uuid',
  URI: 'uri',
});

class Identifier {
  constructor(rawObj = {}) {
    if (isString(rawObj)) {
      this.value = rawObj;
    } else {
      this.value = rawObj.value;
    }
    if (isExists(rawObj.scheme)) {
      if (stringContains(Object.values(Schemes), rawObj.scheme)) {
        this.scheme = rawObj.scheme.toLowerCase();
      } else {
        this.scheme = Schemes.UNKNOWN;
      }
    } else {
      this.scheme = Schemes.UNDEFINED;
    }
    Object.freeze(this);
  }

  toRaw() {
    return {
      value: this.value,
      scheme: this.scheme,
    };
  }
}

Identifier.Schemes = Schemes;

export default Identifier;

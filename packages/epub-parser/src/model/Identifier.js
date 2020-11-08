import { isExists, isString, stringContains } from '@ridi/parser-core';

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

/**
 * @typedef {Object} IdentifierParam
 * @property {string} [value]
 * @property {string} [scheme]
 */
class Identifier {
  /**
   * @param {IdentifierParam} rawObj
   */
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

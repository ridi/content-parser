import { isString } from '../util';

class Identifier {
  constructor(rawObj) {
    if (isString(rawObj)) {
      this.value = rawObj;
    } else {
      this.value = rawObj.value;
    }
    this.scheme = (rawObj.scheme || Identifier.Schemes.UNDEFINED).toLowerCase();
    Object.freeze(this);
  }

  toRaw() {
    return {
      value: this.value,
      scheme: this.scheme,
    };
  }
}

Identifier.Schemes = Object.freeze({
  UNDEFINED: 'undefined',
  DOI: 'doi',
  ISBN: 'isbn',
  ISBN13: 'isbn13',
  ISBN10: 'isbn10',
  ISSN: 'issn',
  UUID: 'uuid',
  URI: 'uri',
});

export default Identifier;

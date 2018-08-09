class Identifier {
  constructor(rawObj) {
    this.value = rawObj.value;
    this.scheme = rawObj.scheme || Identifier.Schemes.UNDEFINED;
    Object.freeze(this);
  }
}

Identifier.Schemes = Object.freeze({
  UNDEFINED: 'undefined',
  DOI: 'doi',
  ISBN: 'isbn',
  ISSN: 'issn',
  UUID: 'uuid',
  URI: 'uri',
});

export default Identifier;

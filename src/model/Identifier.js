class Identifier {
  get value() { return this._value; }

  get scheme() { return this._scheme; }
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

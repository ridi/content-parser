const Schemes = Object.freeze({
  UNDEFINED: 'undefined',
  DOI: 'doi',
  ISBN: 'isbn',
  ISSN: 'issn',
  UUID: 'uuid',
  URI: 'uri',
});

class Identifier {
  get value() { return this._value; }

  get scheme() { return this._scheme; }
}

export default Identifier;

export { Schemes };

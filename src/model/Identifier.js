const Schemes = Object.freeze({
  UNDEFINED: Symbol('undefined'),
  DOI: Symbol('doi'),
  ISBN: Symbol('isbn'),
  ISSN: Symbol('issn'),
  UUID: Symbol('uuid'),
  URI: Symbol('uri'),
});

class Identifier {
  get value() { return this._value; }

  get scheme() { return this._scheme; }
}

export default Identifier;

export { Schemes };

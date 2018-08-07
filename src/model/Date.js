const Events = Object.freeze({
  UNDEFINED: Symbol('undefined'),
  CREATION: Symbol('creation'),
  MODIFICATION: Symbol('modification'),
  PUBLICATION: Symbol('publication'),
});

class Date {
  get value() { return this._value; }

  get event() { return this._event; }
}

export default Date;

export { Events };

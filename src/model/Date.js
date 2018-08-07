const Events = Object.freeze({
  UNDEFINED: 'undefined',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

class Date {
  get value() { return this._value; }

  get event() { return this._event; }
}

export default Date;

export { Events };

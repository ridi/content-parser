class Date {
  get value() { return this._value; }

  get event() { return this._event; }
}

Date.Events = Object.freeze({
  UNDEFINED: 'undefined',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

export default Date;

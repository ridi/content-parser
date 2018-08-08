class DateTime {
  get value() { return this._value; }

  get event() { return this._event; }
}

DateTime.Events = Object.freeze({
  UNDEFINED: 'undefined',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

export default DateTime;

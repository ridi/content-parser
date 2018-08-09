class DateTime {
  constructor(rawObj) {
    this.value = rawObj.value;
    this.event = rawObj.event || DateTime.Events.UNDEFINED;
    Object.freeze(this);
  }
}

DateTime.Events = Object.freeze({
  UNDEFINED: 'undefined',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

export default DateTime;

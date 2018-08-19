import { isString } from '../utils';

class DateTime {
  constructor(rawObj) {
    if (isString(rawObj)) {
      this.value = rawObj;
    } else {
      this.value = rawObj.value;
    }
    this.event = (rawObj.event || DateTime.Events.UNDEFINED).toLowerCase();
    Object.freeze(this);
  }

  toRaw() {
    return {
      value: this.value,
      event: this.event,
    };
  }
}

DateTime.Events = Object.freeze({
  UNDEFINED: 'undefined',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

export default DateTime;

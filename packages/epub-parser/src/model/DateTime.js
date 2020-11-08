import { isExists, isString, stringContains } from '@ridi/parser-core';

const Events = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
  CREATION: 'creation',
  MODIFICATION: 'modification',
  PUBLICATION: 'publication',
});

class DateTime {
  /**
   * @type {string}
   */
  value;

  /**
   * @type {string}
   */
  event;

  /**
   * @typedef DateTimeParam
   * @property {string} [value]
   * @property {string} [event]
   */
  /**
   *
   * @param {DateTimeParam} rawObj
   */
  constructor(rawObj = {}) {
    if (isString(rawObj)) {
      this.value = rawObj;
    } else {
      this.value = rawObj.value;
    }
    if (isExists(rawObj.event)) {
      if (stringContains(Object.values(Events), rawObj.event)) {
        this.event = rawObj.event.toLowerCase();
      } else {
        this.event = Events.UNKNOWN;
      }
    } else {
      this.event = Events.UNDEFINED;
    }
    Object.freeze(this);
  }

  toRaw() {
    return {
      value: this.value,
      event: this.event,
    };
  }
}

DateTime.Events = Events;

export default DateTime;

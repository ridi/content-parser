import { isBool, isString } from './typecheck';
import { stringContains } from './stringUtil';
/**
 * Return boolean form of any input
 * @param {any} any
 * @returns {boolean}
 */
export default function parseBool(any) {
  if (isBool(any)) {
    return any;
  }
  return isString(any) ? stringContains(['true', 't', '1', 'yes', 'y'], any) : false;
}

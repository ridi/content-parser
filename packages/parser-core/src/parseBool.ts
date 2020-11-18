/* eslint-disable @typescript-eslint/explicit-module-boundary-types */
/* eslint-disable @typescript-eslint/no-explicit-any */
import { isBool, isString } from './typecheck';
import { stringContains } from './stringUtil';

export default function parseBool(target: any): boolean {
  if (isBool(target)) {
    return target;
  }
  return isString(target) ? stringContains(['true', 't', '1', 'yes', 'y'], target) : false;
}

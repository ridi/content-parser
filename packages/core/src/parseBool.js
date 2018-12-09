import { isBool, isString } from './typecheck';
import stringContains from './stringContains';

export default function parseBool(any) {
  if (isBool(any)) {
    return any;
  }
  return isString(any) ? stringContains(['true', 't', '1', 'yes', 'y'], any) : false;
}

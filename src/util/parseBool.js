import stringContains from './stringContains';
import { isBool, isString } from './typecheck';

export default function parseBool(any) {
  if (isBool(any)) {
    return any;
  }
  return isString(any) ? stringContains(['true', 't', '1', 'yes', 'y'], any) : false;
}

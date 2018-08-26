import { isExists, isString, getType } from './typecheck';
import Errors from '../errors';

export default function validateOptions(options, defaultValues, types) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(options)) {
    if (!isExists(Object.getOwnPropertyDescriptor(defaultValues, key))) {
      return Errors.INVALID_OPTIONS;
    }
    if (isString(types[key])) {
      // eslint-disable-next-line valid-typeof
      if (!isExists(types[key].split('|').find(type => type === getType(options[key])))) {
        return Errors.INVALID_OPTION_VALUE;
      }
    } else {
      return validateOptions(options[key], defaultValues[key], types[key]);
    }
  }
  return undefined;
}

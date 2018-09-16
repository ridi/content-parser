import Errors, { createError } from '../constant/errors';
import { getType, isExists, isString } from './typecheck';

export default function validateOptions(options, types) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(options)) {
    if (!isExists(Object.getOwnPropertyDescriptor(types, key))) {
      throw createError(Errors.EINVAL, 'options', 'key', key);
    }
    if (isString(types[key])) {
      // eslint-disable-next-line valid-typeof
      if (!isExists(types[key].split('|').find(type => type === getType(options[key])))) {
        throw createError(Errors.EINVAL, 'option value', 'reason', `${key} must be ${types[key]} types`);
      }
    } else {
      validateOptions(options[key], types[key]);
    }
  }
}

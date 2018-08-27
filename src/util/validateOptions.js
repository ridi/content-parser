import { isExists, isString, getType } from './typecheck';
import Errors, { createError } from '../constant/errors';

export default function validateOptions(options, defaultValues, types) {
  // eslint-disable-next-line no-restricted-syntax
  for (const key of Object.keys(options)) {
    if (!isExists(Object.getOwnPropertyDescriptor(defaultValues, key))) {
      throw createError(Errors.EINVAL, 'options', 'key', key);
    }
    if (isString(types[key])) {
      // eslint-disable-next-line valid-typeof
      if (!isExists(types[key].split('|').find(type => type === getType(options[key])))) {
        throw createError(Errors.EINVAL, 'option value', 'reason', `${key} must be ${types[key]} types`);
      }
    } else {
      validateOptions(options[key], defaultValues[key], types[key]);
    }
  }
}

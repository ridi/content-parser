import { getType, isExists, isString } from './typecheck';
import Errors, { createError } from './errors';

export default function validateOptions<T>(options: T, types: { [key in keyof T]: string }, strict = false): void {
  for (const key in options) {
    if (!isExists(Object.getOwnPropertyDescriptor(types, key))) {
      throw createError(Errors.EINVAL, 'options', 'key', key);
    }

    if (isString(types[key])) {
      if (!isExists(types[key].split('|').find(type => type === getType(options[key], strict)))) {
        throw createError(Errors.EINVAL, 'option value', 'reason', `${key} must be ${types[key]} types`);
      }
    } else {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      validateOptions(options[key], types[key] as any);
    }
  }
}

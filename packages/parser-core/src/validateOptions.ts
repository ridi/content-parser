import Errors, { createError } from "./errors";
import { getType, isExists, isString } from "./typecheck";

/**
 * Validate option with interface. it will return void if it passes, throw error otherwise.
 */
export default function validateOptions<Options, Types>(
  options: Options,
  types: Types,
  strict = false
) {
  Object.keys(options).forEach((key) => {
    if (!isExists(Object.getOwnPropertyDescriptor(types, key))) {
      throw createError(Errors.EINVAL, "options", "key", key);
    }
    if (isString(types[key])) {
      if (
        !isExists(
          types[key]
            .split("|")
            .find((type) => type === getType(options[key], strict))
        )
      ) {
        throw createError(
          Errors.EINVAL,
          "option value",
          "reason",
          `${key} must be ${types[key]} types`
        );
      }
    } else {
      validateOptions(options[key], types[key]);
    }
  });
}

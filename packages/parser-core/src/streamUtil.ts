import { PassThrough, Stream } from "stream";
import { isFunc } from "./typecheck";

/**
 * Apply event stream conditionally
 */
export function conditionally<S extends Stream>(
  condition: boolean | (() => boolean),
  stream: S
) {
  if (isFunc(condition) ? condition() : condition) {
    return stream;
  }

  return new PassThrough();
}

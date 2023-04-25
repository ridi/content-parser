import { stringContains } from "./stringUtil";
import { isBool, isString } from "./typecheck";
/**
 * Return boolean form of any input
 */
export default function parseBool(any: any) {
  if (isBool(any)) {
    return any;
  }
  return isString(any)
    ? stringContains(["true", "t", "1", "yes", "y"], any)
    : false;
}

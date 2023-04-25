import { mustOverride } from "./errors";

abstract class BaseBook {
  toRaw?(): any {
    return mustOverride();
  }
}
export default BaseBook;

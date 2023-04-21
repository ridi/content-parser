import { mustOverride } from "./errors";

type BaseItemParam = {
  size?: number;
};

class BaseItem {
  size?: number;

  constructor(rawObj: BaseItemParam) {
    this.size = rawObj.size;
  }

  toRaw(): any {
    return mustOverride();
  }
}
export default BaseItem;

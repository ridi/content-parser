export interface BaseItemProps {
  size: number;
}

abstract class BaseItem {
  size: number;

  constructor(rawObj: BaseItemProps) {
    this.size = rawObj.size;
  }

  abstract toRaw: () => Record<string,unknown>;
}

export default BaseItem;

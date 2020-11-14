abstract class BaseItem {
  size: number;

  constructor(rawObj: {size: number}) {
    this.size = rawObj.size;
  }

  abstract toRaw: () => string;
}

export default BaseItem;

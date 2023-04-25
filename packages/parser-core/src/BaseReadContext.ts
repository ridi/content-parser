import BaseBook from "./BaseBook";
import { ReadEntriesReturnType } from "./readEntries";

export type BaseReadOption = {
  force?: boolean;
};

export type BaseReadOptionType = {
  force: string;
};

class BaseReadContext {
  options?: BaseReadOption;

  entries?: ReadEntriesReturnType;

  items?: BaseBook[];

  constructor() {
    this.items = undefined;
    this.entries = undefined;
    this.options = undefined;
  }
}
export default BaseReadContext;

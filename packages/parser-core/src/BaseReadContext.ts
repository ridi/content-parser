import type BaseItem from "./BaseItem";
import type { ReadEntriesReturnType } from "./readEntries";

export interface BaseReadOption {
  force: boolean;
}

interface BaseReadContext {
  options: BaseReadOption;

  entries: ReadEntriesReturnType;

  items: BaseItem[];
}
export default BaseReadContext;

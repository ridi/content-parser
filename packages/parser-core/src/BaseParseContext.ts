import type BaseBook from "./BaseBook";
import type { ReadEntriesReturnType } from "./readEntries";

export interface BaseParserOption {
  unzipPath: string | undefined;
  overwrite: boolean;
}


class BaseParseContext {
  options: BaseParserOption | undefined;

  entries: ReadEntriesReturnType | undefined;

  rawBook: BaseBook | undefined;

  constructor() {
    this.options = undefined;
    this.entries = undefined;
    this.rawBook = undefined;
  }
}
export default BaseParseContext;

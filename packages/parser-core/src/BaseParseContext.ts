import BaseBook from "./BaseBook";
import readEntries, { ReadEntriesReturnType } from "./readEntries";

export type BaseParserOption = {
  // If specified, unzip to that path.
  unzipPath: string;
  // If true, overwrite to unzipPath when unzip. (only using if unzipPath specified.)
  overwrite: boolean;
};

export type BaseParserOptionType = {
  unzipPath: string;
  overwrite: string;
};

/**
 * @class
 */
class BaseParseContext {
  options?: BaseParserOption;

  entries?: ReadEntriesReturnType;

  rawBook?: BaseBook;

  constructor() {
    this.options = undefined;
    this.entries = undefined;
    this.rawBook = undefined;
  }
}
export default BaseParseContext;

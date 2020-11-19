import type BaseBook from "./BaseBook";
import type { ReadEntriesReturnType } from "./readEntries";

export interface BaseParserOption {
  unzipPath: string | undefined;
  overwrite: boolean;
}


export interface BaseParseContext<T extends BaseBook> {
  options?: BaseParserOption;

  entries?: ReadEntriesReturnType;

  rawBook: T;

}

import type BaseBook from "./BaseBook";
import type { ReadEntriesReturnType } from "./readEntries";
export interface BaseParserOption {
    unzipPath: string | undefined;
    overwrite: boolean;
}
declare class BaseParseContext {
    options?: BaseParserOption;
    entries?: ReadEntriesReturnType;
    rawBook?: BaseBook;
}
export default BaseParseContext;

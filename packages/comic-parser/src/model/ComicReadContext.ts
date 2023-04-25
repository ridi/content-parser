import { BaseReadContext } from "@ridi/parser-core";
import { ComicItemProperties } from "./ComicItem";

class ComicReadContext extends BaseReadContext {
  options?: BaseReadContext["options"] & { ext: string[]; base64?: boolean };
  rawBook: { items: ComicItemProperties[] };
}

export default ComicReadContext;

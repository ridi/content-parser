import {
  Parser,
  isString,
  stringContains,
  isExists,
  createError,
  Errors,
  CryptoProvider,
  LogLevel,
  BaseItem,
} from "@ridi/parser-core";
import sizeOf from "image-size";
import naturalCompare from "string-natural-compare";

import * as path from "path";

import ComicBook from "./model/ComicBook";
import ComicItem from "./model/ComicItem";
import ComicParseContext from "./model/ComicParseContext";
import ComicReadContext from "./model/ComicReadContext";
import {
  BaseReadOption,
  BaseReadOptionType,
} from "@ridi/parser-core/lib/BaseReadContext";
import { Task } from "@ridi/parser-core/lib/Parser";
import { EntryBasicInformation } from "@ridi/parser-core/lib/readEntries";
import { PassThrough, Stream } from "stream";
import AdmZip, { IZipEntry } from "adm-zip";
import crypto from "crypto";

const MODE = "aes-128-cbc";

function createStream(data: Buffer | string | null | undefined) {
  const rv = new PassThrough(); // PassThrough is also a Readable stream
  rv.push(data);
  rv.push(null);
  return rv;
}

type ComicReadOptionExtra = {
  base64: boolean;
};

type ComicReadOption = BaseReadOption & ComicReadOptionExtra;

type ComicReadOptionTypeExtra = {
  base64: string;
};
type ComicReadOptionType = BaseReadOptionType & ComicReadOptionTypeExtra;

type ImageMetaData = {
  width: number;
  height: number;
};

interface AltParser {
  entries: {
    [path: string]: IZipEntry;
  };

  init(input: string, options: { secretKey }): void;

  readStream(item: BaseItem): Stream;
}

class ComicParser extends Parser implements AltParser {
  entries!: {
    [entryName: string]: IZipEntry;
  };
  /**
   * Get default values of parse options
   */
  static get parseDefaultOptions() {
    return {
      ...super.parseDefaultOptions,
      // File extension to allow when extracting lists.
      ext: ["jpg", "jpeg", "png", "bmp", "gif"],
      // If true, image size parse. (parse may be slower.)
      parseImageSize: false,
    };
  }

  /**
   * Get types of parse options
   */
  static get parseOptionTypes() {
    return {
      ...super.parseOptionTypes,
      ext: "Array",
      parseImageSize: "Boolean|Number",
    };
  }

  /**
   * Get default values of read options

   */
  static get readDefaultOptions(): ComicReadOption {
    return {
      ...super.readDefaultOptions,
      // If false, reads image into a buffer.
      base64: false,
    };
  }
  /**
   * Get types of read option
   */
  static get readOptionTypes(): ComicReadOptionType {
    return {
      ...super.readOptionTypes,
      base64: "Boolean",
    };
  }

  /**
   * Create new ComicParser
   * @param {string} input file or directory
   * @throws {Errors.ENOENT} no such file or directory
   * @throws {Errors.EINVAL} invalid input
   * @example new ComicParser('./foo/bar.zip' or './foo/bar');
   */
  constructor(
    input: string,
    // FIXME: 추후 수정
    cryptoProvider?: CryptoProvider | LogLevel,
    logLevel?: LogLevel
  ) {
    /* istanbul ignore next */
    super(input, isString(cryptoProvider) ? undefined : cryptoProvider, {
      namespace: "ComicParser",
      logLevel: isString(cryptoProvider) ? cryptoProvider : logLevel,
    });
  }

  _getParseContextClass() {
    return ComicParseContext;
  }

  _getBookClass() {
    return ComicBook;
  }

  _getReadContextClass() {
    return ComicReadContext;
  }

  _getReadItemClass() {
    return ComicItem;
  }

  _parseTasks(): Task[] {
    return [...super._parseTasks(), { fun: this._parse, name: "parse" }];
  }

  /**
   * extracts only necessary metadata from entries and create item list
   * @param {ComicReadContext} context intermediate result
   * @returns {Promise<ComicReadContext>} return Context containing item list
   * @see ComicParser.parseDefaultOptions.ext
   * @see ComicParser.parseDefaultOptions.parseImageSize
   */
  async _parse(context: ComicReadContext) {
    const { entries, rawBook, options } = context;
    const items = entries
      .sort((e1, e2) => naturalCompare(e1.entryPath, e2.entryPath))
      .filter((entry) => {
        const ext = path.extname(entry.entryPath);
        return (
          ext.length > 0 &&
          stringContains(
            options.ext.map((e) => `.${e}`),
            ext
          )
        );
      });

    // FIXME: context와 연결되지 않는 것으로 보임
    rawBook.items = [];
    await items.reduce(
      (prevPromise, item, index) =>
        prevPromise.then(async () => {
          rawBook.items.push({
            index,
            path: item.entryPath,
            size: item.size,
            ...(await this._parseImageSize(item, options)),
          });
        }),
      Promise.resolve()
    );
    return context;
  }

  /**
   * parse image size from entry
   * @param {import('@ridi/parser-core/type/readEntries').EntryBasicInformation} entry image entry
   * @param {ComicParser.parseDefaultOptions} options parse options
   * @returns {Promise<ImageMetaData>} return image size
   */
  async _parseImageSize(
    entry: EntryBasicInformation,
    options: Partial<typeof ComicParser.parseDefaultOptions>
  ) {
    const { parseImageSize } = options;
    if (parseImageSize === false) {
      return {};
    }
    const readOptions = Number.isInteger(parseImageSize)
      ? { end: parseImageSize as unknown as number }
      : {};
    const buffer = await entry.getFile(readOptions);
    try {
      const size = sizeOf(buffer);
      return { width: size.width, height: size.height };
    } catch (e) {
      this.logger.error(e);
      return { width: undefined, height: undefined };
    }
  }

  /**
   * Contents is read using loader suitable for context
   * @param {ComicReadContext} context properties required for reading
   * @returns {(string|Buffer)[]} reading results
   * @throws {Errors.ENOFILE} no such file
   * @see ComicParser.readDefaultOptions.base64
   */
  async _read(context: ComicReadContext) {
    const { items, entries, options } = context;
    const results = [];
    await (items as ComicItem[]).reduce(
      (prevPromise, item) =>
        prevPromise.then(async () => {
          const entry = entries.find(item.path);
          /* istanbul ignore next */
          if (!options.force && !isExists(entry)) {
            /* istanbul ignore next */
            throw createError(Errors.ENOFILE, item.path);
          }
          const file = await entry.getFile();
          if (options.base64) {
            results.push(
              `data:${item.mimeType};base64,${file.toString("base64")}`
            );
          } else {
            results.push(file);
          }
        }),
      Promise.resolve()
    );
    return results;
  }

  _secretKey: any;
  init(input: string, { secretKey }: { secretKey: any }) {
    if (this.entries) throw new Error("이미 entries 초기화 됨");

    this._secretKey = secretKey;
    this.entries = new AdmZip(input)
      .getEntries()
      .reduce<typeof this.entries>((acc, entry) => {
        return {
          ...acc,
          [entry.entryName]: entry,
        };
      }, {});
  }
  readData(entryName: string) {
    if (!this.entries)
      throw new Error(
        "entries가 초기화 되지 않음. 먼저 this.init()를 호출해주세요."
      );

    const entry = this.entries[entryName];

    const data = entry.getData();
    const iv = data.slice(0, 16);

    const decipher = crypto.createDecipheriv(MODE, this._secretKey, iv);

    return Buffer.concat([decipher.update(data.slice(16)), decipher.final()]);
  }
  readStream(entryName: string) {
    if (!this.entries)
      throw new Error(
        "entries가 초기화 되지 않음. 먼저 this.init()를 호출해주세요."
      );

    const entry = this.entries[entryName];

    const data = entry.getData();
    const iv = data.slice(0, 16);

    const decipher = crypto.createDecipheriv(MODE, this._secretKey, iv);

    return createStream(data.slice(16)).pipe(decipher);
  }
}

export default ComicParser;

import { BaseParseContext } from '@ridi/parser-core';

import EpubBook from './EpubBook';

class EpubParseContext extends BaseParseContext {
  /**
   * @type {{[Key in keyof import('./EpubBook').default]: any}}
   */
  rawBook;

  /**
   * @type {string}
   */
  opfPath;

  /**
   * @type {string}
   */
  basePath;

  /**
   * @type {boolean}
   */
  foundCover;

  constructor() {
    super();
    const rawBook = {};
    Object.keys(new EpubBook()).forEach(key => { rawBook[key] = undefined; });
    this.rawBook = rawBook;
    this.opfPath = undefined;
    this.basePath = undefined;
    this.foundCover = false;
  }
}

export default EpubParseContext;

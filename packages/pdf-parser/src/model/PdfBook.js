import { BaseBook, Version } from '@ridi/parser-core';

import OutlineItem from './OutlineItem';
import Permissions from './Permissions';

class PdfBook extends BaseBook {
  /**
   * @type {import('@ridi/parser-core').Version}
   */
  version;

  /**
   * @type {string}
   */
  title;

  /**
   * @type {string}
   */
  author;

  /**
   * @type {string}
   */
  subject;

  /**
   * @type {string}
   */
  keywords;

  /**
   * @type {string}
   */
  creator;

  /**
   * @type {string}
   */
  producer;

  /**
   * @type {Date}
   */
  creationDate;

  /**
   * @type {Date}
   */
  modificationDate;

  /**
   * @type {boolean}
   */
  isLinearized;

  /**
   * @type {boolean}
   */
  isAcroFormPresent;

  /**
   * @type {boolean}
   */
  isXFAPresent;

  /**
   * @type {boolean}
   */
  isCollectionPresent;

  /**
   * @type {string}
   */
  userInfo;

  /**
   * @type {OutlineItem}
   */
  outlineItems;

  /**
   * @type {number}
   */
  pageCount;

  /**
   * @type {import('./Permissions').default}
   */
  permissions;

  /**
   * @typedef {Object} PdfBookParamInfo
   * @property {string} [PDFFormatVersion]
   * @property {string} [Title]
   * @property {string} [Author]
   * @property {string} [Subject]
   * @property {string} [Keywords]
   * @property {string} [Creator]
   * @property {string} [Producer]
   * @property {Date} [CreationDate]
   * @property {Date} [ModDate]
   * @property {boolean} [IsLinearized]
   * @property {boolean} [IsAcroFormPresent]
   * @property {boolean} [IsXFAPresent]
   * @property {boolean} [IsCollectionPresent]
   * @property {string} [Custom]
   * @property {import('./OutlineItem').default[]} [outline]
   * @property {number} [pageCount]
   * @property {import('./Permissions').default} [permissions]
   */

  /**
   *
   * @param {{info:PdfBookParamInfo}} rawBook
   */
  constructor(rawBook = {}) {
    super();
    const info = rawBook.info || {};
    this.version = new Version(info.PDFFormatVersion);
    this.title = info.Title || '';
    this.author = info.Author || '';
    this.subject = info.Subject || '';
    this.keywords = info.Keywords || '';
    this.creator = info.Creator || '';
    this.producer = info.Producer || '';
    this.creationDate = info.CreationDate;
    this.modificationDate = info.ModDate;
    this.isLinearized = info.IsLinearized || false;
    this.isAcroFormPresent = info.IsAcroFormPresent || false;
    this.isXFAPresent = info.IsXFAPresent || false;
    this.isCollectionPresent = info.IsCollectionPresent || false;
    this.userInfo = info.Custom || {};
    this.outlineItems = (rawBook.outline || []).map((outlineItem) => {
      return new OutlineItem(outlineItem, rawBook.pageMap);
    });
    this.pageCount = rawBook.pageCount || 0;
    this.permissions = new Permissions(rawBook.permissions);
    Object.freeze(this);
  }

  toRaw() {
    return {
      info: {
        PDFFormatVersion: this.version.toString(),
        Title: this.title,
        Author: this.author,
        Subject: this.subject,
        Keywords: this.keywords,
        Creator: this.creator,
        Producer: this.producer,
        CreationDate: this.creationDate,
        ModDate: this.modificationDate,
        IsLinearized: this.isLinearized,
        IsAcroFormPresent: this.isAcroFormPresent,
        IsXFAPresent: this.isXFAPresent,
        IsCollectionPresent: this.isCollectionPresent,
        Custom: this.userInfo,
      },
      outline: this.outlineItems.map(outlineItem => outlineItem.toRaw()),
      pageCount: this.pageCount,
      permissions: this.permissions.toRaw(),
    };
  }
}

export default PdfBook;

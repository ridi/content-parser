import { Version } from '@ridi/parser-core';

import OutlineItem from './OutlineItem';
import Permissions from './Permissions';

class Book {
  constructor(rawBook = {}) {
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
      return new OutlineItem(outlineItem, rawBook.getBook);
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

export default Book;

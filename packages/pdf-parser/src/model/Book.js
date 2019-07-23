import { Version } from '@ridi/parser-core';

import OutlineItem from './OutlineItem';

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
    this.outlineItems = (rawBook.outline || []).map((outlineItem) => {
      return new OutlineItem(outlineItem, rawBook.getBook);
    });
    this.pageCount = rawBook.pageCount || 0;
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
      },
      outline: this.outlineItems.map(outlineItem => outlineItem.toRaw()),
      pageCount: this.pageCount,
    };
  }
}

export default Book;

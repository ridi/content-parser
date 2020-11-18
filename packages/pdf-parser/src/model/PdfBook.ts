import { BaseBook, Version } from '@ridi/parser-core';

import OutlineItem, { OutlineItemProps } from './OutlineItem';
import Permissions, { PermissionsProps } from './Permissions';

interface PdfBookProps {
  info: {
    PDFFormatVersion: string;
    Version: Version;
    Title: string;
    Author: string;
    Subject: string;
    Keywords: string;
    Creator: string;
    Producer: string;
    CreationDate: Date
    ModDate: Date
    IsLinearized: boolean
    IsAcroFormPresent: boolean
    IsXFAPresent: boolean
    IsCollectionPresent: boolean
    UserInfo: string;
    OutlineItems: OutlineItem
    PageCount: number
    Permissions: Permissions
    Custom: unknown;
  }
  outline: OutlineItemProps[]
  pageMap?: Record<string, number>
  pageCount?: number;
  permissions: PermissionsProps;
}
class PdfBook extends BaseBook {
  version: Version;

  title: string;

  author: string;

  subject: string;

  keywords: string;

  creator: string;

  producer: string;

  creationDate?: Date

  modificationDate?: Date

  isLinearized: boolean

  isAcroFormPresent: boolean

  isXFAPresent: boolean

  isCollectionPresent: boolean

  userInfo: unknown;

  outlineItems: OutlineItem[]

  pageCount: number

  permissions: Permissions

  info: unknown


  constructor(rawBook?: PdfBookProps) {
    super();
    const info = rawBook?.info;
    this.version = new Version(info?.PDFFormatVersion);
    this.title = info?.Title || '';
    this.author = info?.Author || '';
    this.subject = info?.Subject || '';
    this.keywords = info?.Keywords || '';
    this.creator = info?.Creator || '';
    this.producer = info?.Producer || '';
    this.creationDate = info?.CreationDate;
    this.modificationDate = info?.ModDate;
    this.isLinearized = info?.IsLinearized || false;
    this.isAcroFormPresent = info?.IsAcroFormPresent || false;
    this.isXFAPresent = info?.IsXFAPresent || false;
    this.isCollectionPresent = info?.IsCollectionPresent || false;
    this.userInfo = info?.Custom || {};
    this.outlineItems = (rawBook?.outline || []).map((outlineItem) => {
      return new OutlineItem(outlineItem, rawBook?.pageMap);
    });
    this.pageCount = rawBook?.pageCount || 0;
    this.permissions = new Permissions(rawBook?.permissions);
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

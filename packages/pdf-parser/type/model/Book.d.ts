export default Book;
declare class Book {
    constructor(rawBook?: {});
    version: any;
    title: any;
    author: any;
    subject: any;
    keywords: any;
    creator: any;
    producer: any;
    creationDate: any;
    modificationDate: any;
    isLinearized: any;
    isAcroFormPresent: any;
    isXFAPresent: any;
    isCollectionPresent: any;
    userInfo: any;
    outlineItems: any;
    pageCount: any;
    permissions: Permissions;
    toRaw(): {
        info: {
            PDFFormatVersion: any;
            Title: any;
            Author: any;
            Subject: any;
            Keywords: any;
            Creator: any;
            Producer: any;
            CreationDate: any;
            ModDate: any;
            IsLinearized: any;
            IsAcroFormPresent: any;
            IsXFAPresent: any;
            IsCollectionPresent: any;
            Custom: any;
        };
        outline: any;
        pageCount: any;
        permissions: any;
    };
}
import Permissions from "./Permissions";

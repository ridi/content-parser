export default PdfBook;
declare class PdfBook extends BaseBook {
    constructor(rawBook?: {});
    version: Version;
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
}
import { BaseBook } from "@ridi/parser-core";
import { Version } from "@ridi/parser-core";
import Permissions from "./Permissions";

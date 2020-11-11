export default PdfBook;
declare class PdfBook extends BaseBook {
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
    constructor(rawBook?: {
        info: {
            PDFFormatVersion?: string;
            Title?: string;
            Author?: string;
            Subject?: string;
            Keywords?: string;
            Creator?: string;
            Producer?: string;
            CreationDate?: Date;
            ModDate?: Date;
            IsLinearized?: boolean;
            IsAcroFormPresent?: boolean;
            IsXFAPresent?: boolean;
            IsCollectionPresent?: boolean;
            Custom?: string;
            outline?: import('./OutlineItem').default[];
            pageCount?: number;
            permissions?: import('./Permissions').default;
        };
    });
    /**
     * @type {import('@ridi/parser-core').Version}
     */
    version: import('@ridi/parser-core').Version;
    /**
     * @type {string}
     */
    title: string;
    /**
     * @type {string}
     */
    author: string;
    /**
     * @type {string}
     */
    subject: string;
    /**
     * @type {string}
     */
    keywords: string;
    /**
     * @type {string}
     */
    creator: string;
    /**
     * @type {string}
     */
    producer: string;
    /**
     * @type {Date}
     */
    creationDate: Date;
    /**
     * @type {Date}
     */
    modificationDate: Date;
    /**
     * @type {boolean}
     */
    isLinearized: boolean;
    /**
     * @type {boolean}
     */
    isAcroFormPresent: boolean;
    /**
     * @type {boolean}
     */
    isXFAPresent: boolean;
    /**
     * @type {boolean}
     */
    isCollectionPresent: boolean;
    /**
     * @type {string}
     */
    userInfo: string;
    /**
     * @type {OutlineItem}
     */
    outlineItems: OutlineItem;
    /**
     * @type {number}
     */
    pageCount: number;
    /**
     * @type {import('./Permissions').default}
     */
    permissions: import('./Permissions').default;
}
import { BaseBook } from "@ridi/parser-core";
import OutlineItem from "./OutlineItem";

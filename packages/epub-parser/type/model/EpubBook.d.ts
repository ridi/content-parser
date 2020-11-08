export default Book;
declare class Book extends BaseBook {
    /**
     * @typedef {Object} EpubBookExtra
     * @property {string} [titles]
     * @property {Author} [creators]
     * @property {string[]} [subjects]
     * @property {string} [description]
     * @property {string} [publisher]
     * @property {Author[]} [contributors]
     * @property {DateTime[]} [dates]
     * @property {string} [type]
     * @property {string} [format]
     * @property {Identifier[]} [identifiers]
     * @property {string} [source]
     * @property {string[]} [languages]
     * @property {string} [relation]
     * @property {string} [coverage]
     * @property {string} [rights]
     * @property {Version} [version]
     * @property {Meta[]} [metas]
     * @property {import('./BaseEpubItem')[]} [items]
     *
     * @typedef {BaseBook & EpubBookExtra} EpubBookParam
     */
    /**
     *
     * @param {EpubBookParam} rawBook
     */
    constructor(rawBook?: BaseBook & {
        titles?: string;
        creators?: Author;
        subjects?: string[];
        description?: string;
        publisher?: string;
        contributors?: Author[];
        dates?: DateTime[];
        type?: string;
        format?: string;
        identifiers?: Identifier[];
        source?: string;
        languages?: string[];
        relation?: string;
        coverage?: string;
        rights?: string;
        version?: Version;
        metas?: Meta[];
        items?: import('./BaseEpubItem')[];
    });
    /**
     * @type {string}
     */
    titles: string;
    /**
     * @type {import('./Author').default[]}
     */
    creators: import('./Author').default[];
    /**
     * @type {string[]}
     */
    subjects: string[];
    /**
     * @type {string}
     */
    description: string;
    /**
     * @type {string}
     */
    publisher: string;
    /**
     * @type {import('./Author').default[]}
     */
    contributors: import('./Author').default[];
    /**
     * @type {import('./DateTime').default[]};
     */
    dates: import('./DateTime').default[];
    /**
     * @type {string}
     */
    type: string;
    /**
     * @type {string}
     */
    format: string;
    /**
     * @type {import('./Identifier').default[]};
     */
    identifiers: import('./Identifier').default[];
    /**
     * @type {string}
     */
    source: string;
    /**
     * @type {string[]}
     */
    languages: string[];
    /**
     * @type {string}
     */
    relation: string;
    /**
     * @type {string}
     */
    coverage: string;
    /**
     * @type {string}
     */
    rights: string;
    /**
     * @type {import('@ridi/parser-core').Version}
     */
    version: import('@ridi/parser-core').Version;
    /**
     * @type {import('./Meta').default[]}
     */
    metas: import('./Meta').default[];
    /**
     * @type {import('./BaseEpubItem').default[]}
     */
    items: import('./BaseEpubItem').default[];
    /**
     * @type {import('./SpineItem').default[]}
     */
    spines: import('./SpineItem').default[];
    /**
     * @type {import('./NcxItem').default[]}
     */
    ncx: import('./NcxItem').default[];
    /**
     * @type {import('./FontItem').default[]}
     */
    fonts: import('./FontItem').default[];
    /**
     * @type {import('./ImageItem').default}
     */
    cover: import('./ImageItem').default;
    /**
     * @type {import('./ImageItem').default[]}
     */
    images: import('./ImageItem').default[];
    /**
     * @type {import('./CssItem').default[]}
     */
    styles: import('./CssItem').default[];
    /**
     * @type {import('./Guide').default[]}
     */
    guides: import('./Guide').default[];
    /**
     * @type {import('./DeadItem').default[]}
     */
    deadItems: import('./DeadItem').default[];
}
import { BaseBook } from "@ridi/parser-core";
import Author from "./Author";
import DateTime from "./DateTime";
import Identifier from "./Identifier";
import { Version } from "@ridi/parser-core";
import Meta from "./Meta";

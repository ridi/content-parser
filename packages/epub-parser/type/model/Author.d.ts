export default Author;
export type AuthorParam = {
    name?: string;
    fileAs?: string;
    role?: string;
};
/**
 * @typedef {object} AuthorParam
 * @property {string} [name]
 * @property {string} [fileAs]
 * @property {string} [role]
 */
declare class Author {
    /**
     *
     * @param {string|AuthorParam} rawObj
     */
    constructor(rawObj?: string | AuthorParam);
    /**
     * @type {string}
     */
    name: string;
    /**
     * @type {string}
     */
    fileAs: string;
    /**
     * @type {string}
     */
    role: string;
    toRaw(): {
        name: string;
        fileAs: string;
        role: string;
    };
}
declare namespace Author {
    export { Roles };
}
declare const Roles: Readonly<{
    UNDEFINED: string;
    UNKNOWN: string;
    ADAPTER: string;
    ANNOTATOR: string;
    ARRANGER: string;
    ARTIST: string;
    ASSOCIATEDNAME: string;
    AUTHOR: string;
    AUTHOR_IN_QUOTATIONS_OR_TEXT_EXTRACTS: string;
    AUTHOR_OF_AFTER_WORD_OR_COLOPHON_OR_ETC: string;
    AUTHOR_OF_INTRODUCTIONOR_ETC: string;
    BIBLIOGRAPHIC_ANTECEDENT: string;
    BOOK_PRODUCER: string;
    COLLABORATOR: string;
    COMMENTATOR: string;
    DESIGNER: string;
    EDITOR: string;
    ILLUSTRATOR: string;
    LYRICIST: string;
    METADATA_CONTACT: string;
    MUSICIAN: string;
    NARRATOR: string;
    OTHER: string;
    PHOTOGRAPHER: string;
    PRINTER: string;
    REDACTOR: string;
    REVIEWER: string;
    SPONSOR: string;
    THESIS_ADVISOR: string;
    TRANSCRIBER: string;
    TRANSLATOR: string;
}>;

export default Guide;
export type GuideParam = {
    title?: string;
    type?: string;
    href?: string;
};
/**
 * @typedef {Object} GuideParam
 * @property {string} [title]
 * @property {string} [type]
 * @property {string} [href]
 */
declare class Guide {
    /**
     * @param {GuideParam} rawObj
     * @param {boolean} freeze
     */
    constructor(rawObj?: GuideParam, freeze?: boolean);
    title: string;
    type: string;
    href: string;
    item: any;
    toRaw(): {
        title: string;
        type: string;
        href: string;
    };
}
declare namespace Guide {
    export { Types };
}
declare const Types: Readonly<{
    UNDEFINED: string;
    UNKNOWN: string;
    COVER: string;
    TITLE_PAGE: string;
    TOC: string;
    INDEX: string;
    GLOSSARY: string;
    ACKNOWLEDGEMENTS: string;
    BIBLIOGRAPHY: string;
    COLOPHON: string;
    COPYRIGHT_PAGE: string;
    DEDICATION: string;
    EPIGRAPH: string;
    FOREWORD: string;
    LOI: string;
    LOT: string;
    NOTES: string;
    PREFACE: string;
    TEXT: string;
}>;

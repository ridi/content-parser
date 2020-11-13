export default Identifier;
export type IdentifierParam = {
    value?: string;
    scheme?: string;
};
/**
 * @typedef {Object} IdentifierParam
 * @property {string} [value]
 * @property {string} [scheme]
 */
declare class Identifier {
    /**
     * @param {IdentifierParam} rawObj
     */
    constructor(rawObj?: IdentifierParam);
    value: string | IdentifierParam;
    scheme: string;
    toRaw(): {
        value: string | IdentifierParam;
        scheme: string;
    };
}
declare namespace Identifier {
    export { Schemes };
}
declare const Schemes: Readonly<{
    UNDEFINED: string;
    UNKNOWN: string;
    DOI: string;
    ISBN: string;
    ISBN13: string;
    ISBN10: string;
    ISSN: string;
    UUID: string;
    URI: string;
}>;

export default DateTime;
declare class DateTime {
    /**
     * @typedef DateTimeParam
     * @property {string} [value]
     * @property {string} [event]
     */
    /**
     *
     * @param {DateTimeParam} rawObj
     */
    constructor(rawObj?: {
        value?: string;
        event?: string;
    });
    /**
     * @type {string}
     */
    value: string;
    /**
     * @type {string}
     */
    event: string;
    toRaw(): {
        value: string;
        event: string;
    };
}
declare namespace DateTime {
    export { Events };
}
declare const Events: Readonly<{
    UNDEFINED: string;
    UNKNOWN: string;
    CREATION: string;
    MODIFICATION: string;
    PUBLICATION: string;
}>;

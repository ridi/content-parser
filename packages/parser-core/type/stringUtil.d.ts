export type MatchOption = {
    /**
     * "0"
     */
    MATCHING: number;
    /**
     * "1"
     */
    CONTAINING: number;
    /**
     * "2"
     */
    STARTSWITH: number;
    /**
     * "3"
     */
    ENDSWITH: number;
};
/**
 * @typedef MatchOption
 * @property {number} MATCHING "0"
 * @property {number} CONTAINING "1"
 * @property {number} STARTSWITH "2"
 * @property {number} ENDSWITH "3"
 */
/**
 * @type {MatchOption}
 */
export const MatchOption: MatchOption;
/**
 * @param {string[]} array=[]
 * @param {string} string=''
 * @param {MatchOption} matchOption=MatchOption.MATCHING
 * @returns {boolean}
 */
export function stringContains(array?: string[], string?: string, matchOption?: MatchOption): boolean;
/**
 * Decode URI
 * @param {string} uri
 */
export function safeDecodeURI(uri: string): string;

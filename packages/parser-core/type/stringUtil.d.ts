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
export namespace MatchOption {
    const MATCHING: number;
    const CONTAINING: number;
    const STARTSWITH: number;
    const ENDSWITH: number;
}
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

declare enum MatchOption {
    MATCHING = 0,
    CONTAINING = 1,
    STARTSWITH = 2,
    ENDSWITH = 3
}
declare function stringContains(array?: string[], string?: string, matchOption?: MatchOption): boolean;
/**
 * Decode URI
 */
declare function safeDecodeURI(uri: string): string;
export { MatchOption, stringContains, safeDecodeURI, };

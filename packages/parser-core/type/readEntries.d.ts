export default function readEntries(input: any, cryptoProvider: any, logger: any): Promise<{
    first: any;
    length: any;
    source: any;
    get: (idx: any) => any;
    find: (entryPath: any, strict?: boolean) => any;
    forEach: (callback: any) => any;
    map: (callback: any) => any;
    sort: (callback: any) => any;
}>;

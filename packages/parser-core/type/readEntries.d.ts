/// <reference types="node" />
import type { IZipEntry } from 'adm-zip';
import CryptoProvider from './CryptoProvider';
import type Logger from './Logger';
import { ZipFileInformation } from './zipUtil';
interface FileEntryObject<T, S extends {
    entryPath: string;
}> {
    first: S;
    length: number;
    source: T;
    get: (idx: number) => S;
    find: (entryPath: string, strict: boolean) => S | undefined;
    forEach: (callback: (value: S, index: number, array: S[]) => void) => void;
    map: (callback: (value: S, index: number, array: S[]) => any) => void;
    sort: (callback: (a: S, b: S) => number) => void;
}
interface GetFileOption {
    encoding?: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined;
    end?: number;
}
interface EntryBasicInformation {
    entryPath: string;
    size: number;
    getFile: (options?: GetFileOption) => (Buffer | string) | Promise<string | Buffer>;
}
interface ZipfileEntryInformation {
    extraFieldLength: number;
}
declare type IZipEntryPlus = IZipEntry & EntryBasicInformation & ZipfileEntryInformation;
export declare type ReadEntriesReturnType = FileEntryObject<string, EntryBasicInformation> | FileEntryObject<ZipFileInformation, IZipEntryPlus>;
export default function readEntries(input: string, cryptoProvider: CryptoProvider, logger: Logger): Promise<ReadEntriesReturnType>;
export {};

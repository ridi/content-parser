/**
 * @typedef {FileEntryObject<string, EntryBasicInformation | IZipEntryPlus>} ReadEntriesReturnType
 */
/**
 * @async
 * @param {string} input
 * @param {CryptoProvider} cryptoProvider
 * @param {import('./Logger').default} logger
 * @returns {Promise<ReadEntriesReturnType>}
 */
export default function readEntries(input: string, cryptoProvider: CryptoProvider, logger: import('./Logger').default): Promise<ReadEntriesReturnType>;
export type FileEntryObject<T, S> = {
    first: S;
    length: number;
    source: T;
    get: (idx: number) => S;
    find: (entryPath: string, strict: boolean) => S;
    forEach: (callback: (value: S, index: number, array: S[]) => void) => void;
    map: (callback: (value: S, index: number, array: S[]) => any) => void;
    sort: (callback: (a: S, b: S) => number) => void;
};
export type EntryBasicInformation = {
    entryPath: string;
    size: number;
    getFile: (options: {
        endocing: string;
        end: number;
    }) => (Promise<Buffer> | Buffer);
};
export type ZipfileEntryInformation = {
    method: string;
    extraFieldLength: number;
};
export type IZipEntryPlus = import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation;
export type ReadEntriesReturnType = {
    first: EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation);
    length: number;
    source: string;
    get: (idx: number) => EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation);
    find: (entryPath: string, strict: boolean) => EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation);
    forEach: (callback: (value: EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation), index: number, array: (EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation))[]) => void) => void;
    map: (callback: (value: EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation), index: number, array: (EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation))[]) => any) => void;
    sort: (callback: (a: EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation), b: EntryBasicInformation | (import("adm-zip").IZipEntry & EntryBasicInformation & ZipfileEntryInformation)) => number) => void;
};
import CryptoProvider from "./CryptoProvider";

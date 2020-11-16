/// <reference types="node" />
import AdmZip from 'adm-zip';
import CryptoProvider from './CryptoProvider';
import type Logger from './Logger';
interface GetFileOption {
    encoding: "ascii" | "utf8" | "utf-8" | "utf16le" | "ucs2" | "ucs-2" | "base64" | "latin1" | "binary" | "hex" | undefined;
    end: number | undefined;
}
export interface ZipFileInformation {
    file: string | Buffer;
    files: AdmZip.IZipEntry[];
    cryptoProvider: CryptoProvider;
    find: (entryPath: string) => AdmZip.IZipEntry | undefined;
    getFile: (entry: AdmZip.IZipEntry, options?: GetFileOption) => Promise<Buffer | string>;
    extractAll: (unzipPath: string, overwrite?: boolean) => Promise<void>;
    logger: Logger;
}
export default function openZip(file: string | Buffer, cryptoProvider: CryptoProvider, logger: Logger): Promise<ZipFileInformation>;
export {};

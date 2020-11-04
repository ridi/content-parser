/**
 * @param  {string | Buffer} file
 * @param  {CryptoProvider} cryptoProvider
 * @param  {Logger} logger
 * @returns {ZipFileInformation}
 * @throws {Errors.ENOENT} When file can't be found
 */
export default function openZip(file: string | Buffer, cryptoProvider: CryptoProvider, logger: Logger): ZipFileInformation;
export type GetFileOptions = {
    encoding: string;
    end: number;
};
export type ZipFileInformation = {
    files: AdmZip.IZipEntry[];
    cryptoProvider: CryptoProvider;
    find: (entryPath: string) => AdmZip.IZipEntry;
    getFile: (entry: AdmZip.IZipEntry, options?: GetFileOptions) => Promise<any>;
    extractAll: (unzipPath: any, overwrite?: boolean) => Promise<any>;
    logger: Logger;
};
import CryptoProvider from "./CryptoProvider";
import Logger from "./Logger";
import * as AdmZip from "adm-zip";

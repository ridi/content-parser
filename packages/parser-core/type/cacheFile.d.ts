/**
 * Get path to store cache
 */
export declare function getCachePath(): string;
/**
 * Remove the cache file with a key
 */
export declare function removeCacheFile(key: string): void;
/**
 * Remove every cache file
 * @returns {void}
 */
export declare function removeAllCacheFiles(): void;
/**
 * Read the cache file with a key
 */
export declare function readCacheFile(key: string): string | null;
/**
 * Write cache file
 */
export declare function writeCacheFile(key: string, message: string, overwrite?: boolean): void;

/**
 * @param  {string} target
 * @returns {string}
 */
export function safePath(target: string): string;
/**
 * @param  {string} target
 * @returns {string}
 */
export function safeDirname(target: string): string;
/**
 * @param  {string[]} components
 * @returns {string}
 */
export function safePathJoin(...components: string[]): string;
/**
 * @param  {string} target
 * @returns {string[]}
 */
export function getPathes(target: string): string[];

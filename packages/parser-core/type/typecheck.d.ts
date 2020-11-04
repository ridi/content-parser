/**
 * Get type as string
 * @param  {any} any
 * @param  {boolean} strict=false
 * @returns {string}
 */
export function getType(any: any, strict?: boolean): string;
/**
 * Return true if passed argument is an array
 * @param  {any} any
 * @returns {boolean}
 */
export function isArray(any: any): boolean;
/**
 * Return true if passed argument is a boolean
 * @param  {any} any
 * @returns {boolean}
 */
export function isBool(any: any): boolean;
/**
 * Return true if passed argument is undefined nor null
 * @param  {any} any
 * @returns {boolean}
 */
export function isExists(any: any): boolean;
/**
 * Return true if passed argument is function
 * @param  {any} any
 * @returns {boolean}
 */
export function isFunc(any: any): boolean;
/**
 * Return true if passed argument is object
 * @param  {any} any
 * @returns {boolean}
 */
export function isObject(any: any): boolean;
/**
 * Return true if passed argument is string
 * @param  {any} any
 * @returns {boolean}
 */
export function isString(any: any): boolean;
/**
 * Return true if passed argument is url
 * @param  {any} string
 * @returns {boolean}
 */
export function isUrl(string: any): boolean;

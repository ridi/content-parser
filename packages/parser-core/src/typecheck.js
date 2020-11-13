/**
 * Get type as string
 * @param {any} any
 * @param {boolean} strict=false
 * @returns {string}
 */
export function getType(any, strict = false) {
  const string = Object.prototype.toString.call(any).split(' ')[1];
  const type = string.substr(0, string.length - 1);
  if (strict) {
    if (type === 'Function') {
      return any.name;
    }
    if (type !== 'Null' && type !== 'Undefined') {
      return any.constructor.name;
    }
  }
  return type;
}

/**
 * Return true if passed argument is an array
 * @param {any} any
 * @returns {boolean}
 */
export function isArray(any) {
  if (Array.isArray) {
    return Array.isArray(any);
  }
  return getType(any) === 'Array';
}

/**
 * Return true if passed argument is a boolean
 * @param {any} any
 * @returns {boolean}
 */
export function isBool(any) {
  return getType(any) === 'Boolean';
}

/**
 * Return true if passed argument is undefined nor null
 * @param {any} any
 * @returns {boolean}
 */
export function isExists(any) {
  return any !== undefined && any !== null;
}

/**
 * Return true if passed argument is function
 * @param {any} any
 * @returns {boolean}
 */
export function isFunc(any) {
  return getType(any) === 'Function';
}

/**
 * Return true if passed argument is object
 * @param {any} any
 * @returns {boolean}
 */
export function isObject(any) {
  return getType(any) === 'Object';
}

/**
 * Return true if passed argument is string
 * @param {any} any
 * @returns {boolean}
 */
export function isString(any) {
  return typeof any === 'string';
}

/**
 * Return true if passed argument is url
 * @param {any} string
 * @returns {boolean}
 */
export function isUrl(string) {
  return isString(string) && isExists(string.match(/[a-z].*?:\/\//i));
}

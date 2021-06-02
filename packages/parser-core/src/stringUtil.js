import { isExists } from './typecheck';

/**
 * @typedef MatchOption
 * @property {number} MATCHING "0"
 * @property {number} CONTAINING "1"
 * @property {number} STARTSWITH "2"
 * @property {number} ENDSWITH "3"
 */

/**
 * @type {MatchOption}
 */
const MatchOption = {
  MATCHING: 0,
  CONTAINING: 1,
  STARTSWITH: 2,
  ENDSWITH: 3,
};

/**
 * @param {string[]} array=[]
 * @param {string} string=''
 * @param {MatchOption} matchOption=MatchOption.MATCHING
 * @returns {boolean}
 */
function stringContains(array = [], string = '', matchOption = MatchOption.MATCHING) {
  const lString = string.toLowerCase();
  return isExists(array.find(item => {
    const lItem = item.toLowerCase();
    switch (matchOption) {
      case MatchOption.CONTAINING:
        return lItem.includes(lString);
      case MatchOption.STARTSWITH:
        return lItem.startsWith(lString);
      case MatchOption.ENDSWITH:
        return lItem.endsWith(lString);
      default:
        return lItem === lString;
    }
  }));
}
/**
 * Decode URI
 * @param {string} uri
 */
function safeDecodeURI(uri) {
  try {
    return decodeURI(uri);
  } catch (e) {
    if (e.message === 'URI malformed') {
      return uri;
    }
    throw e;
  }
}

export {
  MatchOption,
  stringContains,
  safeDecodeURI,
};

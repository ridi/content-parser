import { isExists } from './typecheck';


enum MatchOption {
  MATCHING= 0,
  CONTAINING= 1,
  STARTSWITH= 2,
  ENDSWITH= 3,
}

function stringContains(array: string[] = [], string = '', matchOption: MatchOption = MatchOption.MATCHING): boolean {
  const lString = string.toLowerCase();
  return isExists(array.find((item) => {
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
 */
function safeDecodeURI(uri: string): string {
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

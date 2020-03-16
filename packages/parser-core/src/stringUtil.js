import { isExists } from './typecheck';

const MatchOption = {
  MATCHING: 0,
  CONTAINING: 1,
  STARTSWITH: 2,
  ENDSWITH: 3,
};

function stringContains(array = [], string = '', matchOption = MatchOption.MATCHING) {
  const lString = string.toLowerCase();
  return isExists(array.find((item) => {
    const lItem = item.toLowerCase();
    switch (matchOption) {
      case MatchOption.CONTAINING:
        if (lItem.indexOf(lString) >= 0) { return true; }
        break;
      case MatchOption.STARTSWITH:
        if (lItem.startsWith(lString)) { return true; }
        break;
      case MatchOption.ENDSWITH:
        if (lItem.endsWith(lString)) { return true; }
        break;
      default:
        if (lItem === lString) { return true; }
        break;
    }
    return false;
  }));
}

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

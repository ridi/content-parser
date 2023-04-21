import { isExists } from "./typecheck";

enum MatchOption {
  MATCHING,
  CONTAINING,
  STARTSWITH,
  ENDSWITH,
}

function stringContains(
  array: string[] = [],
  string = "",
  matchOption = MatchOption.MATCHING
) {
  const lString = string.toLowerCase();
  return isExists(
    array.find((item) => {
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
    })
  );
}

function safeDecodeURI(uri: string) {
  try {
    return decodeURI(uri);
  } catch (e) {
    if (e.message === "URI malformed") {
      return uri;
    }
    throw e;
  }
}

export { MatchOption, stringContains, safeDecodeURI };

import { isExists } from './typecheck';

export default function stringContains(array, string) {
  const lString = string.toLowerCase();
  return isExists(array.map(item => item.toLowerCase()).find(item => item === lString));
}

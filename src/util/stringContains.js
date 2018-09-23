export default function stringContains(array = [], string = '') {
  const lString = string.toLowerCase();
  return array.map(item => item.toLowerCase()).includes(lString);
}

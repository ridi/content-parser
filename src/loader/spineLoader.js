import parse5 from 'parse5';

import { isExists } from '../utils';

export default function spineLoader(spineItem, file, options) {
  if (options.extractBody) {
    const document = parse5.parse(file);
    const html = document.childNodes.find(child => child.tagName === 'html');
    const body = html.childNodes.find(child => child.tagName === 'body');
    const result = {
      body: parse5.serialize(body),
      attrs: body.attrs.concat([{
        name: 'class',
        value: spineItem.styles.map(style => ` .${style.namespace}`).join(',').trim(),
      }]),
    };
    if (isExists(options.extractAdapter)) {
      return options.extractAdapter(result);
    }
    return result;
  }
  return file;
}

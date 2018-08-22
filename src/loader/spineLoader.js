import parse5 from 'parse5';
import treeAdapter from 'parse5/lib/tree-adapters/default';

import {
  isExists,
  isUrl,
  containString,
  removeLastPathComponent,
  safePathJoin,
} from '../utils';

function getAttrList(element) {
  return this.handleAttrs(element.attrs);
}
treeAdapter.getAttrList = getAttrList;

export default function spineLoader(spineItem, file, options) {
  const document = isExists(options.basePath) || options.spine.extractBody ? parse5.parse(file) : undefined;
  if (isExists(document)) {
    if (isExists(options.basePath)) {
      treeAdapter.handleAttrs = (attrs) => { // eslint-disable-line arrow-body-style
        return attrs.map((attr) => {
          if (containString(attr.name, ['href', 'src']) && !isUrl(attr.value)) {
            attr.value = safePathJoin(options.basePath, removeLastPathComponent(spineItem.href), attr.value);
          }
          return attr;
        });
      };
    } else {
      treeAdapter.handleAttrs = attrs => attrs;
    }
    if (options.spine.extractBody) {
      const html = document.childNodes.find(child => child.tagName === 'html');
      const body = html.childNodes.find(child => child.tagName === 'body');
      const result = {
        body: parse5.serialize(body, { treeAdapter }),
        attrs: body.attrs.concat([{
          name: 'class',
          value: spineItem.styles.map(style => ` .${style.namespace}`).join(',').trim(),
        }]),
      };
      if (isExists(options.spine.extractAdapter)) {
        return options.spine.extractAdapter(result.body, result.attrs);
      }
      return result;
    }
    return parse5.serialize(document, { treeAdapter });
  }
  return file;
}

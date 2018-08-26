import { arrayIncludes } from 'himalaya/lib/compat';
import { parse, parseDefaults } from 'himalaya';

import {
  isExists,
  isUrl,
  stringContains,
  mergeObjects,
  safeDirname,
  safePathJoin,
} from '../util';

function formatAttributes(attributes, options) {
  return attributes.reduce((attrs, attribute) => {
    const { key, value } = attribute;
    if (value === null) {
      return `${attrs} ${key}`;
    }
    if (isExists(options.basePath) && stringContains(['href', 'src'], key) && !isUrl(value)) {
      return `${attrs} ${key}="${safePathJoin(options.basePath, value)}"`;
    }
    return `${attrs} ${key}="${value}"`;
  }, '');
}

function stringify(tree, options) {
  return tree.map((node) => {
    if (node.type === 'text') {
      return node.content;
    }
    if (node.type === 'comment') {
      return `<!--${node.content}-->`;
    }
    const { tagName, attributes, children } = node;
    const isSelfClosing = arrayIncludes(options.voidTags, tagName);
    return isSelfClosing
      ? `<${tagName}${formatAttributes(attributes, options)}${tagName !== '!doctype' ? '/' : ''}>`
      : `<${tagName}${formatAttributes(attributes, options)}>${stringify(children, options)}</${tagName}>`;
  }).join('');
}

export default function spineLoader(spineItem, file, options) {
  if (!isExists(options.basePath) && !options.spine.extractBody) {
    return file;
  }

  const document = parse(file);
  const stringifyOptions = mergeObjects(parseDefaults, {
    basePath: isExists(options.basePath)
      ? safePathJoin(options.basePath, safeDirname(spineItem.href)) : undefined,
  });

  if (options.spine.extractBody) {
    const html = document.find(child => child.tagName === 'html');
    const body = html.children.find(child => child.tagName === 'body');
    const result = {
      body: stringify(body.children, stringifyOptions),
      attrs: body.attributes.concat([{
        key: 'class',
        value: spineItem.styles.map(style => ` .${style.namespace}`).join(',').trim(),
      }]),
    };
    if (isExists(options.spine.extractAdapter)) {
      return options.spine.extractAdapter(result.body, result.attrs);
    }
    return result;
  }

  return stringify(document, stringifyOptions);
}

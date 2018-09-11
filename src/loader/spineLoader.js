import { arrayIncludes } from 'himalaya/lib/compat';
import { parse, parseDefaults } from 'himalaya';

import cssLoader from './cssLoader';
import CssItem from '../model/CssItem';
import {
  isExists,
  isUrl,
  stringContains,
  mergeObjects,
  safeDirname,
  safePathJoin,
} from '../util';

// Type reference: https://github.com/andrejewski/himalaya/blob/master/text/ast-spec-v1.md
const Types = {
  TEXT: 'text',
  COMMENT: 'comment',
  ELEMENT: 'element',
};

const Names = {
  Attr: {
    HREF: 'href',
    SRC: 'src',
    STYLE: 'style',
  },
  Tag: {
    DOCTYPE: '!doctype',
    STYLE: 'style',
  },
};

function formatAttributes(attributes, options) {
  return attributes.reduce((attrs, attribute) => {
    const { key, value } = attribute;
    if (value === null) {
      return `${attrs} ${key}`;
    }
    if (options.spine.useCssOptions && key === Names.Attr.STYLE) {
      const dummyItem = new CssItem({ href: '' });
      // css-tree does not work unless style is wrapped in a block.
      const text = cssLoader(dummyItem, `tmp{${value}}`, options).replace(/'|"/gm, '');
      return `${attrs} ${key}="${text.substring(4, text.length - 1)}"`;
    }
    if (isExists(options.basePath) && stringContains([Names.Attr.HREF, Names.Attr.SRC], key) && !isUrl(value)) {
      // src="../Images/background.jpg" => src="{basePath}/OEBPS/Images/background.jpg"
      return `${attrs} ${key}="${safePathJoin(options.basePath, value)}"`;
    }
    return `${attrs} ${key}="${value}"`;
  }, '');
}

function stringify(tree, options) {
  return tree.map((node) => {
    if (node.type === Types.TEXT) {
      return node.content;
    }
    if (node.type === Types.COMMENT) {
      return `<!--${node.content}-->`;
    }
    const { tagName, attributes, children } = node;
    const isSelfClosing = arrayIncludes(options.voidTags, tagName);
    if (options.spine.useCssOptions && tagName === Names.Tag.STYLE && children.length === 1) {
      const dummyItem = new CssItem({ href: '' });
      const inlineStyle = children[0].content;
      const text = cssLoader(dummyItem, inlineStyle, options);
      return `<${tagName}${formatAttributes(attributes, options)}>${text}</${tagName}>`;
    }
    return isSelfClosing
      ? `<${tagName}${formatAttributes(attributes, options)}${tagName !== Names.Tag.DOCTYPE ? '/' : ''}>`
      : `<${tagName}${formatAttributes(attributes, options)}>${stringify(children, options)}</${tagName}>`;
  }).join('');
}

export default function spineLoader(spineItem, file, options = { spine: {}, css: {} }) {
  const document = parse(file);
  const stringifyOptions = mergeObjects(parseDefaults, mergeObjects(options, {
    basePath: isExists(options.basePath)
      ? safePathJoin(options.basePath, safeDirname(spineItem.href))
      : undefined,
  }));

  if (options.spine.extractBody) {
    const html = document.find(child => child.tagName === 'html');
    const body = html.children.find(child => child.tagName === 'body');
    let attrs = body.attributes;
    if (isExists(spineItem.styles)) {
      attrs = attrs.concat([{
        key: 'class',
        value: spineItem.styles.map(style => ` .${style.namespace}`).join(',').trim(),
      }]);
    }
    const result = { body: stringify(body.children, stringifyOptions), attrs };
    if (isExists(options.spine.extractAdapter)) {
      return options.spine.extractAdapter(result.body, result.attrs);
    }
    return result;
  }

  return stringify(document, stringifyOptions);
}

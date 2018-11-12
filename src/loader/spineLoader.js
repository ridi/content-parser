import { arrayIncludes } from 'himalaya/lib/compat';
import { parse, parseDefaults } from 'himalaya';
import path from 'path';

import cssLoader from './cssLoader';
import CssItem from '../model/CssItem';
import {
  isExists,
  isFunc,
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
  Attrs: {
    HREF: 'href',
    SRC: 'src',
    STYLE: 'style',
  },
  Tags: {
    DOCTYPE: '!doctype',
    STYLE: 'style',
    A: 'a',
  },
};

function formatAttributes(attributes, options) {
  return attributes.reduce((attrs, attribute) => {
    const { key, value } = attribute;
    if (value === null) {
      return `${attrs} ${key}`;
    }
    if (options.spine.useCssOptions && key === Names.Attrs.STYLE) {
      const dummyItem = new CssItem({ href: '' });
      // css-tree does not work unless style value is wrapped in a block.
      const text = cssLoader(dummyItem, `tmp{${value}}`, options).replace(/'|"/gm, '');
      return `${attrs} ${key}="${text.substring(4, text.length - 1)}"`;
    }
    if (!isUrl(value) && stringContains([Names.Attrs.HREF, Names.Attrs.SRC], key)) {
      const { basePath, spine } = options;
      if (spine.serializedAnchor && key === Names.Attrs.HREF) {
        const components = value.split('#');
        const spineIndex = spine.serializedAnchor[path.basename(components[0])];
        if (isExists(spineIndex)) {
          // href="#title" => href="#title"
          // href="./Section00001" => href="0"
          // href="./Section00001#title" => href="0#title"
          return `${attrs} ${key}="${spineIndex}${components[1] ? `#${components[1]}` : ''}"`;
        }
      }
      if (isExists(basePath) && value.split('#')[0].length > 0) {
        // href="#title" => href="#title"
        // src="../Images/background.jpg" => src="{basePath}/OEBPS/Images/background.jpg"
        return `${attrs} ${key}="${safePathJoin(basePath, value)}"`;
      }
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
    if (options.spine.useCssOptions && tagName === Names.Tags.STYLE && children.length === 1) {
      const dummyItem = new CssItem({ href: '' });
      const inlineStyle = children[0].content;
      const text = cssLoader(dummyItem, inlineStyle, options);
      return `<${tagName}${formatAttributes(attributes, options)}>${text}</${tagName}>`;
    }
    return isSelfClosing
      ? `<${tagName}${formatAttributes(attributes, options)}${tagName !== Names.Tags.DOCTYPE ? '/' : ''}>`
      : `<${tagName}${formatAttributes(attributes, options)}>${stringify(children, options)}</${tagName}>`;
  }).join('');
}

export default function spineLoader(spineItem, file, options = { spine: {}, css: {} }) {
  const document = parse(file);
  const stringifyOptions = mergeObjects(parseDefaults, mergeObjects(options, {
    basePath: isExists(options.basePath)
      ? safePathJoin(options.basePath, safeDirname(spineItem.href))
      : undefined,
    spine: {
      serializedAnchor: options.spine.serializedAnchor === true
        ? spineItem.list.reduce((map, item) => { map[path.basename(item.href)] = item.spineIndex; return map; }, {})
        : false,
    },
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
    const innerHTML = stringify(body.children, stringifyOptions);
    if (isFunc(options.spine.extractBody)) {
      return options.spine.extractBody(innerHTML, attrs);
    }
    return `<body ${attrs.map(attr => `${attr.key}="${attr.value}"`).join(' ')}>${innerHTML}</body>`;
  }

  return stringify(document, stringifyOptions);
}

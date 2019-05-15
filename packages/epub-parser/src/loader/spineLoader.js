import {
  isExists, isFunc, isUrl,
  mergeObjects,
  safeDirname, safePathJoin,
} from '@ridi/parser-core';

import { arrayIncludes } from 'himalaya/lib/compat';
import { parse, parseDefaults } from 'himalaya';
import path from 'path';

import CssItem from '../model/CssItem';
import cssLoader from './cssLoader';

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
    if (options.usingCssOptions && key === Names.Attrs.STYLE) {
      const dummyItem = new CssItem({ href: '' });
      // css-tree does not work unless style value is wrapped in a block.
      const text = cssLoader(dummyItem, `tmp{${value}}`, options).replace(/'|"/gm, '');
      return `${attrs} ${key}="${text.substring(4, text.length - 1)}"`;
    }
    if (!isUrl(value) && [Names.Attrs.HREF, Names.Attrs.SRC].some(name => key.endsWith(name))) {
      const { basePath, serializedAnchor } = options;
      if (serializedAnchor && key.endsWith(Names.Attrs.HREF)) {
        const components = value.split('#');
        const spineIndex = serializedAnchor[path.basename(components[0])];
        if (isExists(spineIndex)) {
          // href="#title" => href="#title"
          // href="./Section00001" => href="0"
          // href="./Section00001#title" => href="0#title"
          return `${attrs} ${key}="${spineIndex}${components[1] ? `#${components[1]}` : ''}"`;
        }
      }
      if (isExists(basePath) && value.split('#')[0].length > 0) {
        // href="#title" => href="#title"
        // xlink:href="../Images/cover.jpg" => xlink:href="{basePath}/Images/cover.jpg"
        // src="../Images/background.jpg" => src="{basePath}/OEBPS/Images/background.jpg"
        return `${attrs} ${key}="${safePathJoin(basePath, value)}"`;
      }
    }
    return `${attrs} ${key}="${value}"`;
  }, '');
}

function stringify(ast, options) {
  return ast.map((node) => {
    if (node.type === Types.TEXT) {
      return node.content;
    }
    if (node.type === Types.COMMENT) {
      return `<!--${node.content}-->`;
    }
    const { tagName, attributes, children } = node;
    const isSelfClosing = arrayIncludes(options.voidTags, tagName);
    if (options.usingCssOptions && tagName === Names.Tags.STYLE && children.length === 1) {
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

function getSpineIndexMap(spineItem) {
  const map = {};
  let spine = spineItem;
  do {
    map[path.basename(spine.href)] = spine.index;
    spine = spine.next();
  } while (spine);
  return map;
}

function getStringifyOptions(spineItem, options) {
  const additional = {
    basePath: isExists(options.basePath)
      ? safePathJoin(options.basePath, safeDirname(spineItem.href))
      : undefined,
    serializedAnchor: options.serializedAnchor === true
      ? getSpineIndexMap(spineItem.first())
      : false,
    usingCssOptions: Object.keys(options).find(key => key.startsWith('remove')) !== undefined,
  };
  return mergeObjects(parseDefaults, mergeObjects(options, additional));
}

export default function spineLoader(spineItem, string, options = {}) {
  const ast = parse(string);
  const stringifyOptions = getStringifyOptions(spineItem, options);

  if (stringifyOptions.extractBody) {
    const html = ast.find(child => child.tagName === 'html');
    const body = html.children.find(child => child.tagName === 'body');
    let attrs = body.attributes;
    if (isExists(spineItem.styles)) {
      attrs = attrs.concat([{
        key: 'class',
        value: spineItem.styles.map(style => `${style.namespace}`).join(' ').trim(),
      }]);
    }
    const innerHTML = stringify(body.children, stringifyOptions);
    if (isFunc(options.extractBody)) {
      return options.extractBody(innerHTML, attrs);
    }
    return `<body ${attrs.map(attr => `${attr.key}="${attr.value}"`).join(' ')}>${innerHTML}</body>`;
  }

  return stringify(ast, stringifyOptions);
}

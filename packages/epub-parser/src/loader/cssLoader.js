import {
  isExists,
  isUrl,
  isFunc,
  stringContains,
  safeDirname,
  safePathJoin,
} from '@ridi/parser-core';
import csstree, { List } from 'css-tree';

// Type reference: https://github.com/csstree/csstree/blob/master/docs/ast.md
const Types = {
  SELECTOR_LIST: 'SelectorList',
  TYPE_SELECTOR: 'TypeSelector',
  ID_SELECTOR: 'IdSelector',
  CLASS_SELECTOR: 'ClassSelector',
  WHITE_SPACE: 'WhiteSpace',
  STRING: 'String',
  URL: 'Url',
  RAW: 'Raw',
  // See type reference for more types.
};

function getUnwrappingTagList(namespace, options) {
  if (isExists(namespace)) {
    const { extractBody } = options;
    if (extractBody === true) {
      return ['html'];
    }
    if (isFunc(extractBody)) {
      return ['html', 'body'];
    }
  }
  return [];
}

function handleRulePrelude(selectorList, options, cssItem) {
  if (!isExists(selectorList.children)) {
    return false;
  }

  const { namespace } = cssItem;
  const unwrappingTagList = getUnwrappingTagList(namespace, options);
  selectorList.children.each(function (selector, item, list) { // eslint-disable-line
    let shouldRemove = false;
    let shouldUnwrap = false;
    csstree.walk(selector, function (node) { // eslint-disable-line
      const context = this;
      // Ignore nodes in nested selectors
      if (!isExists(context.selector) || context.selector === selectorList) {
        const { name, type } = node;
        if (type === Types.SELECTOR_LIST) {
          // Ignore selectors inside :not()
          if (isExists(context.function) && context.function.name.toLowerCase() !== 'not') {
            if (handleRulePrelude(node, options, cssItem)) {
              shouldRemove = true;
            }
          }
        } else if (type === Types.TYPE_SELECTOR) {
          if (stringContains(options.removeTagSelector || [], name)) {
            shouldRemove = true;
          } else if (stringContains(unwrappingTagList, name)) {
            shouldUnwrap = true;
          }
        } else if (type === Types.ID_SELECTOR) {
          if (stringContains(options.removeIdSelector || [], name)) {
            shouldRemove = true;
          }
        } else if (type === Types.CLASS_SELECTOR) {
          if (stringContains(options.removeClassSelector || [], name)) {
            shouldRemove = true;
          }
        }
      }
    });
    if (shouldRemove) {
      list.remove(item);
    } else if (isExists(namespace)) {
      const namespaceData = { type: Types.CLASS_SELECTOR, name: namespace };
      if (shouldUnwrap) {
        const array = selector.children.toArray();
        if (array.length > 1) {
          const [head] = array;
          if (stringContains(unwrappingTagList, head.name)) {
            selector.children.shift();
            selector.children.prependData(namespaceData);
            return;
          }
        } else {
          selector.children = new List().fromArray([namespaceData]);
          return;
        }
      }
      selector.children.prependData({ type: Types.WHITE_SPACE, value: ' ' });
      selector.children.prependData(namespaceData);
    }
  });
  return selectorList.children.isEmpty();
}

function handleRuleBlock(declarationList, options, cssItem) {
  declarationList.children.each(declaration => {
    let oldItem;
    let newItem;
    csstree.walk(declaration, (node, item) => {
      if (node.type === Types.URL && stringContains([Types.STRING, Types.RAW], node.value.type)) {
        let url = node.value.value.replace(/['"]/g, '');
        if (isExists(options.basePath) && !isUrl(url)) {
          // url(../Image/line.jpg) => url('{basePath}/OEBPS/Image/line.jpg')
          url = safePathJoin(options.basePath, safeDirname(cssItem.href), url);
          oldItem = item;
          newItem = List.createItem({
            type: Types.URL,
            value: {
              type: Types.STRING,
              value: `'${url}'`,
            },
          });
        }
      }
    });
    if (isExists(oldItem) && isExists(newItem)) {
      declaration.value.children.replace(oldItem, newItem);
    }
  });
}

function handleRuleset(node, item, list, options, cssItem) {
  handleRulePrelude(node.prelude, options, cssItem);
  handleRuleBlock(node.block, options, cssItem);
  if ((isExists(node.prelude.children) && node.prelude.children.isEmpty())
    || (isExists(node.block.children) && node.block.children.isEmpty())) {
    list.remove(item);
  }
}

function handleAtrule(node, item, list, options, cssItem) {
  if (node.block) {
    // Otherwise removed at-rule don't prevent @import for removal
    this.stylesheet.firstAtrulesAllowed = false;
    if (isExists(node.block.children) && node.block.children.isEmpty()) {
      list.remove(item);
      return;
    }
  }
  if (stringContains(options.removeAtrules || [], node.name)) {
    list.remove(item);
  } else if (node.name.toLowerCase() === 'font-face') {
    handleRuleBlock(node.block, options, cssItem);
  }
}

const handlers = {
  Atrule: handleAtrule,
  Rule: handleRuleset,
};

export default function cssLoader(cssItem, string, options = {}) {
  const ast = csstree.parse(string);
  csstree.walk(ast, {
    leave: function (node, item, list) { // eslint-disable-line
      const context = this;
      if (isExists(handlers[node.type])) {
        handlers[node.type].call(context, node, item, list, options, cssItem);
      }
    },
  });
  return csstree.generate(ast);
}

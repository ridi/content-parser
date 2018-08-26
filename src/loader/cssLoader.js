import csstree, { List } from 'css-tree';

import {
  isExists,
  isUrl,
  stringContains,
  safeDirname,
  safePathJoin,
} from '../util';

function handleRulePrelude(selectorList, options, cssItem) {
  selectorList.children.each(function(selector, item, list) { // eslint-disable-line
    let shouldRemove = false;
    csstree.walk(selector, function(node) { // eslint-disable-line
      const context = this;
      // Ignore nodes in nested selectors
      if (!isExists(context.selector) || context.selector === selectorList) {
        const { name, type } = node;
        if (type === 'SelectorList') {
          // Ignore selectors inside :not()
          if (isExists(context.function) || context.function.name.toLowerCase() !== 'not') {
            if (handleRulePrelude(node, options, cssItem)) {
              shouldRemove = true;
            }
          }
        } else if (type === 'TypeSelector') {
          if (stringContains(options.css.removeTags, name)) {
            shouldRemove = true;
          }
        } else if (type === 'IdSelector') {
          if (stringContains(options.css.removeIds, name)) {
            shouldRemove = true;
          }
        } else if (type === 'ClassSelector') {
          if (stringContains(options.css.removeClasses, name)) {
            shouldRemove = true;
          }
        }
      }
    });
    if (shouldRemove) {
      list.remove(item);
    } else {
      selector.children.prependData({ type: 'WhiteSpace', value: ' ' });
      selector.children.prependData({ type: 'ClassSelector', name: cssItem.namespace });
    }
  });
  return selectorList.children.isEmpty();
}

function handleRuleBlock(declarationList, options, cssItem) {
  declarationList.children.each((declaration) => {
    let oldItem;
    let newItem;
    csstree.walk(declaration, (node, item) => {
      const { type, value } = node;
      if (type === 'Url' && value.type === 'String') {
        let url = value.value.replace(/['"]/g, '');
        if (isExists(options.basePath) && !isUrl(url)) {
          url = safePathJoin(options.basePath, safeDirname(cssItem.href), url);
        }
        oldItem = item;
        newItem = List.createItem({ type: 'Url', value: { type: 'String', value: `"${url}"` } });
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
  if (node.prelude.children.isEmpty() || node.block.children.isEmpty()) {
    list.remove(item);
  }
}

function handleAtrule(node, item, list, options, cssItem) {
  if (node.block) {
    const context = this;
    if (context.stylesheet !== null) {
      // Otherwise removed at-rule don't prevent @import for removal
      context.stylesheet.firstAtrulesAllowed = false;
    }
    if (node.block.children.isEmpty()) {
      list.remove(item);
      return;
    }
  }
  if (stringContains(options.css.removeAtrules, node.name)) {
    list.remove(item);
  } else if (node.name.toLowerCase() === 'font-face') {
    handleRuleBlock(node.block, options, cssItem);
  }
}

const handlers = {
  Atrule: handleAtrule,
  Rule: handleRuleset,
};

export default function cssLoader(cssItem, file, options) {
  const ast = csstree.parse(file);
  csstree.walk(ast, {
    leave: function(node, item, list) { // eslint-disable-line
      const context = this;
      if (isExists(handlers[node.type])) {
        handlers[node.type].call(context, node, item, list, options, cssItem);
      }
    },
  });
  return csstree.generate(ast);
}

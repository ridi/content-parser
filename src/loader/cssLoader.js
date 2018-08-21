import csstree, { List } from 'css-tree';

import { isExists } from '../utils';

function cleanAtrule(node, item, list, options) {
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
  if (isExists(options.removeAtrules.find(atrule => atrule === node.name))) {
    list.remove(item);
  }
}

function cleanRule(selectorList, options, cssItem) {
  const contain = (target, list) => {
    const lTarget = target.toLowerCase();
    return isExists(list.map(item => item.toLowerCase()).find(item => item === lTarget));
  };
  selectorList.children.each(function(selector, item, list) { // eslint-disable-line
    let shouldRemove = false;
    csstree.walk(selector, function(node, item) { // eslint-disable-line
      const context = this;
      // Ignore nodes in nested selectors
      if (!isExists(context.selector) || context.selector === selectorList) {
        const { name, type } = node;
        if (type === 'SelectorList') {
          // Ignore selectors inside :not()
          if (isExists(context.function) || context.function.name.toLowerCase() !== 'not') {
            if (cleanRule(node, options, cssItem)) {
              shouldRemove = true;
            }
          }
        } else if (type === 'TypeSelector') {
          if (contain(name, options.removeTags)) {
            shouldRemove = true;
          }
        } else if (type === 'IdSelector') {
          if (contain(name, options.removeIds)) {
            shouldRemove = true;
          }
        } else if (type === 'ClassSelector') {
          if (contain(name, options.removeClasses)) {
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

function cleanRuleset(node, item, list, options, cssItem) {
  cleanRule(node.prelude, options, cssItem);
  if (node.prelude.children.isEmpty() || node.block.children.isEmpty()) {
    list.remove(item);
  }
}

const handlers = {
  Atrule: cleanAtrule,
  Rule: cleanRuleset,
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

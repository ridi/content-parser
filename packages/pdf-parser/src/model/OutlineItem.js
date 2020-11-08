import {
  mergeObjects,
  isArray, isExists, isString, BaseItem,
} from '@ridi/parser-core';

import Color from './Color';

class OutlineItem extends BaseItem {
  constructor(rawObj = {}, pageMap = {}) {
    super(rawObj);
    this.dest = rawObj.dest;
    this.url = rawObj.url;
    this.title = rawObj.title || '';
    this.color = new Color(rawObj.color || { 0: 0, 1: 0, 2: 0 });
    this.bold = rawObj.bold || false;
    this.italic = rawObj.italic || false;
    this.depth = rawObj.depth || 0;
    this.children = (rawObj.items || []).map((item) => {
      return new OutlineItem(mergeObjects(item, { depth: this.depth + 1 }), pageMap);
    });
    if (isString(this.dest)) {
      const page = pageMap[this.dest];
      this.page = isExists(page) ? page : rawObj.page;
    } else if (isArray(this.dest) && isExists(this.dest[0])) {
      const page = pageMap[this.dest[0].num];
      this.page = isExists(page) ? page : rawObj.page;
    } else {
      this.page = rawObj.page;
    }
    Object.freeze(this);
  }

  toRaw() {
    return {
      dest: this.dest,
      url: this.url,
      title: this.title,
      color: this.color.toRaw(),
      bold: this.bold,
      italic: this.italic,
      children: this.children.map(child => child.toRaw()),
      page: this.page,
    };
  }
}

export default OutlineItem;

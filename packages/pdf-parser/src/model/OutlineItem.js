import { mergeObjects } from '@ridi/parser-core';

import Color from './Color';

class OutlineItem {
  constructor(rawObj = {}, pageMap = {}) {
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
    this.page = pageMap[this.dest] || rawObj.page;
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

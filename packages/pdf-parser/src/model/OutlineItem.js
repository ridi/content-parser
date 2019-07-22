import { mergeObjects } from '@ridi/parser-core';

class OutlineItem {
  constructor(rawObj = {}) {
    this.dest = rawObj.dest;
    this.url = rawObj.url;
    this.title = rawObj.title || '';
    this.color = rawObj.color || { 0: 0, 1: 0, 2: 0 };
    this.bold = rawObj.bold || false;
    this.italic = rawObj.italic || false;
    this.depth = rawObj.depth || 0;
    this.children = (rawObj.items || []).map((item) => {
      return new OutlineItem(mergeObjects(item, { depth: this.depth + 1 }));
    });
    Object.freeze(this);
  }

  toRaw() {
    return {
      dest: this.dest,
      url: this.url,
      title: this.title,
      color: this.color,
      bold: this.bold,
      italic: this.italic,
      children: this.children.map(child => child.toRaw()),
    };
  }
}

export default OutlineItem;

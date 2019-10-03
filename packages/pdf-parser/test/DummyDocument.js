import { isExists } from '@ridi/parser-core';

export default class DummyDocument {
  constructor(rawObj) {
    this.outline = rawObj.outline || {};
    this.destination = rawObj.destination || {};
    this.pageIndex = rawObj.pageIndex || {};
  }

  async getOutline() {
    return this.outline;
  }
  
  async getDestination(dest) {
    return this.destination[dest];
  }

  async getPageIndex(ref) {
    const pageIndex = this.pageIndex[`${ref.num}`];
    if (!isExists(pageIndex)) {
      throw new Error('The reference does not point to a /Page dictionary.');
    }
    return pageIndex;
  }
}

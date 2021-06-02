import { mergeObjects } from '@ridi/parser-core';

import BaseEpubItem from './BaseEpubItem';
import NavPoint from './NavPoint';
/**
 * @typedef {Object} NcxItemExtra
 * @property {NavPoint} navPoints
 *
 * @typedef {import('./BaseEpubItem').BaseEpubItemParam & NcxItemExtra} NcxItemParam
 */

class NcxItem extends BaseEpubItem {
  get defaultEncoding() { return 'utf8'; }

  /**
   * @type {NavPoint[]}
   */
  navPoints;

  /**
   *
   * @param {NcxItemParam} rawObj
   * @param {boolean} freeze
   */
  constructor(rawObj = {}, freeze = true) {
    super(rawObj, freeze);
    this.navPoints = (rawObj.navPoints || []).map(navPoint => new NavPoint(navPoint, freeze));
    /* istanbul ignore else */
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return mergeObjects(super.toRaw(), {
      navPoints: this.navPoints.map(navPoint => navPoint.toRaw()),
      ItemType: 'NcxItem',
    });
  }
}

export default NcxItem;

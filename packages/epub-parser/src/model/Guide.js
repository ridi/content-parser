import { isExists, stringContains } from '@ridi/parser-core';

const Types = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
  COVER: 'cover', // The book cover(s, jacket information, etc.
  TITLE_PAGE: 'title-page', // Page with possibly title, author, publisher, and other metadata.
  TOC: 'toc', // Table Of Contents.
  INDEX: 'index', // Back-of-book style index.
  GLOSSARY: 'glossary',
  ACKNOWLEDGEMENTS: 'acknowledgements',
  BIBLIOGRAPHY: 'bibliography',
  COLOPHON: 'colophon',
  COPYRIGHT_PAGE: 'copyright-page',
  DEDICATION: 'dedication',
  EPIGRAPH: 'epigraph',
  FOREWORD: 'foreword',
  LOI: 'loi', // List Of Illustrations.
  LOT: 'lot', // List Of Tables.
  NOTES: 'notes',
  PREFACE: 'preface',
  TEXT: 'text', // First "real" page of content. (e.g. "Chapter 1")
});

/**
 * @typedef {Object} GuideParam
 * @property {string} [title]
 * @property {string} [type]
 * @property {string} [href]
 */
class Guide {
  /**
   * @param {GuideParam} rawObj
   * @param {boolean} freeze
   */
  constructor(rawObj = {}, freeze = true) {
    this.title = rawObj.title;
    if (isExists(rawObj.type)) {
      if (stringContains(Object.values(Types), rawObj.type)) {
        this.type = rawObj.type.toLowerCase();
      } else {
        this.type = Types.UNKNOWN;
      }
    } else {
      this.type = Types.UNDEFINED;
    }
    this.href = rawObj.href;
    this.item = undefined;
    if (freeze) {
      Object.freeze(this);
    }
  }

  toRaw() {
    return {
      title: this.title,
      type: this.type,
      href: this.href,
    };
  }
}

Guide.Types = Types;

export default Guide;

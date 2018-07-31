const Types = Object.freeze({
  COVER: Symbol('title'), // The book cover(s), jacket information, etc.
  TITLE_PAGE: Symbol('title-page'), // Page with possibly title, author, publisher, and other metadata.
  TOC: Symbol('toc'), // Table Of Contents.
  INDEX: Symbol('index'), // Back-of-book style index.
  GLOSSARY: Symbol('glossary'),
  ACKNOWLEDGEMENTS: Symbol('acknowledgements'),
  BIBLIOGRAPHY: Symbol('bibliography'),
  COLOPHON: Symbol('colophon'),
  COPYRIGHT_PAGE: Symbol('copyright-page'),
  DEDICATION: Symbol('dedication'),
  EPIGRAPH: Symbol('epigraph'),
  FOREWORD: Symbol('foreword'),
  LOI: Symbol('loi'), // List Of Illustrations.
  LOT: Symbol('lot'), // List Of Tables.
  NOTES: Symbol('notes'),
  PREFACE: Symbol('preface'),
  TEXT: Symbol('text'), // First "real" page of content. (e.g. "Chapter 1")
});

class Guide {
  get title() { return this._title; }

  get type() { return this._type; }

  get href() { return this._href; }
}

export default Guide;

export { Types };

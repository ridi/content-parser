const Types = Object.freeze({
  COVER: 'title', // The book cover(s, jacket information, etc.
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

class Guide {
  get title() { return this._title; }

  get type() { return this._type; }

  get href() { return this._href; }

  get item() { return this._item; }
}

export default Guide;

export { Types };

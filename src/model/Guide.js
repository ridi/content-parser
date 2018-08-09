class Guide {
  constructor(rawObj) {
    this.title = rawObj.title;
    this.type = rawObj.type || Guide.Types.UNDEFINED;
    this.href = rawObj.href;
    this.item = rawObj.item;
    Object.freeze(this);
  }
}

Guide.Types = Object.freeze({
  UNDEFINED: 'undefined',
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

export default Guide;

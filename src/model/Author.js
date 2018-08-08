class Author {
  get name() { return this._name; }

  get role() { return this._role; }
}

// See http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.2.6 for a discussion of role.
Author.Roles = Object.freeze({
  UNDEFINED: 'undefined',
  ADAPTER: 'adp',
  ANNOTATOR: 'ann',
  ARRANGER: 'arr',
  ARTIST: 'art',
  ASSOCIATEDNAME: 'asn',
  AUTHOR: 'aut',
  AUTHOR_IN_QUOTATIONS_OR_TEXT_EXTRACTS: 'aqt',
  AUTHOR_OF_AFTER_WORD_OR_COLOPHON_OR_ETC: 'aft',
  AUTHOR_OF_INTRODUCTIONOR_ETC: 'aui',
  BIBLIOGRAPHIC_ANTECEDENT: 'ant',
  BOOK_PRODUCER: 'bkp',
  COLLABORATOR: 'clb',
  COMMENTATOR: 'cmm',
  DESIGNER: 'dsr',
  EDITOR: 'edt',
  ILLUSTRATOR: 'ill',
  LYRICIST: 'lyr',
  METADATA_CONTACT: 'mdc',
  MUSICIAN: 'mus',
  NARRATOR: 'nrt',
  OTHER: 'oth',
  PHOTOGRAPHER: 'pht',
  PRINTER: 'prt',
  REDACTOR: 'red',
  REVIEWER: 'rev',
  SPONSOR: 'spn',
  THESIS_ADVISOR: 'ths',
  TRANSCRIBER: 'trc',
  TRANSLATOR: 'trl',
});

export default Author;

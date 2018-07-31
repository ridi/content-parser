// See http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.2.6 for a discussion of role.
const Roles = Object.freeze({
  ADAPTER: Symbol('adp'),
  ANNOTATOR: Symbol('ann'),
  ARRANGER: Symbol('arr'),
  ARTIST: Symbol('art'),
  ASSOCIATEDNAME: Symbol('asn'),
  AUTHOR: Symbol('aut'),
  AUTHOR_IN_QUOTATIONS_OR_TEXT_EXTRACTS: Symbol('aqt'),
  AUTHOR_OF_AFTER_WORD_OR_COLOPHON_OR_ETC: Symbol('aft'),
  AUTHOR_OF_INTRODUCTIONOR_ETC: Symbol('aui'),
  BIBLIOGRAPHIC_ANTECEDENT: Symbol('ant'),
  BOOK_PRODUCER: Symbol('bkp'),
  COLLABORATOR: Symbol('clb'),
  COMMENTATOR: Symbol('cmm'),
  DESIGNER: Symbol('dsr'),
  EDITOR: Symbol('edt'),
  ILLUSTRATOR: Symbol('ill'),
  LYRICIST: Symbol('lyr'),
  METADATA_CONTACT: Symbol('mdc'),
  MUSICIAN: Symbol('mus'),
  NARRATOR: Symbol('nrt'),
  OTHER: Symbol('oth'),
  PHOTOGRAPHER: Symbol('pht'),
  PRINTER: Symbol('prt'),
  REDACTOR: Symbol('red'),
  REVIEWER: Symbol('rev'),
  SPONSOR: Symbol('spn'),
  THESIS_ADVISOR: Symbol('ths'),
  TRANSCRIBER: Symbol('trc'),
  TRANSLATOR: Symbol('trl'),
});

class Author {
  get name() { return this._name; }

  get role() { return this._role; }
}

export default Author;

export { Roles };

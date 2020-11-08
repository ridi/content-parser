import { isExists, isString, stringContains } from '@ridi/parser-core';

// See http://www.idpf.org/epub/20/spec/OPF_2.0.1_draft.htm#Section2.2.6 for a discussion of role.
const Roles = Object.freeze({
  UNDEFINED: 'undefined',
  UNKNOWN: 'unknown',
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

/**
 * @typedef {object} AuthorParam
 * @property {string} [name]
 * @property {string} [fileAs]
 * @property {string} [role]
 */
class Author {
  /**
   * @type {string}
   */
  name;

  /**
   * @type {string}
   */
  fileAs;

  /**
   * @type {string}
   */
  role;

  /**
   *
   * @param {string|AuthorParam} rawObj
   */
  constructor(rawObj = {}) {
    if (isString(rawObj)) {
      this.name = rawObj;
    } else {
      this.name = rawObj.name;
    }
    this.fileAs = rawObj.fileAs;
    if (isExists(rawObj.role)) {
      if (stringContains(Object.values(Roles), rawObj.role)) {
        this.role = rawObj.role.toLowerCase();
      } else {
        this.role = Roles.UNKNOWN;
      }
    } else {
      this.role = Roles.UNDEFINED;
    }
    Object.freeze(this);
  }

  toRaw() {
    return {
      name: this.name,
      fileAs: this.fileAs,
      role: this.role,
    };
  }
}

Author.Roles = Roles;

export default Author;

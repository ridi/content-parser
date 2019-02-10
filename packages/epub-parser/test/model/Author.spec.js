import { assert, should } from 'chai';

import Author from '../../src/model/Author';

should(); // Initialize should

describe('Model - Author', () => {
  it('Initialize test', () => {
    let author = new Author();
    assert(author.name === undefined);
    assert(author.fileAs === undefined);
    assert(author.role === Author.Roles.UNDEFINED);

    author = new Author('Davin Ahn');
    author.name.should.equal('Davin Ahn');
    assert(author.fileAs === undefined);
    author.role.should.equal(Author.Roles.UNDEFINED);

    author = new Author({ name: 'Davin Ahn', role: 'auT' });
    author.name.should.equal('Davin Ahn');
    assert(author.fileAs === undefined);
    author.role.should.equal(Author.Roles.AUTHOR);

    author = new Author({ name: 'Davin Ahn', fileAs: 'Davin Ahn.', role: 'Invalid role' });
    author.name.should.equal('Davin Ahn');
    author.fileAs.should.equal('Davin Ahn.');
    author.role.should.equal(Author.Roles.UNKNOWN);

    (() => {
      author.name = 'Ahn Davin';
      author.fileAs = 'Davin Ahn.';
      author.role = Author.Roles.AUTHOR;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let author = new Author({});
    author.toRaw().should.deep.equal({ name: undefined, fileAs: undefined, role: Author.Roles.UNDEFINED });

    author = new Author('Davin Ahn');
    author.toRaw().should.deep.equal({ name: 'Davin Ahn', fileAs: undefined, role: Author.Roles.UNDEFINED });

    author = new Author({ name: 'Davin Ahn', role: 'auT' });
    author.toRaw().should.deep.equal({ name: 'Davin Ahn', fileAs: undefined, role: Author.Roles.AUTHOR });

    author = new Author({ name: 'Davin Ahn', fileAs: 'Davin Ahn.', role: 'Invalid role' });
    author.toRaw().should.deep.equal({ name: 'Davin Ahn', fileAs: 'Davin Ahn.', role: Author.Roles.UNKNOWN });
  });
});

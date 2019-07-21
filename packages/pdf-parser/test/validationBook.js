import { isExists } from '@ridi/parser-core';

import Book from '../src/model/Book';

export default function validationBook(book, expectedBook) {
  book.should.be.an.instanceOf(Book);

  book.pageCount.should.equal(expectedBook.pageCount);
  book.version.toString().should.deep.equal(expectedBook.version);
  book.author.should.equal(expectedBook.author);
  book.subject.should.equal(expectedBook.subject);
  book.keywords.should.equal(expectedBook.keywords);
  book.creator.should.equal(expectedBook.creator);
  book.producer.should.equal(expectedBook.producer);
  book.creationDate.should.equal(expectedBook.creationDate);
  isExists(book.modificationDate).should.equal(isExists(expectedBook.modificationDate));

  const outlineItemEquals = (actual, expected) => {
    actual.dest.should.equal(expected.dest);
    isExists(actual.url).should.equal(isExists(expected.url));
    actual.title.should.equal(expected.title);
    actual.bold.should.equal(expected.bold);
    actual.italic.should.equal(expected.italic);
    actual.depth.should.equal(expected.depth);
    actual.children.should.have.lengthOf(expected.children.length);
    actual.children.forEach((outlineItem, idx) => outlineItemEquals(outlineItem, expected.children[idx]));
  };
  book.outlineItems.should.have.lengthOf(expectedBook.outlineItems.length);
  book.outlineItems.forEach((outlineItem, idx) => outlineItemEquals(outlineItem, expectedBook.outlineItems[idx]));
}

import { isExists } from '@ridi/parser-core';

import Book from '../src/model/Book';

export default function validationBook(book, expectedBook) {
  book.should.be.an.instanceOf(Book);

  book.version.toString().should.deep.equal(expectedBook.version);
  book.author.should.equal(expectedBook.author);
  book.subject.should.equal(expectedBook.subject);
  book.keywords.should.equal(expectedBook.keywords);
  book.creator.should.equal(expectedBook.creator);
  book.producer.should.equal(expectedBook.producer);
  book.creationDate.should.equal(expectedBook.creationDate);
  isExists(book.modificationDate).should.equal(isExists(expectedBook.modificationDate));
  book.isLinearized.should.equal(expectedBook.isLinearized);
  book.isAcroFormPresent.should.equal(expectedBook.isAcroFormPresent);
  book.isXFAPresent.should.equal(expectedBook.isXFAPresent);
  book.isCollectionPresent.should.equal(expectedBook.isCollectionPresent);
  book.userInfo.should.deep.equal(expectedBook.userInfo);

  const outlineItemEquals = (actual, expected) => {
    actual.dest.should.equal(expected.dest);
    isExists(actual.url).should.equal(isExists(expected.url));
    actual.title.should.equal(expected.title);
    actual.bold.should.equal(expected.bold);
    actual.italic.should.equal(expected.italic);
    actual.depth.should.equal(expected.depth);
    actual.children.should.have.lengthOf(expected.children.length);
    actual.children.forEach((outlineItem, idx) => outlineItemEquals(outlineItem, expected.children[idx]));
    if (isExists(actual.page)) {
      actual.page.should.equal(expected.page);
    }
  };
  book.outlineItems.should.have.lengthOf(expectedBook.outlineItems.length);
  book.outlineItems.forEach((outlineItem, idx) => outlineItemEquals(outlineItem, expectedBook.outlineItems[idx]));

  isExists(book.permissions._rawValue).should.equal(isExists(expectedBook.permissions._rawValue));
  book.permissions.allowPrinting.should.equal(expectedBook.permissions.allowPrinting);
  book.permissions.allowContentsModifying.should.equal(expectedBook.permissions.allowContentsModifying);
  book.permissions.allowCopying.should.equal(expectedBook.permissions.allowCopying);
  book.permissions.allowAnnotationsModifying.should.equal(expectedBook.permissions.allowAnnotationsModifying);
  book.permissions.allowInteractiveFormsModifying.should.equal(expectedBook.permissions.allowInteractiveFormsModifying);
  book.permissions.allowCopyingForAccessibility.should.equal(expectedBook.permissions.allowCopyingForAccessibility);
  book.permissions.allowAssembling.should.equal(expectedBook.permissions.allowAssembling);
  book.permissions.allowHighQualityPrinting.should.equal(expectedBook.permissions.allowHighQualityPrinting);

  book.pageCount.should.equal(expectedBook.pageCount);
}

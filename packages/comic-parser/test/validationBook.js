import { isExists } from '@ridi/parser-core';

import Book from '../src/model/Book';
import Item from '../src/model/Item';

export default function validationBook(book, expectedBook, parseOptions = {}) {
  book.should.be.an.instanceOf(Book);

  book.items.should.have.lengthOf(expectedBook.items.length);
  book.items.forEach((item, idx) => {
    const expectedItem = expectedBook.items[idx];
    const { parseImageSize } = parseOptions;
    item.index.should.equal(expectedItem.index);
    item.path.should.equal(expectedItem.path);
    item.size.should.equal(expectedItem.size);
    if (parseImageSize === true || Number.isInteger(parseImageSize)) {
      item.width.should.equal(expectedItem.width);
      item.height.should.equal(expectedItem.height);
    } else {
      isExists(item.width).should.be.false;
      isExists(item.height).should.be.false;
    }
  });
}

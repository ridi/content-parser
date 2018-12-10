import { isExists } from '@ridi/parser-core';

import Book from '../src/model/Book';
import Item from '../src/model/Item';

export default function validationBook(book, expectedBook) {
  book.should.be.an.instanceOf(Book);

  book.items.should.have.lengthOf(expectedBook.items.length);
  book.items.forEach((item, idx) => {
    const expectedItem = expectedBook.items[idx];
    item.index.should.equal(expectedItem.index);
    item.path.should.equal(expectedItem.path);
    item.size.should.equal(expectedItem.size);
  });
}

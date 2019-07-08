import Book from '../src/model/Book';
import Item from '../src/model/Item';

export default function validationBook(book, expectedBook, parseOptions = {}) {
  book.should.be.an.instanceOf(Book);

  book.items.should.have.lengthOf(expectedBook.items.length);
  book.items.forEach((item, idx) => {
    const expectedItem = expectedBook.items[idx];
    item.pageId.should.equal(expectedItem.pageId);
  });
}

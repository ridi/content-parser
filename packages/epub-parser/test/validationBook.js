import { isExists } from '@ridi/parser-core';
import { assert } from 'chai';

import EpubBook from '../src/model/EpubBook';
import EpubParser from '../src/EpubParser';
import SpineItem from '../src/model/SpineItem';

export default function validationBook(book, expectedBook, options = EpubParser.parseDefaultOptions) {
  book.should.be.an.instanceOf(EpubBook);

  book.titles.should.have.lengthOf(expectedBook.titles.length);
  book.titles.forEach((title, idx) => {
    title.should.equal(expectedBook.titles[idx]);
  });

  book.creators.should.have.lengthOf(expectedBook.creators.length);
  book.creators.forEach((creator, idx) => {
    const expectedCreator = expectedBook.creators[idx];
    creator.name.should.equal(expectedCreator.name);
    creator.role.should.equal(expectedCreator.role);
  });

  book.subjects.should.have.lengthOf(expectedBook.subjects.length);
  book.subjects.forEach((subject, idx) => {
    subject.should.equal(expectedBook.subjects[idx]);
  });

  book.description.should.equal(expectedBook.description);

  book.publisher.should.equal(expectedBook.publisher);

  book.contributors.should.have.lengthOf(expectedBook.contributors.length);
  book.contributors.forEach((contributor, idx) => {
    const expectedContributor = expectedBook.contributors[idx];
    contributor.name.should.equal(expectedContributor.name);
    contributor.role.should.equal(expectedContributor.role);
  });

  book.dates.should.have.lengthOf(expectedBook.dates.length);
  book.dates.forEach((date, idx) => {
    const expectedDate = expectedBook.dates[idx];
    date.value.should.equal(expectedDate.value);
    date.event.should.equal(expectedDate.event);
  });

  book.type.should.equal(expectedBook.type);

  book.format.should.equal(expectedBook.format);

  book.identifiers.should.have.lengthOf(expectedBook.identifiers.length);
  book.identifiers.forEach((identifier, idx) => {
    const expectedIdentifier = expectedBook.identifiers[idx];
    identifier.value.should.equal(expectedIdentifier.value);
    identifier.scheme.should.equal(expectedIdentifier.scheme);
  });

  book.source.should.equal(expectedBook.source);

  book.languages.should.deep.equal(expectedBook.languages);

  book.relation.should.equal(expectedBook.relation);

  book.coverage.should.equal(expectedBook.coverage);

  book.rights.should.equal(expectedBook.rights);

  book.version.toString().should.equal(expectedBook.version);

  book.items.should.have.lengthOf(expectedBook.items.length);
  book.items.forEach((item, idx) => {
    const expectedItem = expectedBook.items[idx];
    item.id.should.equal(expectedItem.id);
    item.href.should.equal(expectedItem.href);
    item.mediaType.should.equal(expectedItem.mediaType);
    if (isExists(item.size)) {
      item.isFileExists.should.be.true;
    } else {
      item.isFileExists.should.be.false;
    }
  });

  const navPointEquals = (actual, expected) => {
    actual.id.should.equal(expected.id);
    actual.label.should.equal(expected.label);
    actual.src.should.equal(expected.src);
    assert(actual.anchor === expected.anchor);
    actual.depth.should.equal(expected.depth);
    actual.children.should.have.lengthOf(expected.children.length);
    actual.children.forEach((navPoint, idx) => navPointEquals(navPoint, expected.children[idx]));
    if (isExists(actual.spine)) {
      actual.spine.id.should.equal(expected.spine.id);
    } else {
      assert(actual.spine === expected.spine);
    }
  };
  book.ncx.navPoints.should.have.lengthOf(expectedBook.ncx.navPoints.length);
  book.ncx.navPoints.forEach((navPoint, idx) => navPointEquals(navPoint, expectedBook.ncx.navPoints[idx]));

  book.spines.should.have.lengthOf(expectedBook.spines.length);
  book.spines.forEach((spine, idx) => {
    const expectedSpine = expectedBook.spines[idx];
    spine.id.should.equal(expectedSpine.id);
    spine.index.should.equal(expectedSpine.index);
    spine.isLinear.should.equal(expectedSpine.isLinear);
    if (!options.parseStyle) {
      isExists(spine.styles).should.be.false;
    } else {
      spine.styles.forEach((style, idx) => {
        const expectedStyle = expectedSpine.styles[idx];
        style.namespace.should.equal(expectedStyle.namespace);
      });
    }
  });

  book.spines.forEach((spine, idx, list) => {
    spine.first().should.deep.equal(list[0]);
    if (isExists(spine.prev())) {
      spine.prev().should.deep.equal(list[idx - 1]);
    } else {
      idx.should.equal(0);
    }
    if (isExists(spine.next())) {
      spine.next().should.deep.equal(list[idx + 1]);
    } else {
      idx.should.equal(list.length - 1);
    }
  });

  book.fonts.should.have.lengthOf(expectedBook.fonts.length);
  book.fonts.forEach((font, idx) => {
    font.id.should.equal(expectedBook.fonts[idx].id);
  });

  book.cover.id.should.equal(expectedBook.cover.id);

  book.images.should.have.lengthOf(expectedBook.images.length);
  book.images.forEach((image, idx) => {
    image.id.should.equal(expectedBook.images[idx].id);
  });

  book.styles.should.have.lengthOf(expectedBook.styles.length);
  book.styles.forEach((style, idx) => {
    const expectedStyle = expectedBook.styles[idx];
    style.id.should.equal(expectedStyle.id);
    if (options.parseStyle) {
      style.namespace.should.equal(expectedStyle.namespace);
    } else {
      isExists(style.namespace).should.be.false;
    }
  });

  book.guides.should.have.lengthOf(expectedBook.guides.length);
  book.guides.forEach((guide, idx) => {
    const expectedGuide = expectedBook.guides[idx];
    guide.title.should.equal(expectedGuide.title);
    guide.type.should.equal(expectedGuide.type);
    guide.item.id.should.equal(expectedGuide.item.id);
    if (guide.item) {
      guide.item.id.should.equal(expectedGuide.item.id);
    } else {
      isExists(guide.item).should.be.false;
    }
  });
}

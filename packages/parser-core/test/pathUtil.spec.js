import { should } from 'chai';
import path from 'path';

import { getPathes, safeDirname, safePathJoin } from '../src/pathUtil';
import Paths from '../../../test/paths';

should(); // Initialize should

describe('Util - Path utils', () => {
  it('safeDirname test', () => {
    safeDirname('temp\\a\\b\\c\\foo.epub').should.equal('temp/a/b/c');
  });

  it('safePathJoin test', () => {
    safePathJoin('temp', 'a', 'b', 'c').should.equal('temp/a/b/c');
    safePathJoin('temp', undefined).should.equal('');
    safePathJoin('temp', '..', '..', 'a', 'b').should.equal('../a/b');
    safePathJoin('..', '..', 'temp').should.equal('../../temp');
  });

  it('getPathes test', () => {
    let expectedList = [
      path.join('META-INF', 'container.xml'),
      path.join('OEBPS', 'Fonts', 'NotoSans-Regular.ttf'),
      path.join('OEBPS', 'Images', 'ridibooks.png'),
      path.join('OEBPS', 'Images', 'ridibooks_logo.png'),
      path.join('OEBPS', 'Styles', 'Style0001.css'),
      path.join('OEBPS', 'Text', 'Cover.xhtml'),
      path.join('OEBPS', 'Text', 'Section0001.xhtml'),
      path.join('OEBPS', 'Text', 'Section0002.xhtml'),
      path.join('OEBPS', 'Text', 'Section0004.xhtml'),
      path.join('OEBPS', 'Text', 'Section0005.xhtml'),
      path.join('OEBPS', 'Text', 'Section0006.xhtml'),
      path.join('OEBPS', 'Video', 'empty.mp4'),
      path.join('OEBPS', 'content.opf'),
      path.join('OEBPS', 'toc.ncx'),
      path.join('mimetype'),
    ];
    const offset = path.normalize(Paths.UNZIPPED_DEFAULT).length + path.sep.length;
    getPathes(Paths.UNZIPPED_DEFAULT).map(subpath => subpath.substring(offset)).should.deep.equal(expectedList);

    expectedList = [
      '!000.jpg',
      '000.jpg',
      '1.jpg',
      '1/1.jpg',
      '1/2.jpg',
      '1/3.jpg',
      '2.jpg',
      '3.jpg',
      '10.jpg',
      '11.jpg',
      '12.jpg',
      '13.jpg',
      'A1.jpg',
      'A111.jpg',
      '__test__.jpg',
      'a.jpg',
      'a11.jpg',
    ];
    getPathes(Paths.SORT_TEST).map(subpath => subpath.replace(`${Paths.SORT_TEST}/`, '')).should.deep.equal(expectedList);
  });
});

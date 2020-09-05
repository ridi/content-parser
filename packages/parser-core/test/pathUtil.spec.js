import { should } from 'chai';
import path from 'path';

import { getPathes, safeDirname, safePathJoin } from '../src/pathUtil';
import Paths from '../../../test/paths';

should(); // Initialize should

describe('Util - Path utils', () => {
  it('safeDirname test', () => {
    safeDirname('temp/a/b/c/foo.epub').should.equal('temp/a/b/c');
    safeDirname('temp\\a\\b\\c\\foo.epub').should.equal('temp/a/b/c');
    safeDirname('https://a.com/b.epub').should.equal('https://a.com');
  });

  it('safePathJoin test', () => {
    safePathJoin('temp', 'a', 'b', 'c').should.equal('temp/a/b/c');
    safePathJoin('temp', undefined).should.equal('');
    safePathJoin('temp', '..', '..', 'a', 'b').should.equal('../a/b');
    safePathJoin('..', '..', 'temp').should.equal('../../temp');
    safePathJoin('https://', 'a.com', 'b.epub').should.equal('https://a.com/b.epub');
  });

  it('getPathes test', () => {
    let expectedList = [
      path.join('META-INF', 'container.xml'),
      path.join('OEBPS', 'Fonts', 'NotoSans-Regular.ttf'),
      path.join('OEBPS', 'Images', 'ridibooks.png'),
      path.join('OEBPS', 'Images', 'ridibooks_logo.png'),
      path.join('OEBPS', 'Styles', 'Style0001.css'),
      path.join('OEBPS', 'Text', 'Cover.xhtml'),
      path.join('OEBPS', 'Text', 'Section 0007.xhtml'),
      path.join('OEBPS', 'Text', 'Section%200008.xhtml'),
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
    let offset = path.normalize(Paths.UNZIPPED_DEFAULT).length + path.sep.length;
    getPathes(Paths.UNZIPPED_DEFAULT).map(subpath => subpath.substring(offset)).should.deep.equal(expectedList);

    expectedList = [
      path.join('!000.jpg'),
      path.join('000.jpg'),
      path.join('1.jpg'),
      path.join('1', '1.jpg'),
      path.join('1', '2.jpg'),
      path.join('1', '3.jpg'),
      path.join('2.jpg'),
      path.join('3.jpg'),
      path.join('10.jpg'),
      path.join('11.jpg'),
      path.join('12.jpg'),
      path.join('13.jpg'),
      path.join('A1.jpg'),
      path.join('A111.jpg'),
      path.join('__test__.jpg'),
      path.join('a.jpg'),
      path.join('a11.jpg'),
    ];
    offset = path.normalize(Paths.SORT_TEST).length + path.sep.length;
    getPathes(Paths.SORT_TEST).map(subpath => subpath.substring(offset)).should.deep.equal(expectedList);
  });
});

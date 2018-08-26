import { should } from 'chai';
import path from 'path';

import {
  safeDirname,
  safePath,
  safePathJoin,
  safePathNormalize,
  getPathes,
} from '../../src/util/pathUtil';
import Files from '../files';

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
    const expectedPathes = [
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
    const offset = path.normalize(Files.UNZIPPED_DEFAULT).length + path.sep.length;
    const pathes = getPathes(Files.UNZIPPED_DEFAULT).map(subpath => subpath.substring(offset));
    pathes.should.deep.equal(expectedPathes);
  });
});

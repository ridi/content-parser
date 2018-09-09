import { assert, should } from 'chai';
import fs from 'fs';

import EpubParser from '../../src/EpubParser';
import Files from '../files';
import { mergeObjects } from '../../src/util';
import spineLoader from '../../src/loader/spineLoader';

should(); // Initialize should

const read = file => fs.readFileSync(file, 'utf8');

const html = read(Files.SPINE_LOADER_ORIGIN);

describe('Loader - Spine', () => {  
  it('No options test', () => {
    spineLoader({}, html).should.equal(read(Files.SPINE_LOADER_NO_OPTIONS));
  });

  it('extractBody option test', () => {
    // Not used parseOptions.useStyleNamespace option.
    let result = spineLoader({}, html, { spine: { extractBody: true, extractAdapter: undefined } });
    result.should.deep.equal(JSON.parse(read(Files.SPINE_LOADER_NO_ADAPTER)));

    // used parseOptions.useStyleNamespace option.
    const styles = [
      { namespace: 'ridi_style1' },
      { namespace: 'ridi_style2' },
    ];
    result = spineLoader({ styles }, html, { spine: { extractBody: true, extractAdapter: undefined } });
    result.attrs.find(attr => attr.key === 'class').should.deep.equal({
      key: 'class', value: '.ridi_style1, .ridi_style2',
    });
  });

  it('extractBody + extractAdapter options test', () => {
    const extractAdapter = EpubParser.readDefaultOptions.spine.extractAdapter;

    // Not used parseOptions.useStyleNamespace option.
    let result = spineLoader({}, html, { spine: { extractBody: true, extractAdapter } });
    result.should.deep.equal(JSON.parse(read(Files.SPINE_LOADER_ADAPTER)));

    // used parseOptions.useStyleNamespace option.
    const styles = [
      { namespace: 'ridi_style1' },
      { namespace: 'ridi_style2' },
    ];
    result = spineLoader({ styles }, html, { spine: { extractBody: true, extractAdapter } });
    result.content.search('.ridi_style1, .ridi_style2').should.be.above(-1);
  });

  it('basePath option test', () => {
    const expected = read(Files.SPINE_LOADER_BASE_PATH);

    let result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: 'a/b/c', spine: { extractBody: false } });
    result.should.deep.equal(expected);

    result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: './a/b/c', spine: { extractBody: false } });
    result.should.deep.equal(expected);
  });

  it('cssOptions test', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { spine: { useCssOptions: true }, css: { removeTags: ['body'] } });
    spineLoader({}, html, options).should.equal(read(Files.SPINE_LOADER_CSS_OPTIONS));
  });

  it('cssOptions + basePath test', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { basePath: 'a/b/c', spine: { useCssOptions: true }, css: { removeTags: ['body'] } });
    spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, options).should.equal(read(Files.SPINE_LOADER_CSS_OPTIONS_AND_BASE_PATH));
  });
});

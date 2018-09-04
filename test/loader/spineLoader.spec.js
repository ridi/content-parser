import { assert, should } from 'chai';
import fs from 'fs';

import EpubParser from '../../src/EpubParser';
import Files from '../files';
import spineLoader from '../../src/loader/spineLoader';

should(); // Initialize should

const html = fs.readFileSync(Files.SPINE_LOADER_DEFAULT, 'utf8');

describe('Loader - Spine', () => {  
  it('No options test', () => {
    spineLoader({}, html).should.equal(html);
  });

  it('extractBody option test', () => {
    // Not used parseOptions.useStyleNamespace option.
    let result = spineLoader({}, html, { spine: { extractBody: true, extractAdapter: undefined } });
    result.should.deep.equal(JSON.parse(fs.readFileSync(Files.SPINE_LOADER_DEFAULT_WITH_NO_ADAPTER, 'utf8')));

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
    result.should.deep.equal(JSON.parse(fs.readFileSync(Files.SPINE_LOADER_DEFAULT_WITH_ADAPTER, 'utf8')));

    // used parseOptions.useStyleNamespace option.
    const styles = [
      { namespace: 'ridi_style1' },
      { namespace: 'ridi_style2' },
    ];
    result = spineLoader({ styles }, html, { spine: { extractBody: true, extractAdapter } });
    result.content.search('.ridi_style1, .ridi_style2').should.be.above(-1);
  });

  it('basePath option test', () => {
    const expected = fs.readFileSync(Files.SPINE_LOADER_DEFAULT_WITH_BASE_PATH, 'utf8');

    let result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: 'a/b/c', spine: { extractBody: false } });
    result.should.deep.equal(expected);

    result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: './a/b/c', spine: { extractBody: false } });
    result.should.deep.equal(expected);
  });
});

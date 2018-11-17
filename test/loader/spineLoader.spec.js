import { assert, should } from 'chai';
import fs from 'fs';

import EpubParser from '../../src/EpubParser';
import Paths from '../paths';
import { mergeObjects } from '../../src/util';
import spineLoader from '../../src/loader/spineLoader';

should(); // Initialize should

const read = file => fs.readFileSync(file, 'utf8');

const html = read(Paths.SPINE_LOADER_ORIGIN);

describe('Loader - Spine', () => {  
  it('No option test', () => {
    spineLoader({}, html).should.equal(read(Paths.SPINE_LOADER_NO_OPTIONS));
  });

  it('extractBody option test', () => {
    let result = spineLoader({}, html, { extractBody: true });
    result.should.equal(JSON.parse(read(Paths.SPINE_LOADER_NO_ADAPTER)).value);

    let extractBody = (innerHTML, attrs) => {
      return `<article ${attrs.map(attr => `${attr.key}="${attr.value}"`).join(' ')}>${innerHTML}</article>`;
    };
    result = spineLoader({ styles }, html, { extractBody });
    result.should.equal(JSON.parse(read(Paths.SPINE_LOADER_ADAPTER)).value);

    // used parseOptions.parseStyle option.
    const styles = [
      { namespace: 'ridi_style1' },
      { namespace: 'ridi_style2' },
    ];
    extractBody = (innerHTML, attrs) => {
      return { innerHTML, attrs };
    };
    result = spineLoader({ styles }, html, { extractBody });
    result.attrs.find(attr => attr.key === 'class').should.deep.equal({
      key: 'class', value: 'ridi_style1 ridi_style2',
    });
  });

  it('basePath option test', () => {
    const expected = read(Paths.SPINE_LOADER_BASE_PATH);

    let result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: 'a/b/c' });
    result.should.deep.equal(expected);

    result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, { basePath: './a/b/c' });
    result.should.deep.equal(expected);
  });

  it('cssOptions test', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { removeTags: ['body'] });
    spineLoader({}, html, options).should.equal(read(Paths.SPINE_LOADER_CSS_OPTIONS));
  });

  it('cssOptions + basePath test', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { basePath: 'a/b/c', removeTags: ['body'] });
    spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, html, options).should.equal(read(Paths.SPINE_LOADER_CSS_OPTIONS_AND_BASE_PATH));
  });

  it('serializedAnchor option test', () => {
    const spineItem = {
      href: '../Text/Section0001.xhtml',
      first: () =>  {
        return {
          index: 0,
          href: '../Text/Section0001.xhtml',
          next: () => {
            return {
              index: 1,
              href: '../Text/Section0002.xhtml',
              next: () => {
                return {
                  index: 2,
                  href: '../Text/Footnote/Section0003.xhtml',
                  next: () => undefined,
                };
              },
            };
          },
        };
      },
    };
    const options = { serializedAnchor: true };
    spineLoader(spineItem, html, options).should.equal(read(Paths.SPINE_LOADER_SERIALIZED_ANCHOR));
  });
});

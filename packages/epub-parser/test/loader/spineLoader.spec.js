import { mergeObjects } from '@ridi/parser-core';
import { assert, should } from 'chai';
import fs from 'fs';

import EpubParser from '../../src/EpubParser';
import Paths from '../../../../test/paths';
import spineLoader from '../../src/loader/spineLoader';

should(); // Initialize should

const read = file => fs.readFileSync(file, 'utf8');

const origin = read(Paths.SPINE_LOADER_ORIGIN);

describe('Loader - Spine', () => {  
  it('No option', () => {
    spineLoader({}, origin).should.equal(read(Paths.SPINE_LOADER_NO_OPTIONS));
  });

  it('Use extractBody option', () => {
    let result = spineLoader({}, origin, { extractBody: true });
    result.should.equal(JSON.parse(read(Paths.SPINE_LOADER_NO_ADAPTER)).value);

    let extractBody = (innerHTML, attrs) => {
      return `<article ${attrs.map(attr => `${attr.key}="${attr.value}"`).join(' ')}>${innerHTML}</article>`;
    };
    result = spineLoader({ styles }, origin, { extractBody });
    result.should.equal(JSON.parse(read(Paths.SPINE_LOADER_ADAPTER)).value);

    // with parseOptions.parseStyle option.
    const styles = [
      { namespace: 'ridi_style1' },
      { namespace: 'ridi_style2' },
    ];
    extractBody = (innerHTML, attrs) => {
      return { innerHTML, attrs };
    };
    result = spineLoader({ styles }, origin, { extractBody });
    result.attrs.find(attr => attr.key === 'class').should.deep.equal({
      key: 'class', value: 'ridi_style1 ridi_style2',
    });
  });

  it('Use basePath option', () => {
    const expected = read(Paths.SPINE_LOADER_BASE_PATH);

    let result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, origin, { basePath: 'a/b/c' });
    result.should.deep.equal(expected);

    result = spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, origin, { basePath: './a/b/c' });
    result.should.deep.equal(expected);
  });

  it('Use css options', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { removeTagSelector: ['body'] });
    spineLoader({}, origin, options).should.equal(read(Paths.SPINE_LOADER_CSS_OPTIONS));
  });

  it('Use css options + basePath', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { basePath: 'a/b/c', removeTagSelector: ['body'] });
    spineLoader({ href: 'OEBPS/Text/Section0001.xhtml' }, origin, options).should.equal(read(Paths.SPINE_LOADER_CSS_OPTIONS_AND_BASE_PATH));
  });

  it('Use serializedAnchor option', () => {
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
    spineLoader(spineItem, origin, options).should.equal(read(Paths.SPINE_LOADER_SERIALIZED_ANCHOR));
  });

  it('Use removeScript option', () => {
    const options = mergeObjects(EpubParser.readDefaultOptions, { removeScript: true });
    spineLoader({}, origin, options).should.equal(read(Paths.SPINE_LOADER_REMOVE_SCRIPT));
  });
});

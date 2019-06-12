import { assert, should } from 'chai';
import fs from 'fs';

import cssLoader from '../../src/loader/cssLoader';

should(); // Initialize should

describe('Loader - CSS', () => {  
  it('No option', () => {
    cssLoader({}, '').should.equal('');
    cssLoader({}, '@namespace url(http://www.w3.org/2000/svg); body {  background-color: #fff; }')
      .should.equal('@namespace url(http://www.w3.org/2000/svg);body{background-color:#fff}');
    cssLoader({}, '@font-face { font-family: NotoSansRegular, sans serif; src: url(../Fonts/NotoSans-Regular.ttf); }')
      .should.equal('@font-face{font-family:NotoSansRegular,sans serif;src:url(../Fonts/NotoSans-Regular.ttf)}');
    cssLoader({}, '.txt p > a { color: #ff0000; } p .bold { font-weight: 700; } #ridi { color: red; }')
      .should.equal('.txt p>a{color:#ff0000}p .bold{font-weight:700}#ridi{color:red}');
    cssLoader({}, 'body :not(p) { color: green; } :any-link {color: green; } :matches(.red) h1 { color: red; }')
      .should.equal('body :not(p){color:green}:any-link{color:green}:matches(.red) h1{color:red}');
  });

  it('Use removeAtrules option', () => {
    const options = { removeAtrules: ['import', 'charset'] };
    cssLoader({}, '@charset "utf8"; p { color: black; } @import "style.css";', options).should.equal('p{color:black}');
  });

  it('Use removeTags option', () => {
    const options = { removeTags: ['span'] };
    cssLoader({}, 'p > span { color: red; } span .bold { font-weight: 700; } span { }', options).should.equal('');
  });

  it('Use removeIds option', () => {
    const options = { removeIds: ['ridi'] };
    cssLoader({}, '#ridi { color: blue; } body #ridi { font-weight: 700; } :matches(#ridi) h1 { color: red; }', options).should.equal('');
  });

  it('Use removeClasses option', () => {
    const options = { removeClasses: ['ch'] };
    cssLoader({}, '.ch { color: blue; } p > .ch { font-weight: 700; } .ch[at="ch"] { color: red; }', options).should.equal('');
  });

  it('Use basePath option', () => {
    const cssItem = { href: 'OEBPS/Styles/Style0001.css' };
    let options = { basePath: 'a/b/c' };
    cssLoader(cssItem, '@font-face { font-family: NotoSans; src: url(../Fonts/NotoSans-Regular.ttf); }', options)
      .should.equal('@font-face{font-family:NotoSans;src:url(\'a/b/c/OEBPS/Fonts/NotoSans-Regular.ttf\')}');
    options = { basePath: './a/b/c' };
    cssLoader(cssItem, '@font-face { font-family: NotoSans; src: url(\"../Fonts/NotoSans-Regular.ttf\"); }', options)
      .should.equal('@font-face{font-family:NotoSans;src:url(\'a/b/c/OEBPS/Fonts/NotoSans-Regular.ttf\')}');
  });

  it('Use parseStyle option', () => {
    const cssItem = { namespace: 'namespace' };
    cssLoader(cssItem, '#id { color: red; } .class { font-size: 1em; } p { line-length: 0.9em; }')
      .should.equal('.namespace #id{color:red}.namespace .class{font-size:1em}.namespace p{line-length:0.9em}');
  });
});

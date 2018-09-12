import { assert, should } from 'chai';
import fs from 'fs';

import cssLoader from '../../src/loader/cssLoader';
import Files from '../files';

should(); // Initialize should

describe('Loader - CSS', () => {  
  it('No option test', () => {
    cssLoader({}, '@namespace url(http://www.w3.org/2000/svg); body {  background-color: #fff; }')
      .should.equal('@namespace url(http://www.w3.org/2000/svg);body{background-color:#fff}');
    cssLoader({}, '@font-face { font-family: NotoSansRegular, sans serif; src: url(../Fonts/NotoSans-Regular.ttf); }')
      .should.equal('@font-face{font-family:NotoSansRegular,sans serif;src:url(../Fonts/NotoSans-Regular.ttf)}');
    cssLoader({}, '.txt p > a { color: #ff0000; } p .bold { font-weight: 700; } #ridi { color: red; }')
      .should.equal('.txt p>a{color:#ff0000}p .bold{font-weight:700}#ridi{color:red}');
    cssLoader({}, 'body :not(p) { color: green; } :any-link {color: green; } :matches(.red) h1 { color: red; }')
      .should.equal('body :not(p){color:green}:any-link{color:green}:matches(.red) h1{color:red}');
  });

  it('removeAtrules option test', () => {
    const options = { css: { removeAtrules: ['import', 'charset'] } };
    cssLoader({}, '@charset "utf8"; p { color: black; } @import "style.css";', options).should.equal('p{color:black}');
  });

  it('removeTags option test', () => {
    const options = { css: { removeTags: ['span'] } };
    cssLoader({}, 'p > span { color: red; } span .bold { font-weight: 700; } span { }', options).should.equal('');
  });

  it('removeIds option test', () => {
    const options = { css: { removeIds: ['ridi'] } };
    cssLoader({}, '#ridi { color: blue; } body #ridi { font-weight: 700; } :matches(#ridi) h1 { color: red; }', options).should.equal('');
  });

  it('removeClasses option test', () => {
    const options = { css: { removeClasses: ['ch'] } };
    cssLoader({}, '.ch { color: blue; } p > .ch { font-weight: 700; } .ch[at="ch"] { color: red; }', options).should.equal('');
  });

  it('basePath option test', () => {
    const cssItem = { href: 'OEBPS/Styles/Style0001.css' };
    let options = { basePath: 'a/b/c', css: {} };
    cssLoader(cssItem, '@font-face { font-family: NotoSans; src: url(\"../Fonts/NotoSans-Regular.ttf\"); }', options)
      .should.equal('@font-face{font-family:NotoSans;src:url(\"a/b/c/OEBPS/Fonts/NotoSans-Regular.ttf\")}');
    options = { basePath: './a/b/c', css: {} };
    cssLoader(cssItem, '@font-face { font-family: NotoSans; src: url(\"../Fonts/NotoSans-Regular.ttf\"); }', options)
      .should.equal('@font-face{font-family:NotoSans;src:url(\"a/b/c/OEBPS/Fonts/NotoSans-Regular.ttf\")}');
  });
});

import { assert, should } from 'chai';

import xmlLoader, { getValue, getValues, textNodeName } from '../../src/loader/xmlLoader';

should(); // Initialize should

describe('Loader - XML', () => {  
  it('To replace fast-xml-parser options, check out the test below.', () => {
    const entry = {
      entryName: 'test.xml',
      getFile: () => '<?xml version="1.0" encoding="UTF-8"?> \
      <package version="2.0" unique-identifier="BookId" xmlns="http://www.idpf.org/2007/opf"> \
        <metadata xmlns:opf="http://www.idpf.org/2007/opf" xmlns:dc="http://purl.org/dc/elements/1.1/"> \
          <dc:language>  en </dc:language> \
          <dc:identifier>1120</dc:identifier> \
          <dc:creator opf:role="aut">Davin Ahn</dc:creator> \
          <dc:creator opf:role="edt">Davin Ahn</dc:creator> \
          <dc:type>0123</dc:type> \
          <dc:description><![CDATA[text]]>description</dc:description> \
          <dc:publisher>Foo &amp Bar</dc:publisher> \
          <meta name="tool" content="&copy; Baz" /> \
        </metadata> \
        <spine toc="ncx"> \
          <itemref idref="Cover.xhtml"/ linear> \
        </spine> \
      </package>',
    };
    const { package: root } = xmlLoader(entry);

    // Do not change text node name. (textNodeName = '#text')
    root.metadata.creator[0][textNodeName].should.not.null;

    // Do not grouping by attributes. (attrNodeName = false)
    root.metadata.creator[0].role.should.not.null;

    // Do not use prefix in attribute name. (attributeNamePrefix = '')
    // Must parse attributes. (ignoreAttributes = false)
    root.spine.toc.should.not.null;

    // Must ignore namespace. (ignoreNameSpace = true)
    assert(root.metadata['dc:language'] === undefined);

    // Must allow boolean attributes. (allowBooleanAttributes = true)
    root.spine.itemref.linear.should.be.true;

    // Do not parse node value. (parseNodeValue = false)
    root.metadata.identifier.should.equal('1120');

    // Do not parse attribute value. (parseAttributeValue = false)
    root.version.should.equal('2.0');

    // Must trim values. (trimValues = true)
    root.metadata.language.should.equal('en');

    // Do not parse cdata tag. (cdataTagName = false)
    root.metadata.description.should.equal('textdescription');

    // Do not parse string value that are similar to numbers. (parseTrueNumberOnly = true)
    root.metadata.type.should.equal('0123');

    // Must decode all standardized named character references as per HTML.
    root.metadata.publisher.should.equal('Foo & Bar');
    root.metadata.meta.content.should.equal('© Baz');
  });

  it('validateXml option test', () => {
    const entry = {
      entryName: 'test.xml',
      getFile: () => '<?xml version="1.0" encoding="UTF-8"?>\n<container>\n<container>',
    };
    (() => {
      xmlLoader(entry, { validateXml: true });
    }).should.throw(/EINVAL/gi);
  });

  it('getValue and getValues test', () => {
    const entry = {
      entryName: 'test.xml',
      getFile: () => '<?xml version="1.0" encoding="UTF-8"?> \
      <metadata> \
        <a attr="a1">text1</a> \
        <a attr="a2">text2</a> \
        <a attr="a3">text3</a> \
        <b attr="b1">text4</b> \
      </metadata>',
    };
    const { metadata } = xmlLoader(entry);
    getValue(metadata.a).attr.should.equal('a1');
    getValue(metadata.a, (key) => key === textNodeName ? 'custom' : key).custom.should.equal('text1');
    assert(getValue([]) === undefined);
    getValues(metadata.a).should.deep.equal([
      { '#text': 'text1', attr: 'a1' },
      { '#text': 'text2', attr: 'a2' },
      { '#text': 'text3', attr: 'a3' },
    ]);
    getValues(metadata.a, (key) => key === textNodeName ? 'custom' : key).should.deep.equal([
      { custom: 'text1', attr: 'a1' },
      { custom: 'text2', attr: 'a2' },
      { custom: 'text3', attr: 'a3' },
    ]);
    getValues(metadata.b).should.deep.equal([
      { '#text': 'text4', attr: 'b1' },
    ]);
  });
});

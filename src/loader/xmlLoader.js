import XmlParser from 'fast-xml-parser';
import he from 'he';

import Errors from '../Errors';
import {
  isArray,
  isExists,
  isObject,
  isString,
} from '../utils';

const normalizeKey = (obj, keyTranslator) => {
  if (isString(obj)) {
    return obj;
  }
  const newObj = {};
  Object.keys(obj).forEach((oldKey) => {
    const newKey = isExists(keyTranslator) ? keyTranslator(oldKey) : oldKey;
    let value = obj[oldKey];
    if (isArray(value)) {
      value = getValues(value, keyTranslator); // eslint-disable-line no-use-before-define
    } else if (isObject(value)) {
      if (newKey === 'children') {
        value = [normalizeKey(value, keyTranslator)];
      } else {
        value = normalizeKey(value, keyTranslator);
      }
    }
    newObj[newKey] = value;
  });
  return newObj;
};

const getValues = (any, keyTranslator) => {
  if (!isExists(any)) {
    return [];
  }
  return isArray(any) ? any.map(item => normalizeKey(item, keyTranslator)) : [normalizeKey(any, keyTranslator)];
};

const textNodeName = '#text';

export { getValues, textNodeName };

export default function xmlLoader(file, options) {
  if (options.validateXml && isExists(XmlParser.validate(file).err)) {
    throw Errors.INVALID_XML;
  }
  return XmlParser.parse(file, {
    // Text node name for identification.
    textNodeName,
    // Prepend given string to attribute name for identification.
    attributeNamePrefix: '',
    // (Valid name) Group all the attributes as properties of given name.
    attrNodeName: false,
    // Ignore attributes to be parsed.
    ignoreAttributes: false,
    // Remove namespace string from tag and attribute names.
    ignoreNameSpace: true,
    // A tag can have attributes without any value.
    allowBooleanAttributes: true,
    // Parse the value of text node to float, integer, or boolean.
    parseNodeValue: false,
    // Parse the value of an attribute to float, integer, or boolean.
    parseAttributeValue: false,
    // Trim string values of an attribute or node
    trimValues: true,
    // If specified, parser parse CDATA as nested tag instead of adding it's value to parent tag.
    cdataTagName: false,
    // If true then values like "+123", or "0123" will not be parsed as number.
    parseTrueNumberOnly: false,
    // Process tag value during transformation. Like HTML decoding, word capitalization, etc.
    // Applicable in case of string only.
    tagValueProcessor: value => he.decode(value),
    // Process attribute value during transformation. Like HTML decoding, word capitalization, etc.
    // Applicable in case of string only.
    attrValueProcessor: value => he.decode(value, { isAttributeValue: true }),
  });
}

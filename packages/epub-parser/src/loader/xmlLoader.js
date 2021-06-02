import {
  isArray,
  isExists,
  isObject,
  isString,
} from '@ridi/parser-core';
import XmlParser from 'fast-xml-parser';
import he from 'he';

const normalizeKey = (obj, keyTranslator) => {
  if (isString(obj)) {
    return obj;
  }
  const newObj = {};
  Object.keys(obj).forEach(oldKey => {
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

const getValue = (any, keyTranslator) => {
  if (!isExists(any)) {
    return undefined;
  }
  if (isArray(any)) {
    const first = any[0];
    if (!isExists(first)) {
      return undefined;
    }
    return normalizeKey(first, keyTranslator);
  }
  return normalizeKey(any, keyTranslator);
};

const getValues = (any, keyTranslator) => {
  if (!isExists(any)) {
    return [];
  }
  return isArray(any) ? any.map(item => normalizeKey(item, keyTranslator)) : [normalizeKey(any, keyTranslator)];
};

const textNodeName = '#text';

export { getValue, getValues, textNodeName };

export default function xmlLoader(string) {
  return XmlParser.parse(string, {
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
    parseTrueNumberOnly: true,
    // Process tag value during transformation. Like HTML decoding, word capitalization, etc.
    // Applicable in case of string only.
    tagValueProcessor: value => he.decode(value),
    // Process attribute value during transformation. Like HTML decoding, word capitalization, etc.
    // Applicable in case of string only.
    attrValueProcessor: value => he.decode(value, { isAttributeValue: true }),
  });
}

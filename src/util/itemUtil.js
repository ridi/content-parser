import { getType, isExists } from './typecheck';
import CssItem from '../model/CssItem';
import DeadItem from '../model/DeadItem';
import FontItem from '../model/FontItem';
import ImageItem from '../model/ImageItem';
import InlineCssItem from '../model/InlineCssItem';
import NcxItem from '../model/NcxItem';
import SpineItem from '../model/SpineItem';
import SvgItem from '../model/SvgItem';

export function getItemEncoding(item) {
  switch ((getType(item) === 'Function' && item.name) || item.constructor.name) {
    case CssItem.name:
    case InlineCssItem.name:
    case NcxItem.name:
    case SpineItem.name:
    case SvgItem.name:
      return 'utf8';
    default:
      return undefined; // Buffer
  }
}

export function getItemType(mediaType) {
  // See: http://www.idpf.org/epub/20/spec/OPS_2.0.1_draft.htm#Section1.3.7
  const types = {
    'application/font': FontItem,
    'application/font-otf': FontItem,
    'application/font-sfnt': FontItem,
    'application/font-woff': FontItem,
    'application/vnd.ms-opentype': FontItem,
    'application/x-font-ttf': FontItem,
    'application/x-font-truetype': FontItem,
    'application/x-font-opentype': FontItem,
    'font/opentype': FontItem,
    'font/otf': FontItem,
    'font/woff2': FontItem,

    'application/x-dtbncx+xml': NcxItem,

    'application/xhtml+xml': SpineItem,

    'text/css': CssItem,

    'image/gif': ImageItem,
    'image/jpeg': ImageItem,
    'image/png': ImageItem,
    'image/bmp': ImageItem, // Not recommended in EPUB spec.

    'image/svg+xml': SvgItem,
  };

  const type = types[mediaType.toLowerCase()];
  return isExists(type) ? type : DeadItem;
}

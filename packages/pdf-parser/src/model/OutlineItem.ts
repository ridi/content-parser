import {
  mergeObjects,
  isArray, isExists, isString, BaseItem,
} from '@ridi/parser-core';
import type { BaseItemProps } from '@ridi/parser-core/type/BaseItem';
import Color, { ColorProps } from './Color';
export interface OutlineItemProps extends BaseItemProps {
  dest?: string | number | { num: number }[];
  url?: string;
  title?: string;
  color?: ColorProps;
  bold?: boolean;
  italic?: boolean;
  depth?: number;
  items?: OutlineItemProps[];
  page: number;
}
class OutlineItem extends BaseItem {

  dest?: string | number | { num: number }[];
  url?: string;
  title: string;
  color: Color;
  bold: boolean;
  italic: boolean;
  depth: number;
  children: OutlineItem[];

  page: number;

  constructor(rawObj: OutlineItemProps, pageMap?: Record<string, number>) {
    super(rawObj);
    this.dest = rawObj?.dest;
    this.url = rawObj?.url;
    this.title = rawObj?.title || '';
    this.color = new Color(rawObj?.color || { 0: 0, 1: 0, 2: 0 });
    this.bold = rawObj?.bold || false;
    this.italic = rawObj?.italic || false;
    this.depth = rawObj?.depth || 0;
    this.children = (rawObj?.items || []).map<OutlineItem>((item: OutlineItemProps) => {
      return new OutlineItem({ ...item, depth: this.depth + 1 }, pageMap);
    });
    if (isString(this.dest)) {
      const page = pageMap?.[(this?.dest as string)];
      this.page = page ? page : rawObj?.page;
    } else if (isArray(this.dest) && (this.dest as { num: number }[])?.[0]) {
      const page = pageMap?.[(this.dest as { num: number }[])?.[0].num];
      this.page = page ? page : rawObj.page;
    } else {
      this.page = rawObj.page;
    }
    Object.freeze(this);
  }

  toRaw: () => Record<string, unknown> = () => {
    return {
      dest: String(this.dest),
      url: this.url,
      title: this.title,
      color: String(this.color.toRaw()),
      bold: this.bold,
      italic: this.italic,
      children: this.children.map(child => child.toRaw()),
      page: this.page,
    };
  }

}

export default OutlineItem;

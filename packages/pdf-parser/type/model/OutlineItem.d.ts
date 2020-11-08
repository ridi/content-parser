export default OutlineItem;
declare class OutlineItem extends BaseItem {
    constructor(rawObj?: {}, pageMap?: {});
    dest: any;
    url: any;
    title: any;
    color: Color;
    bold: any;
    italic: any;
    depth: any;
    children: any;
    page: any;
}
import { BaseItem } from "@ridi/parser-core";
import Color from "./Color";

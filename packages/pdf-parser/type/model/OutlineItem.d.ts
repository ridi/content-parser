export default OutlineItem;
declare class OutlineItem {
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
    toRaw(): {
        dest: any;
        url: any;
        title: any;
        color: {
            0: any;
            1: any;
            2: any;
        };
        bold: any;
        italic: any;
        children: any;
        page: any;
    };
}
import Color from "./Color";

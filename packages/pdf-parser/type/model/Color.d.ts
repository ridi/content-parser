export default Color;
declare class Color {
    constructor(rawObj?: {});
    get intValue(): any;
    get hexString(): string;
    get rgbString(): string;
    red: any;
    green: any;
    blue: any;
    toRaw(): {
        0: any;
        1: any;
        2: any;
    };
}

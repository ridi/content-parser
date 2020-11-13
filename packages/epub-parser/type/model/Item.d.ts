export default Item;
declare class Item {
    constructor(rawObj?: {}, freeze?: boolean);
    get isFileExists(): boolean;
    get defaultEncoding(): any;
    id: any;
    href: any;
    mediaType: any;
    size: any;
    toRaw(): {
        id: any;
        href: any;
        mediaType: any;
        size: any;
        itemType: string;
    };
}

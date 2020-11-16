declare abstract class BaseItem {
    size: number;
    constructor(rawObj: {
        size: number;
    });
    abstract toRaw: () => string;
}
export default BaseItem;

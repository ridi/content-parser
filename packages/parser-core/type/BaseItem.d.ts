export interface BaseItemProps {
    size: number;
}
declare abstract class BaseItem {
    size: number;
    constructor(rawObj: BaseItemProps);
    abstract toRaw: () => Record<string, unknown>;
}
export default BaseItem;

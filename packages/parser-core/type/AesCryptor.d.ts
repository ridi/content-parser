export default AesCryptor;
declare class AesCryptor {
    constructor(mode: any, config: any);
    operator: {
        name: any;
        encrypt: (data: any) => any;
        decrypt: (data: any) => any;
    };
    makeOperator(mode: any, config: any): {
        name: any;
        encrypt: (data: any) => any;
        decrypt: (data: any) => any;
    };
    encrypt(data: any, options?: {}): any;
    decrypt(data: any, options?: {}): any;
}
declare namespace AesCryptor {
    export { Padding };
    export { Encoding };
    export { Mode };
}
import { Padding } from "./cryptoUtil";
import { Encoding } from "./cryptoUtil";
export const Mode: Readonly<{
    ECB: {
        name: string;
        op: any;
        configTypes: {
            key: string;
        };
    };
    CBC: {
        name: string;
        op: any;
        configTypes: any;
    };
    CFB: {
        name: string;
        op: any;
        configTypes: any;
    };
    OFB: {
        name: string;
        op: any;
        configTypes: any;
    };
    CTR: {
        name: string;
        op: any;
        configTypes: any;
    };
}>;
export { Padding, Encoding };

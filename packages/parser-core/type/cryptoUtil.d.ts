export const Padding: Readonly<{
    AUTO: {
        name: string;
        op: any;
        pad: (data: any) => any;
        unpad: any;
    };
    PKCS7: {
        name: string;
        op: any;
        pad: (data: any) => any;
        unpad: any;
    };
    NONE: {
        name: string;
        op: any;
    };
}>;
export const Encoding: Readonly<{
    UTF8: {
        name: string;
        decode: any;
        encode: any;
    };
    HEX: {
        name: string;
        decode: any;
        encode: any;
    };
    UINT8: {
        name: string;
        decode: (uint8ArrayOrBufferOrArray: any) => any;
        encode: (wordArray: any) => Uint8Array;
    };
    BUFFER: {
        name: string;
        decode: (data: any) => any;
        encode: (data: any) => Buffer;
    };
}>;
export const Hash: Readonly<{
    md5: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha1: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha224: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha256: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha384: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha512: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    sha3: (any: any, size?: number, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
    ripemd160: (any: any, encoding?: {
        name: string;
        decode: any;
        encode: any;
    }) => any;
}>;

export default function validateOptions<T>(options: T, types: {
    [key in keyof T]: string;
}, strict?: boolean): void;

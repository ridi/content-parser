export default Permissions;
declare class Permissions {
    constructor(rawValue: any);
    _rawValue: any;
    allowPrinting: any;
    allowContentsModifying: any;
    allowCopying: any;
    allowAnnotationsModifying: any;
    allowInteractiveFormsModifying: any;
    allowCopyingForAccessibility: any;
    allowAssembling: any;
    allowHighQualityPrinting: any;
    toRaw(): any;
}
declare namespace Permissions {
    export { RawValue };
}
declare namespace RawValue {
    const PRINT: number;
    const MODIFY_CONTENTS: number;
    const COPY: number;
    const MODIFY_ANNOTATIONS: number;
    const FILL_INTERACTIVE_FORMS: number;
    const COPY_FOR_ACCESSIBILITY: number;
    const ASSEMBLE: number;
    const PRINT_HIGH_QUALITY: number;
}

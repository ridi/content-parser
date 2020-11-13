export default Permissions;
declare class Permissions {
    static RawValue: {
        PRINT: number;
        MODIFY_CONTENTS: number;
        COPY: number;
        MODIFY_ANNOTATIONS: number;
        FILL_INTERACTIVE_FORMS: number;
        COPY_FOR_ACCESSIBILITY: number;
        ASSEMBLE: number;
        PRINT_HIGH_QUALITY: number;
    };
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

import { isExists } from '@ridi/parser-core';

class Permissions {
  // Permission flags from Table 22, Section 7.6.3.2 of the PDF specification.
  static RawValue = {
    PRINT: 0x04,
    MODIFY_CONTENTS: 0x08,
    COPY: 0x10,
    MODIFY_ANNOTATIONS: 0x20,
    FILL_INTERACTIVE_FORMS: 0x100,
    COPY_FOR_ACCESSIBILITY: 0x200,
    ASSEMBLE: 0x400,
    PRINT_HIGH_QUALITY: 0x800,
  };

  constructor(rawValue) {
    this._rawValue = rawValue;
    this.allowPrinting = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.PRINT) : true;
    this.allowContentsModifying = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.MODIFY_CONTENTS) : true;
    this.allowCopying = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.COPY) : true;
    this.allowAnnotationsModifying
      = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.MODIFY_ANNOTATIONS) : true;
    this.allowInteractiveFormsModifying
      = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.FILL_INTERACTIVE_FORMS) : true;
    this.allowCopyingForAccessibility
      = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.COPY_FOR_ACCESSIBILITY) : true;
    this.allowAssembling = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.ASSEMBLE) : true;
    this.allowHighQualityPrinting
      = isExists(rawValue) ? rawValue.includes(Permissions.RawValue.PRINT_HIGH_QUALITY) : true;
    Object.freeze(this);
  }

  toRaw() {
    return this._rawValue;
  }
}

export default Permissions;

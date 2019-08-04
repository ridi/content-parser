/* eslint-disable max-len */
import { isExists } from '@ridi/parser-core';

// Permission flags from Table 22, Section 7.6.3.2 of the PDF specification.
const RawValue = {
  PRINT: 0x04,
  MODIFY_CONTENTS: 0x08,
  COPY: 0x10,
  MODIFY_ANNOTATIONS: 0x20,
  FILL_INTERACTIVE_FORMS: 0x100,
  COPY_FOR_ACCESSIBILITY: 0x200,
  ASSEMBLE: 0x400,
  PRINT_HIGH_QUALITY: 0x800,
};

class Permissions {
  constructor(rawValue) {
    this._rawValue = rawValue;
    this.allowPrinting = isExists(rawValue) ? rawValue.includes(RawValue.PRINT) : true;
    this.allowContentsModifying = isExists(rawValue) ? rawValue.includes(RawValue.MODIFY_CONTENTS) : true;
    this.allowCopying = isExists(rawValue) ? rawValue.includes(RawValue.COPY) : true;
    this.allowAnnotationsModifying = isExists(rawValue) ? rawValue.includes(RawValue.MODIFY_ANNOTATIONS) : true;
    this.allowInteractiveFormsModifying = isExists(rawValue) ? rawValue.includes(RawValue.FILL_INTERACTIVE_FORMS) : true;
    this.allowCopyingForAccessibility = isExists(rawValue) ? rawValue.includes(RawValue.COPY_FOR_ACCESSIBILITY) : true;
    this.allowAssembling = isExists(rawValue) ? rawValue.includes(RawValue.ASSEMBLE) : true;
    this.allowHighQualityPrinting = isExists(rawValue) ? rawValue.includes(RawValue.PRINT_HIGH_QUALITY) : true;
    Object.freeze(this);
  }

  toRaw() {
    return this._rawValue;
  }
}

Permissions.RawValue = RawValue;

export default Permissions;

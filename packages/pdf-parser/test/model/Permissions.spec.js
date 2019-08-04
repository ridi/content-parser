import { assert, should } from 'chai';

import Permissions from '../../src/model/Permissions';

should(); // Initialize should

const { RawValue } = Permissions;

describe('Model - Permissions', () => {
  it('Initialize test', () => {
    let permissions = new Permissions();
    permissions.allowPrinting.should.be.true;
    permissions.allowContentsModifying.should.be.true;
    permissions.allowCopying.should.be.true;
    permissions.allowAnnotationsModifying.should.be.true;
    permissions.allowInteractiveFormsModifying.should.be.true;
    permissions.allowCopyingForAccessibility.should.be.true;
    permissions.allowAssembling.should.be.true;
    permissions.allowHighQualityPrinting.should.be.true;

    const cases = [
      RawValue.PRINT,
      RawValue.MODIFY_CONTENTS,
      RawValue.COPY,
      RawValue.MODIFY_ANNOTATIONS,
      RawValue.FILL_INTERACTIVE_FORMS,
      RawValue.COPY_FOR_ACCESSIBILITY,
      RawValue.ASSEMBLE,
      RawValue.PRINT_HIGH_QUALITY,
    ];
    cases.forEach((value) => {
      permissions = new Permissions([value]);
      assert(permissions.allowPrinting === (value === RawValue.PRINT));
      assert(permissions.allowContentsModifying === (value === RawValue.MODIFY_CONTENTS));
      assert(permissions.allowCopying === (value === RawValue.COPY));
      assert(permissions.allowAnnotationsModifying === (value === RawValue.MODIFY_ANNOTATIONS));
      assert(permissions.allowInteractiveFormsModifying === (value === RawValue.FILL_INTERACTIVE_FORMS));
      assert(permissions.allowCopyingForAccessibility === (value === RawValue.COPY_FOR_ACCESSIBILITY));
      assert(permissions.allowAssembling === (value === RawValue.ASSEMBLE));
      assert(permissions.allowHighQualityPrinting === (value === RawValue.PRINT_HIGH_QUALITY));
    });

    (() => {
      permissions.allowPrinting = false;
      permissions.allowContentsModifying = false;
      permissions.allowCopying = false;
      permissions.allowAnnotationsModifying = false;
      permissions.allowInteractiveFormsModifying = false;
      permissions.allowCopyingForAccessibility = false;
      permissions.allowAssembling = false;
      permissions.allowHighQualityPrinting = false;
    }).should.throw(/read only property/gi);
  });

  it('toRaw test', () => {
    let permissions = new Permissions();
    assert(permissions.toRaw() === undefined);

    const rawValue = [RawValue.MODIFY_CONTENTS, RawValue.MODIFY_ANNOTATIONS];
    permissions = new Permissions(rawValue);
    permissions.toRaw().should.deep.equal(rawValue);
  });
});

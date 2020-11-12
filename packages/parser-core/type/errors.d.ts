/**
 * Create error
 * @param {ErrorType} type
 * @param {string[]} args
 * @returns {Error}
 */
export function createError(type: ErrorType, ...args: string[]): Error;
/**
 * Create MustOverride error
 * @returns {Error}
 */
export function mustOverride(): Error;
export type Errors = {
    ENOENT: ErrorType;
    ENOFILE: ErrorType;
    EEXIST: ErrorType;
    EINVAL: ErrorType;
    ENOELMT: ErrorType;
    ENOATTR: ErrorType;
    EREQPRM: ErrorType;
    EINTR: ErrorType;
    ECRYT: ErrorType;
    EPDFJS: ErrorType;
    ENOIMP: ErrorType;
};
export type ErrorType = {
    code: string;
    format: string;
};
export namespace Errors {
    namespace ENOENT {
        const code: string;
        const format: string;
    }
    namespace ENOFILE {
        const code_1: string;
        export { code_1 as code };
        const format_1: string;
        export { format_1 as format };
    }
    namespace EEXIST {
        const code_2: string;
        export { code_2 as code };
        const format_2: string;
        export { format_2 as format };
    }
    namespace EINVAL {
        const code_3: string;
        export { code_3 as code };
        const format_3: string;
        export { format_3 as format };
    }
    namespace ENOELMT {
        const code_4: string;
        export { code_4 as code };
        const format_4: string;
        export { format_4 as format };
    }
    namespace ENOATTR {
        const code_5: string;
        export { code_5 as code };
        const format_5: string;
        export { format_5 as format };
    }
    namespace EREQPRM {
        const code_6: string;
        export { code_6 as code };
        const format_6: string;
        export { format_6 as format };
    }
    namespace EINTR {
        const code_7: string;
        export { code_7 as code };
        const format_7: string;
        export { format_7 as format };
    }
    namespace ECRYT {
        const code_8: string;
        export { code_8 as code };
        const format_8: string;
        export { format_8 as format };
    }
    namespace EPDFJS {
        const code_9: string;
        export { code_9 as code };
        const format_9: string;
        export { format_9 as format };
    }
    namespace ENOIMP {
        const code_10: string;
        export { code_10 as code };
        const format_10: string;
        export { format_10 as format };
    }
}

import format from 'string-format';

export default {
  ENOENT: { code: 'ENOENT', format: 'ENOENT: no such file or directory. (path: {0})' },
  ENOFILE: { code: 'ENOFILE', format: 'ENOFILE: no such file. (path: {0})' },
  EINVAL: { code: 'EINVAL', format: 'EINVAL: invalid {0}. ({1}: {2})' },
  ENOELMT: { code: 'ENOELMT', format: 'ENOELMT: no such element. (element: {0}, path: {1})' },
  ENOATTR: { code: 'ENOATTR', format: 'ENOATTR: no such attribute. (attribute: {0}, element: {1}, path: {2})' },
};

export function createError(type, ...args) {
  const error = new Error(format(type.format, ...args));
  error.code = type.code;
  return error;
}

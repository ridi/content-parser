module.exports = {
  parser: '@babel/eslint-parser',
  parserOptions: {
    babelOptions: {
      configFile: './.babelrc',
    },
    requireConfigFile: false,
  },
  rules: {
    'arrow-parens': [2, 'as-needed'],
    'import/newline-after-import': 2,
    'import/no-cycle': 2,
    'import/no-extraneous-dependencies': 1,
    'import/order': [
      2,
      {
        alphabetize: {
          caseInsensitive: true,
          order: 'asc',
        },
        groups: ['external', 'builtin', 'internal'],
        'newlines-between': 'always',
      },
    ],
    'import/prefer-default-export': 0,
    'line-comment-position': 0,
    'lines-around-comment': 0,
    'max-len': [2, { code: 120, ignoreComments: true }],
    'no-confusing-arrow': [1, { allowParens: true }],
    'no-console': 0,
    'no-else-return': 1,
    'no-empty': [2, { allowEmptyCatch: true }],
    'no-lonely-if': 1,
    'no-loop-func': 1,
    'no-nested-ternary': 1,
    'no-param-reassign': [2, { ignorePropertyModificationsFor: ['context', 'draft', 'selector'], props: true }],
    'no-shadow': 0,
    'no-underscore-dangle': [2, { allowAfterSuper: true, allowAfterThis: true }],
    'operator-linebreak': [2, 'before'],
    'prefer-destructuring': 1,
  },
};

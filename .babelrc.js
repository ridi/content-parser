module.exports = {
  presets: [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
      },
    ],
  ],
  plugins: [
    'add-module-exports',
    ['@babel/plugin-proposal-class-properties', { loose: false }],
  ],
  comments: false,
};

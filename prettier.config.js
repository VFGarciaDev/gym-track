module.exports = {
  printWidth: 100,
  tabWidth: 2,

  semi: false,
  singleQuote: false,
  trailingComma: 'all',
  bracketSameLine: false,

  plugins: [require.resolve('prettier-plugin-tailwindcss')],
  tailwindAttributes: ['className'],
};

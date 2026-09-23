/** @type {import('prettier').Config & import('prettier-plugin-tailwindcss').PluginOptions} */
export default {
  bracketSameLine: false,
  plugins: ["prettier-plugin-tailwindcss"],
  printWidth: 100,
  semi: false,
  singleQuote: false,
  tabWidth: 2,
  tailwindAttributes: ["className"],
  tailwindStylesheet: "./src/styles/global.css",
  trailingComma: "none"
}

const { getDefaultConfig } = require("expo/metro-config")
const { withNativewind } = require("nativewind/metro")

const defaultConfig = getDefaultConfig(__dirname)
const nativewindConfig = withNativewind(defaultConfig, { inlineRem: 16 })

module.exports = nativewindConfig

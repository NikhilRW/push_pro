const { getDefaultConfig, mergeConfig } = require('@react-native/metro-config');
const { withNativeWind } = require("nativewind/metro");
/**
 * Metro configuration
 * https://reactnative.dev/docs/metro
 *
 * @type {import('@react-native/metro-config').MetroConfig}
 */
const defaultConfig = getDefaultConfig();
const config = {
  resolver: {
    assetExts: [...defaultConfig.resolver.assetExts, 'onnx'],
  },
};

const mergedConfig = mergeConfig(getDefaultConfig(__dirname), config);
module.exports = withNativeWind(mergedConfig, { input: "./global.css" });
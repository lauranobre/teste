// Learn more https://docs.expo.io/guides/customizing-metro
const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Adicione esta linha para o expo-sqlite na Web:
config.resolver.assetExts.push('wasm');

module.exports = config;

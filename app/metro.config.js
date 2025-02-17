const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

config.resolver.assetExts.push('glb'); // Add 'glb' to the list of asset extensions Metro can handle

module.exports = config;

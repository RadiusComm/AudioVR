const { getDefaultConfig } = require('expo/metro-config');

/** @type {import('expo/metro-config').MetroConfig} */
const config = getDefaultConfig(__dirname);

// Enable support for additional file extensions
config.resolver.assetExts.push(
  // Audio formats
  'mp3',
  'wav',
  'aac',
  'm4a',
  'ogg',
  'flac',
  // Font formats
  'ttf',
  'otf',
  'woff',
  'woff2',
  // Other assets
  'db',
  'sqlite'
);

// Add platform-specific extensions
config.resolver.platforms = ['native', 'android', 'ios', 'web'];

// Configure transformer for better performance
config.transformer = {
  ...config.transformer,
  minifierConfig: {
    keep_classnames: true,
    keep_fnames: true,
    mangle: {
      keep_classnames: true,
      keep_fnames: true,
    },
  },
};

// Enable symlinks for monorepo support (if needed)
config.resolver.unstable_enableSymlinks = true;

module.exports = config;
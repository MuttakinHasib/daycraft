const { getDefaultConfig } = require('expo/metro-config');
const { withUniwindConfig } = require('uniwind/metro');

const config = getDefaultConfig(__dirname);

// Drizzle's migrations are .sql files bundled with the app.
config.resolver.sourceExts.push('sql');

// withUniwindConfig must be the outermost wrapper
module.exports = withUniwindConfig(config, {
  cssEntryFile: './src/global.css',
  dtsFile: './src/uniwind-types.d.ts',
});

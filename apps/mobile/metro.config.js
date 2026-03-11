const { getDefaultConfig } = require('expo/metro-config');
const path = require('path');

const projectRoot = __dirname;
const monorepoRoot = path.resolve(projectRoot, '../..');

const config = getDefaultConfig(projectRoot);

// Monorepo: watch the root and resolve packages from both locations
config.watchFolders = [monorepoRoot];
config.resolver.nodeModulesPaths = [
  path.resolve(projectRoot, 'node_modules'),
  path.resolve(monorepoRoot, 'node_modules'),
];

// Intercept react-dom BEFORE its bundled react@19.2.4 can load.
// @clerk/expo lists react-dom as a dependency but never calls web DOM APIs
// in a React Native context. Shimming it prevents the version-mismatch crash.
const reactDomShim = path.resolve(projectRoot, 'shims/react-dom.js');
config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === 'react-dom' || moduleName.startsWith('react-dom/')) {
    return { filePath: reactDomShim, type: 'sourceFile' };
  }
  // Default resolution for everything else
  return context.resolveRequest(context, moduleName, platform);
};

module.exports = config;

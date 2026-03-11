import 'react-native-url-polyfill/auto';

if (typeof window !== 'undefined' && !window.location) {
  // @ts-ignore
  window.location = new URL('http://localhost');
}

import { registerRootComponent } from 'expo';

import App from './App';

// registerRootComponent calls AppRegistry.registerComponent('main', () => App);
// It also ensures that whether you load the app in Expo Go or in a native build,
// the environment is set up appropriately
registerRootComponent(App);

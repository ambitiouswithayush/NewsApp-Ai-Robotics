// react-dom shim for React Native
// @clerk/expo depends on react-dom (for web). In a React Native context,
// react-dom is never actually called, so we export a safe empty object.
// This prevents @clerk/expo's react-dom@19.2.4 from loading and crashing
// the app with a "react version mismatch" error.
module.exports = {
  createPortal: () => null,
  findDOMNode: () => null,
  flushSync: (fn) => fn && fn(),
  render: () => null,
  unmountComponentAtNode: () => null,
  createRoot: () => ({ render: () => null, unmount: () => null }),
};

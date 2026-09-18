import Constants from 'expo-constants';

/** App 顯示版號（來自 app.json expo.version） */
export function getAppVersionLabel(): string {
  const version =
    Constants.expoConfig?.version ??
    Constants.nativeAppVersion ??
    '1.0.0';
  return `v${version}`;
}

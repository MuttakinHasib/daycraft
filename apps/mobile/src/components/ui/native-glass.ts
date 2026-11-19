import { buttonStyle } from '@expo/ui/swift-ui/modifiers';
import { Platform } from 'react-native';

// Liquid Glass buttons arrived in iOS 26; earlier versions get the system's bordered button.
export const GLASS_AVAILABLE = Number.parseInt(String(Platform.Version), 10) >= 26;

/** iOS only: the native button style for small controls (×, ⋯, ‹ ›, Today). */
export const nativeButtonStyle = () => buttonStyle(GLASS_AVAILABLE ? 'glass' : 'bordered');

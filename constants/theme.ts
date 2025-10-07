
import { Platform } from 'react-native';

// Paleta mais "futurista" com tons neon/azulados
const neonCyan = '#00E5FF';
const neonPurple = '#8B5CF6';

export const Colors = {
  light: {
    text: '#3484fdff',
    background: '#ffffffff',
    tint: neonCyan,
    icon: '#9FB3C8',
    tabIconDefault: '#6B7A90',
    tabIconSelected: neonCyan,
  },
  dark: {
    text: '#3484fdff',
    background: '#070B16',
    tint: neonPurple,
    icon: '#3484fdff',
    tabIconDefault: '#6B7A90',
    tabIconSelected: neonPurple,
  },
};

export const Fonts = Platform.select({
  ios: {
    /** iOS `UIFontDescriptorSystemDesignDefault` */
    sans: 'system-ui',
    /** iOS `UIFontDescriptorSystemDesignSerif` */
    serif: 'ui-serif',
    /** iOS `UIFontDescriptorSystemDesignRounded` */
    rounded: 'ui-rounded',
    /** iOS `UIFontDescriptorSystemDesignMonospaced` */
    mono: 'ui-monospace',
  },
  default: {
    sans: 'normal',
    serif: 'serif',
    rounded: 'normal',
    mono: 'monospace',
  },
  web: {
    sans: "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif",
    serif: "Georgia, 'Times New Roman', serif",
    rounded: "'SF Pro Rounded', 'Hiragino Maru Gothic ProN', Meiryo, 'MS PGothic', sans-serif",
    mono: "SFMono-Regular, Menlo, Monaco, Consolas, 'Liberation Mono', 'Courier New', monospace",
  },
});

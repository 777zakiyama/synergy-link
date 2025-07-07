import { MD3LightTheme, MD3DarkTheme } from 'react-native-paper';
import { colors, darkColors } from './colors';

export const lightTheme = {
  ...MD3LightTheme,
  colors: {
    ...MD3LightTheme.colors,
    primary: colors.primary,
    primaryContainer: colors.primaryVariant,
    surface: colors.surface,
    background: colors.background,
    onSurface: colors.onSurface,
    onSurfaceVariant: colors.onSurfaceVariant,
    outline: colors.outline,
    outlineVariant: colors.outlineVariant,
    error: colors.error,
    onError: '#ffffff',
    errorContainer: '#ffebee',
    onErrorContainer: colors.error,
  },
};

export const darkTheme = {
  ...MD3DarkTheme,
  colors: {
    ...MD3DarkTheme.colors,
    primary: darkColors.primary,
    primaryContainer: darkColors.primaryVariant,
    surface: darkColors.surface,
    background: darkColors.background,
    onSurface: darkColors.onSurface,
    onSurfaceVariant: darkColors.onSurfaceVariant,
    outline: darkColors.outline,
    outlineVariant: darkColors.outlineVariant,
    error: darkColors.error,
    onError: '#000000',
    errorContainer: '#2a1a1a',
    onErrorContainer: darkColors.error,
  },
};

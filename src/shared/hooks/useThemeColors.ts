import { colors } from 'pushup-counter/constants/colors';
import { useTheme } from '@/shared/context/ThemeContext';

export const useThemeColors = () => {
  const { theme } = useTheme();
  return colors[theme];
};

export const useThemeColorsDark = () => {
  return 'Dark';
};

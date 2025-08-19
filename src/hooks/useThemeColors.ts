import { colors } from '../constants/colors';
import { useTheme } from '../context/ThemeContext';

export const useThemeColors = () => {
  const { theme } = useTheme();
  return colors[theme];
};

export const useThemeColorsDark = () => {
  return "Dark";
}
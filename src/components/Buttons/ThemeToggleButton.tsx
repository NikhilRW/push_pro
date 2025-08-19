import React from 'react';
import { TouchableOpacity } from 'react-native';
import { useTheme } from '../../context/ThemeContext';
import { useThemeColors } from '../../hooks/useThemeColors';
import NeuromorphicButton from './NeuromorphicButton';

export const ThemeToggleButton = () => {
  const { toggleTheme, isDark } = useTheme();
  const themeColors = useThemeColors();

  return (
    <TouchableOpacity onPress={toggleTheme} className="absolute top-4 right-4">
      <NeuromorphicButton
        baseColor={themeColors.button.primary}
        height={40}
        width={40}
        onPressOut={toggleTheme}
        svgSource={isDark ?
          require('../res/svgs/sun.svg') :
          require('../res/svgs/moon.svg')
        }
        svgSize={{ height: 24, width: 24 }}
      />
    </TouchableOpacity>
  );
};

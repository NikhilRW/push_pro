import { Text, TouchableOpacity } from 'react-native';
import { styles } from '../styles/CustomButton';

export const CustomButton = ({
  title,
  onPress,
  variant = 'primary',
  disabled = false,
}: {
  title: string;
  variant: 'primary' | 'secondary' | 'danger';
  onPress: () => void;
  disabled?: boolean;
}) => {
  const getButtonStyle = () => {
    const variantStyle =
      `button${variant[0].toUpperCase() + variant.slice(1)}` as
        | 'buttonPrimary'
        | 'buttonSecondary'
        | 'buttonDanger';
    return [
      styles.buttonBase,
      styles[variantStyle],
      disabled && styles.buttonDisabled,
    ];
  };

  const getTextStyle = () => [styles.textBase, disabled && styles.textDisabled];

  return (
    <TouchableOpacity
      onPress={onPress}
      disabled={disabled}
      style={getButtonStyle()}
      activeOpacity={0.8}
    >
      <Text style={getTextStyle()}>{title}</Text>
    </TouchableOpacity>
  );
};
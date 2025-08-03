import { Text, View } from 'react-native';
import { styles } from '../styles/StatusCard';

export const StatusCard = ({
  title,
  value,
  subtitle,
}: {
  title: string;
  value: number|string;
  subtitle: string;
}) => (
  <View style={styles.container}>
    <Text style={styles.title}>{title}</Text>
    <Text style={styles.value}>{value}</Text>
    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
  </View>
);

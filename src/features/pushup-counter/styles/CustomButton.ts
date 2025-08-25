import { StyleSheet } from 'react-native';
import { width } from 'pushup-counter/constants';

export const styles = StyleSheet.create({
  buttonBase: {
    paddingHorizontal: 16,
    paddingVertical: 16,
    borderRadius: 12,
    marginHorizontal: 8,
    marginVertical: 6,
    width: width * 0.25,
    alignItems: 'center',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonPrimary: {
    backgroundColor: '#3B82F6',
    shadowColor: '#3B82F6',
  },
  buttonSecondary: {
    backgroundColor: '#6B7280',
    shadowColor: '#6B7280',
  },
  buttonDanger: {
    backgroundColor: '#EF4444',
    shadowColor: '#EF4444',
  },
  buttonWarning: {
    backgroundColor: '#D5B60A',
    shadowColor: '#D5B60A',
  },
  buttonSuccess: {
    backgroundColor: '#009000',
  },
  buttonDisabled: {
    backgroundColor: '#374151',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    elevation: 2,
  },
  textBase: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    letterSpacing: 0.5,
  },
  textDisabled: {
    color: '#9CA3AF',
  },
});

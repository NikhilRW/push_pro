import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../constants';

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 16,
    backgroundColor: colors.dark.background,
    justifyContent: 'center',
    width: '100%',
    height: '100%',
  },
  card: {
    // flex: 1,
    justifyContent: 'flex-start',
    alignItems: 'center',
    borderRadius: 20,
    padding: 20,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 4.65,
    elevation: 8,
  },
  imageContainer: {
    height: Dimensions.get('window').height * 0.25, // 1/4 of screen height
    width: '100%',
    backgroundColor: 'rgba(0,0,0,0.05)',
    borderRadius: 12,
    overflow: 'hidden',
    marginBottom: 20,
  },
  image: {
    width: '100%',
    height: '100%',
  },
  contentContainer: {
  },
  title: {
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
  },
  instructionsContainer: {
    // height:"20%",
    gap:12,
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    marginBottom:12,
  },

  number: {
    fontSize: 12,
    fontWeight: '900',
  },
  instructionText: {
    fontSize: 12,
    flex: 1,
  },
});

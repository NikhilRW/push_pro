const plugins = [
  ['module:react-native-dotenv'],
  ['react-native-worklets-core/plugin'],
  ['react-native-reanimated/plugin'],
  [
    'module-resolver',
    {
      root: ['./'],
      extensions: ['.js', '.jsx', '.ts', '.tsx'],
      alias: {
        '@': './src',
        instructions: './src/features/instructions',
        'pushup-counter': './src/features/pushup-counter',
        'pushup-history': './src/features/pushup-history',
        'splash-screen': './src/features/splash-screen',
        shared: './src/shared',
        res: './src/shared/res',
      },
    },
  ],
];

module.exports = {
  presets: ['module:@react-native/babel-preset', 'nativewind/babel'],
  plugins,
};

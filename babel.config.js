module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      // Required for expo-router
      'expo-router/babel',
      // Required for react-native-reanimated
      'react-native-reanimated/plugin',
      // Module resolver for @ alias
      [
        'module-resolver',
        {
          root: ['./'],
          alias: {
            '@': './',
          },
        },
      ],
    ],
  };
};
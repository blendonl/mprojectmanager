module.exports = function (api) {
  api.cache(true);
  return {
    presets: ['babel-preset-expo'],
    plugins: [
      'babel-plugin-transform-typescript-metadata',
      ['@babel/plugin-proposal-decorators', { legacy: true }],
      [
        'module-resolver',
        {
          root: ['./src'],
          extensions: ['.ios.js', '.android.js', '.js', '.ts', '.tsx', '.json'],
          alias: {
            '@': './src',
            '@features': './src/features',
            '@shared': './src/shared',
            '@core': './src/core',
            '@domain': './src/domain',
            '@infrastructure': './src/infrastructure',
            '@services': './src/services',
          },
        },
      ],
    ],
  };
};

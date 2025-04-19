const path = require('path');
const { override, addWebpackModuleRule } = require('customize-cra');

console.log('Loading config-overrides.js...');

module.exports = override(
  // Log pour confirmer
  (config) => {
    console.log('config-overrides.js is being applied!');
    return config;
  },

  // Règle pour JS/TS
  addWebpackModuleRule({
    test: /\.(js|jsx|ts|tsx)$/,
    use: [
      {
        loader: 'babel-loader',
        options: {
          presets: [
            '@babel/preset-env',
            '@babel/preset-react',
            '@babel/preset-typescript',
          ],
        },
      },
    ],
    include: path.resolve('src'),
  }),

  // Règle pour CSS (pour Tailwind)
  addWebpackModuleRule({
    test: /\.css$/,
    use: [
      'style-loader',
      {
        loader: 'css-loader',
        options: {
          sourceMap: true,
          importLoaders: 1,
          modules: false,
        },
      },
      {
        loader: 'postcss-loader',
        options: {
          postcssOptions: {
            plugins: [
              require('tailwindcss'),
              require('autoprefixer'),
              require('postcss-preset-env')(),
            ],
          },
        },
      },
    ],
  }),

  // Extensions
  (config) => {
    config.resolve.extensions = [...config.resolve.extensions, '.ts', '.tsx'];
    return config;
  },

  // Configuration devServer pour éliminer les avertissements de dépréciation
  (config) => {
    config.devServer = {
      ...config.devServer,
      setupMiddlewares: (middlewares, devServer) => {
        console.log('Setting up middlewares...');
        return middlewares;
      },
    };
    return config;
  }
);
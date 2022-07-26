const path = require('path')
const webpack = require('webpack')
const HtmlWebpackPlugin = require('html-webpack-plugin')

module.exports = (env) => {
  const isBuild = env.WEBPACK_BUILD
  const isDev = env.WEBPACK_SERVE

  return {
    mode: isBuild ? 'production' : 'development',
    entry: isBuild ? './src' : './example',
    output: {
      path: path.resolve(__dirname, !isDev ? 'dist' : 'build'),
      filename: 'index.js',
      libraryTarget: 'umd',
    },
    devServer: {
      static: [path.join(__dirname, 'build')],
      hot: true,
      open: true,
    },
    devtool: isDev && 'inline-source-map',
    externals: isBuild
      ? {
          react: {
            root: 'React',
            commonjs2: 'react',
            commonjs: 'react',
            amd: 'react',
            umd: 'react',
          },
        }
      : {},
    module: {
      rules: [
        {
          test: /\.js$/,
          exclude: path.join(__dirname, '/node_modules/'),
          loader: 'babel-loader',
        },
      ],
    },
    plugins: [
      !isBuild &&
        new HtmlWebpackPlugin({
          template: 'example/index.html',
        }),
      isDev && new webpack.HotModuleReplacementPlugin(),
    ].filter(Boolean),
  }
}

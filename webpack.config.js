
const path = require('path')
const webpack = require('webpack')

module.exports = {
  mode: 'production',
  entry: './src/core/index.js',
  watchOptions: {
    ignored: /node_modules/,
  },
  output: {
    path: path.resolve(process.cwd(), './lib'),
    filename: 'quick.min.js',
    chunkFilename: '[id].js',
    libraryTarget: 'umd',
    libraryExport: 'default',
    library: 'Quick',
    umdNamedDefine: true,
  },
  resolve: {
    extensions: ['.js'],
    alias: { '@': path.resolve(__dirname, './src') },
    modules: ['node_modules']
  },
  optimization: {
    minimize: false,
  },
  module: {
    rules: [{
      test: /\.js$/,
      exclude: /node_modules/,
      use: {
        loader: 'babel-loader',
      }
    }]
  },
  plugins: [
    new webpack.ProgressPlugin()
  ]
}

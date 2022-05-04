/*
 * @Author: penglei
 * @Date: 2022-05-03 16:55:52
 * @LastEditors: penglei
 * @LastEditTime: 2022-05-04 13:17:15
 * @Description: 核心
 */
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
        filename: 'index.js',
        chunkFilename: '[id].js',
        libraryTarget: 'umd',
        libraryExport: 'default',
        library: 'Quick',
        umdNamedDefine: true,
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: { '@': path.resolve(__dirname, './src') },
        modules: ['node_modules']
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
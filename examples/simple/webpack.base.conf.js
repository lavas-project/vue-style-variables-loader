/**
 * @file base conf
 * @author panyuqi (pyqiverson@gmail.com)
 */

'use strict';

const utils = require('./utils');
const path = require('path');
const vueLoaderConfig = require('./vue-loader.conf');

function resolve(dir) {
    return path.join(__dirname, dir);
}

module.exports = {
    entry: resolve('./src/entry.js'),
    output: {
        path: resolve('dist'),
        filename: utils.assetsPath('js/[name].js'),
        chunkFilename: utils.assetsPath('js/[id].js')
    },
    resolve: {
        extensions: ['.js', '.vue', '.json'],
        alias: {
            'vue$': 'vue/dist/vue.esm.js',
            '@': resolve('src')
        }
    },
    module: {
        rules: [
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: vueLoaderConfig
                    },
                    {
                        loader: 'vue-variables-loader',
                        options: {
                            variablesFiles: [resolve('src/styles/variables.styl')]
                        }
                    }
                ],
                include: [resolve('src')]
            },
            {
                test: /\.js$/,
                loader: 'babel-loader',
                include: [resolve('src')]
            }
        ]
    },
    resolveLoader: {
        alias: {
            'vue-variables-loader': path.join(__dirname, '../../lib/index.js')
        }
    }
};

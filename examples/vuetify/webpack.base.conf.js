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
    entry: {
        app: resolve('./src/entry.js')
    },
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
                        loader: 'vue-style-variables-loader',
                        options: {
                            variablesFiles: [
                                resolve('../../node_modules/vuetify/src/stylus/settings/_colors.styl'),
                                resolve('./src/styles/theme.styl')
                            ],
                            importStatements: [
                                '@import "~@/styles/other-variables.less";'
                            ]
                        }
                    }
                ],
                include: [resolve('src')]
            },
            {
                test: /\.vue$/,
                use: [
                    {
                        loader: 'vue-loader',
                        options: vueLoaderConfig
                    }
                ],
                exclude: [resolve('src')]
            },
            {
                test: /\.js$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            presets: ['vue-app'],
                            plugins: [
                                "transform-runtime",
                                ["transform-imports",
                                    {
                                        "vuetify": {
                                            "transform": "vuetify/es5/components/${member}",
                                            "preventFullImport": true
                                        }
                                    }
                                ]
                            ],
                            babelrc: false
                        },
                        include: [resolve('src')],
                    }
                ]
            }
        ]
    },
    resolveLoader: {
        alias: {
            'vue-style-variables-loader': resolve('../../lib/index.js')
        }
    }
};

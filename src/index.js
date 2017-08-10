/**
 * @file vue-style-variables-loader index.js
 *
 * @desc 向每个.vue文件中注入样式相关的变量，不需要手动import
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-no-require */

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import Promise from 'bluebird';
import VariablesConvertor from './variables-convertor';

// loader options schema
const VALIDATE_OPTIONS_SCHEMA = {
    type: 'object',
    properties: {
        variablesFiles: {
            type: 'array'
        },
        importStatements: {
            type: 'array'
        }
    },
    additionalProperties: true
};

const convertor = new VariablesConvertor();

export default async function (source) {

    // use cache if possible
    this.cacheable();

    const options = loaderUtils.getOptions(this);
    const {variablesFiles, importStatements} = options;
    
    // validate options according to schema
    validateOptions(VALIDATE_OPTIONS_SCHEMA, options, 'vue-style-variables-loader');    

    // use current hash of webpack compilation
    // convertor.cacheVersion = this._compilation.hash;

    await Promise.all(variablesFiles.map(async (file) => {
        await convertor.read(file);
        this.addDependency(file);
    }));

    return convertor.convert(source, importStatements);
};

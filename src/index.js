/**
 * @file vue-style-variables-loader index.js
 *
 * @desc 向每个.vue文件中注入样式相关的变量，不需要手动import
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-no-require */

import loaderUtils from 'loader-utils';
import validateOptions from 'schema-utils';
import VariablesConvertor from './variables-convertor';

// loader options schema
const VALIDATE_OPTIONS_SCHEMA = {
    type: 'object',
    properties: {
        variablesFiles: {
            type: 'array'
        },
        imports: {
            type: 'array'
        }
    },
    additionalProperties: true
};

const convertor = new VariablesConvertor();

export default function (source) { 
    const options = loaderUtils.getOptions(this);
    const {variablesFiles, imports} = options;
    
    // validate options according to schema
    validateOptions(VALIDATE_OPTIONS_SCHEMA, options, 'vue-style-variables-loader');

    // use cache if possible
    this.cacheable();

    // use current hash of webpack compilation
    convertor.cacheVersion = this._compilation.hash;

    variablesFiles.forEach(file => {
        convertor.read(file);
        this.addDependency(file);
    });

    return convertor.convert(source, imports);
};

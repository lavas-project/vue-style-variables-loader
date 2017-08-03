/**
 * @file VariablesConvertor
 *
 * @desc convert preprocessor variables
 * @author panyuqi (pyqiverson@gmail.com)
 */

import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';
import Promise from 'bluebird';
import Less2StylusTrasformer from './compiler/less-stylus';

const readFile = Promise.promisify(fs.readFile);
const STYLE_TAG_REG = /\<style.*?lang\s*=\s*["|'](.*)?["|'].*?\>([\S\s]*?)\<\/style\>/g;

class VariablesConvertor {
    constructor(options = {}) {
        this.cache = {};
        this.cacheVersion = 'default-cache-version';
        this.transformers = {
            less: {
                stylus: new Less2StylusTrasformer()
            }
        }
    }

    read(filename) {
        this.cache[cacheVersion] = this.cache[cacheVersion] || {};
        if (!this.cache[cacheVersion][filename]) {
            let extname = path.extname(filename);
            let fileContent = await readFile(filename, 'utf8');

            this.cache[cacheVersion][filename] = {};
        }
    }

    /**
     * inject variables into .vue <style> blocks according to target preprocessor
     *
     * @param {string} source .vue file contents
     * @param {Array} imports @import sentences to prepend
     * @return {string} result
     */
    convert(source, imports) {
        let result;
        let lang;
        while ((result = STYLE_TAG_REG.exec(source)) !== null) {
            // current lang selected
            lang = result[1];
        }

        return imports.join('\n') + source;
    }
}

export default VariablesConvertor;
/**
 * @file VariablesConvertor
 *
 * @desc convert preprocessor variables
 * @author panyuqi (pyqiverson@gmail.com)
 */

import * as fs from 'fs';
import * as path from 'path';
import Promise from 'bluebird';
import Compiler from './compiler';

const readFile = Promise.promisify(fs.readFile);
const STYLE_TAG_REG = /\<style.*?lang\s*=\s*["|'](.*)?["|'].*?\>([\S\s]*?)\<\/style\>/g;
const IMPORT_STATEMENT_REG = /^@import[ ]*["|']([\S\s]*?)["|'];?/;
const EXT_PREPROCESSOR_MAP = {
    '.styl': 'stylus',
    '.stylus': 'stylus',
    '.less': 'less',
    '.scss': 'sass',
    '.sass': 'sass'
};
const LANG_PREPROCESSOR_MAP = {
    'styl': 'stylus',
    'stylus': 'stylus',
    'less': 'less',
    'scss': 'sass',
    'sass': 'sass'
};

function insertAt(origin, str, pos){
    return [
        origin.slice(0, pos),
        str,
        origin.slice(pos)
    ].join('');
}

class VariablesConvertor {
    constructor(options = {}) {
        this.compiler = new Compiler();
        this.cache = {};
        this.cacheVersion = 0;
    }

    findByFilename(filename) {
        let cache = this.cache[this.cacheVersion];
        if (cache && cache.length) {
            return cache.find(entry => entry.filename === filename);
        }
        return null;
    }

    async read(filename) {
        // we use array as cache to keep the order of files
        this.cache[this.cacheVersion] = this.cache[this.cacheVersion] || [];
        if (!this.findByFilename(filename)) {
            let extname = path.extname(filename);
            let fileContent = await readFile(filename, 'utf8');
            let sourcePreprocessor = EXT_PREPROCESSOR_MAP[extname];

            this.cache[this.cacheVersion].push({
                filename,
                sourcePreprocessor,
                [sourcePreprocessor]: fileContent
            });
        }
    }

    extractByPreprocessor(importStatements = []) {
        let map = {};
        importStatements.forEach(statement => {
            let filename = IMPORT_STATEMENT_REG.exec(statement)[1];
            let extname = path.extname(filename);
            let preprocessor = EXT_PREPROCESSOR_MAP[extname];
            if (!map[preprocessor]) {
                map[preprocessor] = [statement];
            }
            else {
                map[preprocessor].push(statement);
            }
        });
        return map;
    }

    /**
     * inject variables into .vue <style> blocks according to target preprocessor
     *
     * @param {string} source .vue file contents
     * @param {Array} imports @import sentences to prepend
     * @return {string} result
     */
    convert(source, imports = []) {
        let result = source;
        let cache = this.cache[this.cacheVersion];
        let regResult;
        // offset of position to insert
        let offset = 0;
        // last position of regexp
        let lastIndex = 0;
        let importStatementsMap = this.extractByPreprocessor(imports);
        while ((regResult = STYLE_TAG_REG.exec(source)) !== null) {
            let lang = regResult[1];
            let styleContent = regResult[2];
            let preprocessor = LANG_PREPROCESSOR_MAP[lang];
            // record last index of regexp
            lastIndex = STYLE_TAG_REG.lastIndex;
            // find position of <style>
            let insertPos = lastIndex - styleContent.length - '</style>'.length;
            let variablesContent = '\n' + (cache || []).map(cacheEntry => {
                let sourcePreprocessor = cacheEntry.sourcePreprocessor;

                if (cacheEntry[preprocessor]) {
                    return cacheEntry[preprocessor];
                }
                else {
                    let generateCode = this.compiler.compile(cacheEntry[sourcePreprocessor], {
                        sourcePreprocessor: sourcePreprocessor,
                        targetPreprocessor: preprocessor
                    });
                    cacheEntry[preprocessor] = generateCode;

                    return generateCode;
                }
            }).join('\n');

            result = insertAt(result, variablesContent, insertPos + offset);
            let importStatements;
            if (importStatementsMap[preprocessor]) {
                importStatements = '\n' + importStatementsMap[preprocessor].join('\n');
                result = insertAt(result, importStatements, insertPos + offset);
                offset += importStatements.length;
            }
            // update offset
            offset += variablesContent.length;
        }

        return result;
    }
}

export default VariablesConvertor;

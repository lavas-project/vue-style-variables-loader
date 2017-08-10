/**
 * @file Compiler
 *
 * @desc
 * @author panyuqi (pyqiverson@gmail.com)
 */

import {createHash} from 'crypto';

const ASSIGNMENT_OPERATOR = {
    stylus: ':=',
    less: ':',
    sass: ':'
};
const VARIABLE_PREFIX = {
    stylus: '$',
    less: '@',
    sass: '$'
};
const END_PUNCTUATION = {
    stylus: '',
    less: ';',
    sass: ';'
};
const NAMESPACE_HYPHEN = {
    stylus: '.',
    less: '-',
    sass: '-'
};

const OPERATOR_REG = {
    stylus: /^(\:?=|\:|,|[-+*\/%]=?)[ \t]*/,
    less: /^(\:|,|[-+*\/%]=?)[ \t]*/,
    sass: /^(=|\:|,|[-+*\/%]=?)[ \t]*/
};
const WHITESPACE_REG = /^\s/;
const INDENT_REG = /^([ \t])*/;
const NEWLINE_REG = {
    stylus: /^\n/,
    less: /^(;\n|;|\n)/,
    sass: /^(;\n|;|\n)/
};
const VARIABLE_REG = {
    stylus: /^(-*[_a-zA-Z$][-\w\d$]*)[ \t]*/,
    less: /^(-*[_a-zA-Z@][-\w\d]*)[ \t]*/,
    sass: /^(-*[_a-zA-Z!$][-\w\d]*)[ \t]*/
};
const UNIT_REG = /^((-)?(\d+\.\d+|\d+|\.\d+)(%|[a-zA-Z]+)?)[ \t]*/;
const MULTIPLE_LINES_COMMENT_REG = /^\/\*[\s\S]*\*\//;
const STRING_REG = /^("[^"]*"|'[^']*')[ \t]*/;
const COLOR_REG = /^(#[a-fA-F0-9]{1,6})[ \t]*/;

class Token {
    constructor(type, value) {
        this.type = type;
        this.value = value;
    }
}

class Node {
    constructor(type = 'DefineExpression', value) {
        this.type = type;
        this.value = value;
    }
}

class Compiler {
    constructor() {
        this.tokenCache = {};
        this.codeCache = {};
        this.indentation = '    ';
    }

    /**
     * split input code into tokens
     * eg.
        for the following stylus hash:

            $base-color := {
                primary: $height
                secondary: white
            }

        we get:
        [ Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: '$base-color' },
          Token { type: 'OPERATOR', value: ':=' },
          Token { type: 'HASH_START', value: undefined },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: 'primary' },
          Token { type: 'OPERATOR', value: ':' },
          Token { type: 'COLOR', value: '#fff' },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: 'secondary' },
          Token { type: 'OPERATOR', value: ':' },
          Token { type: 'VARIABLE', value: 'white' },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'HASH_END', value: undefined },
          Token { type: 'NEWLINE', value: undefined } ] 
     *
     * @param {string} input source str
     * @param {string} preprocessor [stylus|less|sass]
     * @return {Array} tokens
     */
    tokenize(input, preprocessor = 'stylus') {
        let result;
        let tokens = [];

        while (input.length) {
            // find variable
            result = VARIABLE_REG[preprocessor].exec(input);
            if (result && result[0]) {
                tokens.push(new Token('VARIABLE', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            // skip indent and whitespace
            result = INDENT_REG.exec(input);
            if (result && result[0]) {
                // tokens.push(new Token('INDENT'));
                input = input.substring(result[0].length);
                // this.indentation = result[1];
                continue;
            }

            // skip single line comment
            if (input.charAt(0) === '/' && input.charAt(1) == '/') {
                let thisLinePos = input.indexOf('\n');
                if (thisLinePos === -1) {
                    thisLinePos = input.length;
                }
                input = input.substring(thisLinePos);
                continue;
            }

            // skip multi line comment
            result = MULTIPLE_LINES_COMMENT_REG.exec(input);
            if (result && result[0]) {
                input = input.substring(result[0].length);
                continue;
            }

            // stylus hash
            if (input.charAt(0) === '{') {
                tokens.push(new Token('HASH_START'));
                input = input.substring(1);
                continue;
            }
            if (input.charAt(0) === '}') {
                tokens.push(new Token('HASH_END'));
                input = input.substring(1);
                continue;
            }

            // newline
            result = NEWLINE_REG[preprocessor].exec(input);
            if (result && result[0]) {
                tokens.push(new Token('NEWLINE'));
                input = input.substring(result[0].length);
                continue;
            }

            // find operator "=" ":=" "," "+-*/%"
            result = OPERATOR_REG[preprocessor].exec(input);
            if (result) {
                tokens.push(new Token('OPERATOR', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            // unit 14px
            result = UNIT_REG.exec(input);
            if (result) {
                tokens.push(new Token('UNIT', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            // color #rgb #rrggbb
            result = COLOR_REG.exec(input);
            if (result) {
                tokens.push(new Token('COLOR', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            // string "Lucida Grande"
            result = STRING_REG.exec(input);
            if (result) {
                tokens.push(new Token('STRING', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            throw new TypeError(`Unknown string: ${input}`);
        }

        return tokens;
    }

    /**
     * parse tokens and generate an AST
     * eg.
        for the following tokens:                   
        [ Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: '$base-color' },
          Token { type: 'OPERATOR', value: ':=' },
          Token { type: 'HASH_START', value: undefined },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: 'primary' },
          Token { type: 'OPERATOR', value: ':' },
          Token { type: 'COLOR', value: '#fff' },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'VARIABLE', value: 'secondary' },
          Token { type: 'OPERATOR', value: ':' },
          Token { type: 'VARIABLE', value: 'white' },
          Token { type: 'NEWLINE', value: undefined },
          Token { type: 'HASH_END', value: undefined },
          Token { type: 'NEWLINE', value: undefined } ] 

        we get such an AST:
        [ Node {
           type: 'DefineExpression',
           value:
             [ Node {
                 type: 'DefineExpression',
                 value:
                  Node {
                    type: 'ExpressionList',
                    value: [ Node { type: 'String', value: '#fff' } ] },
                 name: 'primary' },
               Node {
                 type: 'DefineExpression',
                 value:
                  Node {
                    type: 'ExpressionList',
                    value: [ Node { type: 'String', value: 'white' } ] },
                 name: 'secondary' } ],
            name: 'base-color',
            isHash: true } ]
     *
     * @param {Array} tokens result after tokenizing
     * @param {Set} usedVariables
     * @return {Array} ast
     */
    parse(tokens, usedVariables = new Set()) {
        // the final ast
        let ast = [];
        // meet variable on the left of an expression
        let leftVariableFlag = true;
        // are we processing stylus hash now?
        let hashFlag = false;
        // save all the tokens in hash, parse them later
        let hash = [];

        for (let i = 0; i < tokens.length; i++) {
            let token = tokens[i];
            let currentNode = ast[ast.length - 1];

            // in the hash, we just simply save the tokens and leave
            if (token.type !== 'HASH_END' && hashFlag) {
                hash.push(token);
                continue;
            }

            if (token.type === 'NEWLINE') {
                leftVariableFlag = true;
            }
            else if (token.type === 'OPERATOR') {
                // these are operators of assignment
                if (token.value === ':' || token.value === '='
                    || token.value === ':=') {
                    leftVariableFlag = false;
                }
                else {
                    // save some operator such as "+-*/%,"
                    currentNode.value.value.push(new Node('Operator', token.value));
                }
            }
            else if (token.type === 'HASH_START') {
                hashFlag = true;
                // mark current node as hash
                currentNode.isHash = true;
            }
            else if (token.type === 'HASH_END') {
                // parse hash recursively
                currentNode.value = this.parse(hash, usedVariables);
                hashFlag = false;
            }
            else if (token.type === 'VARIABLE') {
                // remove the prefix like "@$!"
                let variableName = token.value.replace(/^[$@!]/, '');
                // variable on the left in expression
                if (leftVariableFlag) {
                    let expression = new Node('DefineExpression');
                    expression.name = variableName;
                    expression.value = new Node('ExpressionList', []);
                    usedVariables.add(variableName);
                    ast.push(expression);
                }
                // we need to recognize whether current variable has been defined
                else if (usedVariables.has(variableName)) {
                    currentNode.value.value.push(new Node('Variable', variableName));
                }
                else {
                    currentNode.value.value.push(new Node('String', variableName));
                    // add current variable to Set
                    usedVariables.add(variableName);
                }
            }
            else if (token.type === 'UNIT'
                || token.type === 'COLOR'
                || token.type === 'STRING') {
                currentNode.value.value.push(new Node('String', token.value));
            }
            else {
                throw new TypeError(`Unknown Token: ${token}`);
            }
        }
        return ast;
    }

    generateCode(ast, {
        preprocessor = 'stylus',
        stylusHash = false,
        indent = 0,
        namespace = ''
    }) {
        if (Array.isArray(ast)) {
            return ast.map(subAst => 
                this.generateCode(subAst, {
                    preprocessor,
                    stylusHash,
                    indent,
                    namespace
                })).join('\n');
        }

        if (ast.type === 'DefineExpression') {
            // handle stylus hash
            if (ast.isHash) {
                if (preprocessor === 'stylus') {
                    return `${VARIABLE_PREFIX[preprocessor]}${ast.name} ${ASSIGNMENT_OPERATOR[preprocessor]} {\n`
                        + this.generateCode(ast.value, {
                            preprocessor,
                            stylusHash: true,
                            indent: indent + 1
                        })
                        + '\n}';
                }
                // in less & sass, we need to convert stylus hash into namespace
                // eg. in less @base-color.primary
                return this.generateCode(ast.value, {
                    preprocessor,
                    indent,
                    namespace: ast.name
                });
            }
            else {
                let prefix = VARIABLE_PREFIX[preprocessor];
                let assignmentOp = ASSIGNMENT_OPERATOR[preprocessor];
                let indentBefore = [...Array(indent)].reduce((prev, cur) => prev + this.indentation, '');
                if (stylusHash) {
                    prefix = '';
                    assignmentOp = ':';
                }
                namespace = namespace ? `${namespace}${NAMESPACE_HYPHEN[preprocessor]}` : '';
                return `${indentBefore}${prefix}${namespace}${ast.name} ${assignmentOp} `
                    + this.generateCode(ast.value, {preprocessor})
                    + `${END_PUNCTUATION[preprocessor]}`;
            }
        }
        else if (ast.type === 'ExpressionList') {
            return ast.value.reduce((prev, currentNode) => {
                let {type, value} = currentNode;
                if (type === 'Variable') {
                    value = (stylusHash ? '' : `${VARIABLE_PREFIX[preprocessor]}`)
                        + value;
                }
                return prev + value;
            }, '');
        }
        throw new TypeError(`Unknown Node: ${ast.type}`);
    }

    /**
     * generate hash
     *
     * @param {string} input source str
     * @param {string} preprocessor [stylus|less|sass]
     * @return {string} hash
     */
    hash(input, preprocessor) {
        let hash = createHash('sha1');
        hash.update(input + preprocessor);
        return hash.digest('hex');
    }

    compile(input, {
        sourcePreprocessor = 'stylus',
        targetPreprocessor = 'stylus',
    }) {
        if (sourcePreprocessor === targetPreprocessor) {
            return input;
        }

        let codeHash = this.hash(input, targetPreprocessor);
        if (this.codeCache[codeHash]) {
            return this.codeCache[codeHash];
        }

        let tokenHash = this.hash(input, sourcePreprocessor);
        let tokens;
        if (this.tokenCache[tokenHash]) {
            tokens = this.tokenCache[tokenHash];
        }
        else {
            tokens = this.tokenize(input, sourcePreprocessor);
            this.tokenCache[tokenHash] = tokens;
        }
        let ast = this.parse(tokens);
        let code = this.generateCode(ast, {preprocessor: targetPreprocessor});
        this.codeCache[codeHash] = code;
        return code;
    }
}

export default Compiler;
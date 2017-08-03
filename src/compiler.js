/**
 * @file Compiler
 *
 * @desc
 * @author panyuqi (pyqiverson@gmail.com)
 */

const OPERATOR_REG = /^(\:?=|\:|,|[-+*\/%]=?)[ \t]*/;
const WHITESPACE_REG = /^\s/;
const INDENT_REG = /^[ \t]*/;
const NEWLINE_REG = /^\n/;
const IDENTITY_REG = /^(-*[_a-zA-Z$][-\w\d$]*)[ \t]*/;
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

class Compiler {
    constructor() {
    }

    tokenizer(input) {
        let result;
        let tokens = [];

        while (input.length) {
            // find left val
            result = IDENTITY_REG.exec(input);
            if (result && result[0]) {
                tokens.push(new Token('IDENTITY', result[1]));
                input = input.substring(result[0].length);
                continue;
            }

            // indent
            result = INDENT_REG.exec(input);
            if (result && result[0]) {
                tokens.push(new Token('INDENT'));
                input = input.substring(result[0].length);
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
            result = NEWLINE_REG.exec(input);
            if (result && result[0]) {
                tokens.push(new Token('NEWLINE'));
                input = input.substring(result[0].length);
                continue;
            }

            // find operator "=" ":=" "," "+-*/%"
            result = OPERATOR_REG.exec(input);
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
}

export default Compiler;
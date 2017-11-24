/**
 * @file tokenizer.test.js
 *
 * @desc test case for compiler.tokenize
 * @author panyuqi (pyqiverson@gmail.com)
 */

import test from 'ava';
import Compiler from '../../lib/compiler';

let lessContent;
let preprocessor = 'less';
const compiler = new Compiler();

test('it should tokenize all newlines correctly', async t => {
    lessContent = `

    `;

    t.true(compiler.tokenize(lessContent, preprocessor).length === 1);
});

test('it should ignore comments', async t => {

    // test single line
    lessContent = `// this is a single line comment`;
    t.true(compiler.tokenize(lessContent, preprocessor).length === 0);

    lessContent = `/* another single line comments */`;
    t.true(compiler.tokenize(lessContent, preprocessor).length === 0);

    // test multi line
    lessContent = `/* multiple line comments
                    xxx */`;
    t.true(compiler.tokenize(lessContent, preprocessor).length === 0);
});

test('it should tokenize variables correctly', async t => {
    let tokens;

    // test color variable in string format
    lessContent = `@base-color: green;`;
    tokens = compiler.tokenize(lessContent, preprocessor);
    t.true(tokens[0].value === '@base-color'
        && tokens[1].value === ':'
        && tokens[2].value === 'green');

    // test color variable in rgb format
    lessContent = `@base-color: #fff;`;
    tokens = compiler.tokenize(lessContent, preprocessor);
    t.true(tokens[0].value === '@base-color'
        && tokens[1].value === ':'
        && tokens[2].value === '#fff');

    // test color variable in rrggbb format
    lessContent = `@base-color: #ffffff;`;
    tokens = compiler.tokenize(lessContent, preprocessor);
    t.true(tokens[0].value === '@base-color'
        && tokens[1].value === ':'
        && tokens[2].value === '#ffffff');

    // test unit variable
    lessContent = `@height: 14px;
                    @color: #FFF;`;
    tokens = compiler.tokenize(lessContent, preprocessor);
    t.true(tokens[0].value === '@height'
        && tokens[1].value === ':'
        && tokens[2].value === '14px'
        && tokens[3].type === 'NEWLINE'
        && tokens[4].value === '@color');
});

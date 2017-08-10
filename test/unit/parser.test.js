/**
 * @file parser.test.js
 *
 * @desc test case for compiler.parse
 * @author panyuqi (pyqiverson@gmail.com)
 */

import test from 'ava';
import Compiler from '../../lib/compiler';
// import {inspect} from 'util';

let compiler = new Compiler();

test('it should ignore all comments', async t => {
    let content = `
        $base-color = green
        // single line comment
        /*
         * multi line comment
         */
        $accent-color = #fff
    `;
    let tokens = compiler.tokenize(content);
    let ast = compiler.parse(tokens);
    // console.log(inspect(ast, false, null));
    
    /**
     * the AST looks like:
        Node {
            type: 'DefineExpression',
            value:
                Node {
                   type: 'ExpressionList',
                   value: [ Node { type: 'String', value: 'green' } ]
                },
            name: 'base-color'
        },
        Node {
            type: 'DefineExpression',
            value:
                Node {
                   type: 'ExpressionList',
                   value: [ Node { type: 'String', value: '#fff' } ]
                },
            name: 'accent-color'
        }
    */
    t.true(ast[0].name === 'base-color'
        && ast[0].value.value[0].value === 'green'
        && ast[1].name === 'accent-color'
        && ast[1].value.value[0].value === '#fff');
});

test('it should parse operator correctly', async t => {
    let content = `
        $base-color = #aaa + #111
    `;
    let tokens = compiler.tokenize(content);
    let ast = compiler.parse(tokens);

    t.true(ast[0].name === 'base-color'
        && ast[0].value.value.length === 3
        && ast[0].value.value[0].type === 'String'
        && ast[0].value.value[0].value === '#aaa'
        && ast[0].value.value[1].type === 'Operator'
        && ast[0].value.value[1].value === '+'
        && ast[0].value.value[2].type === 'String'
        && ast[0].value.value[2].value === '#111');
});

test('it should keep variables which consist of an expression list', async t => {
    let content = `
        font-size = 2em
        font = font-size "Lucida Grande", Arial
    `;
    let tokens = compiler.tokenize(content);
    let ast = compiler.parse(tokens);
    t.true(ast[0].name === 'font-size'
        && ast[1].name === 'font'
        && ast[1].value.value.length === 4
        && ast[1].value.value[0].type === 'Variable'
        && ast[1].value.value[0].value === 'font-size'
        && ast[1].value.value[1].type === 'String'
        && ast[1].value.value[1].value === '"Lucida Grande"'
        && ast[1].value.value[2].type === 'Operator'
        && ast[1].value.value[2].value === ','
        && ast[1].value.value[3].type === 'String'
        && ast[1].value.value[3].value === 'Arial');
});

test('it should parse stylus variables correctly', async t => {
    let content = `
        $base-color = green
        $height = 14px
    `;
    let tokens = compiler.tokenize(content, 'stylus');
    let ast = compiler.parse(tokens);

    t.true(ast[0].name === 'base-color'
        && ast[1].name === 'height');
});

test('it should parse stylus hash correctly', async t => {
    let content = `
        $base-color := {
            primary: #fff
            secondary: white
        }
    `;
    let tokens = compiler.tokenize(content, 'stylus');
    let ast = compiler.parse(tokens);

    t.true(ast[0].name === 'base-color'
        && ast[0].value[0].name === 'primary'
        && ast[0].value[0].value.value[0].value === '#fff'
        && ast[0].value[1].name === 'secondary'
        && ast[0].value[1].value.value[0].value === 'white');
});

test('it should parse less variables correctly', async t => {
    let content = `
        @base-color: green;
        @height: 14px;
    `;
    let tokens = compiler.tokenize(content, 'less');
    let ast = compiler.parse(tokens);

    t.true(ast[0].name === 'base-color'
        && ast[0].value.value[0].value === 'green'
        && ast[1].name === 'height'
        && ast[1].value.value[0].value === '14px');
});

test('it should parse sass variables correctly', async t => {
    let content = `
        $base-color: green;
        !height = 14px;
    `;
    let tokens = compiler.tokenize(content, 'sass');
    let ast = compiler.parse(tokens);

    t.true(ast[0].name === 'base-color'
        && ast[0].value.value[0].value === 'green'
        && ast[1].name === 'height'
        && ast[1].value.value[0].value === '14px');
});
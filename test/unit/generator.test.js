/**
 * @file generator.test.js
 *
 * @desc test case for compiler.generateCode
 * @author panyuqi (pyqiverson@gmail.com)
 */

import test from 'ava';
import Compiler from '../../lib/compiler';
import {inspect} from 'util';

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
    let tokens = compiler.tokenize(content, 'stylus');
    let ast = compiler.parse(tokens);
    let stylusCode = compiler.generateCode(ast, {preprocessor: 'stylus'});
    let lessCode = compiler.generateCode(ast, {preprocessor: 'less'});
    let sassCode = compiler.generateCode(ast, {preprocessor: 'sass'});

    t.true(stylusCode === '$base-color := green\n$accent-color := #fff');
    t.true(lessCode === '@base-color : green;\n@accent-color : #fff;');
    t.true(sassCode === '$base-color : green;\n$accent-color : #fff;');
});

test('it generate stylus hash correctly', async t => {
    let content = `
        $primary-color = #fff
        $base-color := {
            primary: $primary-color,
            secondary: white
        }
        $color = {
            "white": $base-color
        }
    `;
    let tokens = compiler.tokenize(content, 'stylus');
    let ast = compiler.parse(tokens);
    ast = compiler.transform(ast);

    // console.log(inspect(ast, false, null));

    let stylusCode = compiler.generateCode(ast, {preprocessor: 'stylus'});
    let lessCode = compiler.generateCode(ast, {preprocessor: 'less'});
    let sassCode = compiler.generateCode(ast, {preprocessor: 'sass'});

    t.true(stylusCode === `$primary-color := #fff
$base-color := {
    primary : $primary-color,
    secondary : white
}
$color := {
    white : $base-color
}`);
    t.true(lessCode === `@primary-color : #fff;
@base-color-primary : @primary-color;
@base-color-secondary : white;
@color-white-primary : @primary-color;
@color-white-secondary : white;`);

    t.true(sassCode === `$primary-color : #fff;
$base-color-primary : $primary-color;
$base-color-secondary : white;
$color-white-primary : $primary-color;
$color-white-secondary : white;`);
});
import test from 'ava';
import Compiler from '../../src/compiler';
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

    t.true(stylusCode === '$base-color = green\n$accent-color = #fff');
    t.true(lessCode === '@base-color : green;\n@accent-color : #fff;');
    t.true(sassCode === '$base-color : green;\n$accent-color : #fff;');
});

test('it generate stylus hash correctly', async t => {
    let content = `
        $base-color := {
            primary: #fff
            secondary: white
        }
    `;
    let tokens = compiler.tokenize(content, 'stylus');
    let ast = compiler.parse(tokens);
    let stylusCode = compiler.generateCode(ast, {preprocessor: 'stylus'});
    // let lessCode = compiler.generateCode(ast, 'less');
    // let sassCode = compiler.generateCode(ast, 'sass');

    // t.true(stylusCode === '$base-color = green\n$accent-color = #fff');
    // t.true(lessCode === '@base-color : green;\n@accent-color : #fff;');
    // t.true(sassCode === '$base-color : green;\n$accent-color : #fff;');
});
import test from 'ava';
import Compiler from '../../src/compiler';

let sassContent;
let preprocessor = 'sass';
const compiler = new Compiler();

test('it should tokenize all newlines correctly', async t => {
    sassContent = `

    `;

    t.true(compiler.tokenize(sassContent, preprocessor).length === 2);
});

test('it should ignore comments', async t => {

    // test single line
    sassContent = `// this is a single line comment`;
    t.true(compiler.tokenize(sassContent, preprocessor).length === 0);

    sassContent = `/* another single line comments */`;
    t.true(compiler.tokenize(sassContent, preprocessor).length === 0);

    // test multi line
    sassContent = `/* This comment is
 * several lines long.
 * since it uses the CSS comment syntax,
 * it will appear in the CSS output. */`;
    t.true(compiler.tokenize(sassContent, preprocessor).length === 0);
});

test('it should tokenize variables correctly', async t => {
    let tokens;

    // test color variable in string format
    sassContent = `$base-color: green;`;
    tokens = compiler.tokenize(sassContent, preprocessor);
    t.true(tokens[0].value === '$base-color'
        && tokens[1].value === ':'
        && tokens[2].value === 'green');

    // test color variable in rgb format
    sassContent = `$base-color: #fff;`;
    tokens = compiler.tokenize(sassContent, preprocessor);
    t.true(tokens[0].value === '$base-color'
        && tokens[1].value === ':'
        && tokens[2].value === '#fff');

    // test color variable in rrggbb format
    sassContent = `$base-color: #ffffff;`;
    tokens = compiler.tokenize(sassContent, preprocessor);
    t.true(tokens[0].value === '$base-color'
        && tokens[1].value === ':'
        && tokens[2].value === '#ffffff');

    // test unit variable
    sassContent = `$height: 14px;
                    $color: #FFF;`;
    tokens = compiler.tokenize(sassContent, preprocessor);
    t.true(tokens[0].value === '$height'
        && tokens[1].value === ':'
        && tokens[2].value === '14px'
        && tokens[3].type === 'NEWLINE'
        && tokens[4].value === '$color');
});

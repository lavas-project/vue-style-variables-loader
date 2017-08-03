import test from 'ava';
import Compiler from '../../src/compiler';

let stylusContent;
const compiler = new Compiler();

test.before('run webpack build first', async t => {
    stylusContent = `
        // this is single line comment
        $font-size = 15px
        $color1 = white
        $color2 = #fff
        height = 3em
    `;
});

test('it should tokenize all newlines correctly', async t => {
    stylusContent = `

    `;

    t.true(compiler.tokenizer(stylusContent).length === 3);
});

test('it should ignore comments', async t => {

    // test single line
    stylusContent = `// this is a single line comment`;
    t.true(compiler.tokenizer(stylusContent).length === 0);

    stylusContent = `/* another single line comments */`;
    t.true(compiler.tokenizer(stylusContent).length === 0);

    // test multi line
    stylusContent = `/*
         * multiple line comments
         */`;
    t.true(compiler.tokenizer(stylusContent).length === 0);

    // test combined case
    stylusContent = `// this is a single line comment
/*
 * multiple line comments
 */`;
    let tokens = compiler.tokenizer(stylusContent);
    t.true(tokens.length === 1
        && tokens[0].type === 'NEWLINE');
});

test('it should tokenize variables correctly', async t => {
    let tokens;

    // test color variable in string format
    stylusContent = `$base-color = green`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens.length === 3
        && tokens[0].value === '$base-color'
        && tokens[1].value === '='
        && tokens[2].value === 'green');

    // test color variable in rgb format
    stylusContent = `$base-color = #fff`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens.length === 3
        && tokens[0].value === '$base-color'
        && tokens[1].value === '='
        && tokens[2].value === '#fff');

    // test color variable in rrggbb format
    stylusContent = `$base-color = #ffffff`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens.length === 3
        && tokens[0].value === '$base-color'
        && tokens[1].value === '='
        && tokens[2].value === '#ffffff');

    // test unit variable
    stylusContent = `$height = 14px`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens.length === 3
        && tokens[0].value === '$height'
        && tokens[1].value === '='
        && tokens[2].value === '14px');

    // test string variable
    stylusContent = `font = font-size "Lucida Grande", Arial`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens[0].value === 'font'
        && tokens[1].value === '='
        && tokens[2].value === 'font-size'
        && tokens[3].value === '"Lucida Grande"'
        && tokens[4].value === ','
        && tokens[5].value === 'Arial');

    // test stylus hash
    stylusContent = `$theme := {
        primary: #000,
        secondary: #000
    }`;
    tokens = compiler.tokenizer(stylusContent);
    t.true(tokens[0].value === '$theme'
        && tokens[1].value === ':='
        && tokens[2].type === 'HASH_START'
        && tokens[tokens.length - 1].type === 'HASH_END');
});

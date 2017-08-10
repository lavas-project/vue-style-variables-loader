/**
 * @file convertor.test.js
 *
 * @desc test case for src/variables-convertor
 * @author panyuqi (pyqiverson@gmail.com)
 */

import test from 'ava';
import * as path from 'path';
import VariablesConvertor from '../../lib/variables-convertor';

test('it should read .styl, .less and .scss files correctly', async t => {
    let convertor = new VariablesConvertor();
    let rawVueFileContent = `
<template></template>
<style lang="styl">

    .selector
        height 15px

</style>
`;
    await convertor.read(path.join(__dirname, '../fixture/variables.styl'));
    await convertor.read(path.join(__dirname, '../fixture/variables.less'));
    await convertor.read(path.join(__dirname, '../fixture/variables.scss'));

    t.true(convertor.convert(rawVueFileContent) === `
<template></template>
<style lang="styl">
$color := blue
$height = 15px
$base-color := green
$header-height := 2em
$accent-color := green
$footer-height := 2em

    .selector
        height 15px

</style>
`);
});

test('it should convert stylus hash and insert into less block correctly', async t => {
    let convertor = new VariablesConvertor();
    let rawVueFileContent = `
<template></template>
<style lang="less">

    .selector {
        height: 15px;
    }

</style>
`;
    await convertor.read(path.join(__dirname, '../fixture/hash.styl'));

    t.true(convertor.convert(rawVueFileContent) === `
<template></template>
<style lang="less">
@theme-primary : white;
@theme-secondary : #fff;

    .selector {
        height: 15px;
    }

</style>
`);
});

test('it should convert stylus hash and insert into scss block correctly', async t => {
    let convertor = new VariablesConvertor();
    let rawVueFileContent = `
<template></template>
<style lang="scss">

    .selector {
        height: 15px;
    }

</style>
`;
    await convertor.read(path.join(__dirname, '../fixture/hash.styl'));

    t.true(convertor.convert(rawVueFileContent) === `
<template></template>
<style lang="scss">
$theme-primary : white;
$theme-secondary : #fff;

    .selector {
        height: 15px;
    }

</style>
`);
});

test('it should insert into multiple <style> blocks correctly', async t => {
let convertor = new VariablesConvertor();
    let rawVueFileContent = `
<template></template>
<style lang="styl">

    .selector
        height 15px

</style>

<style lang="scss">

    .selector {
        height: 15px;
    }

</style>

<style lang="less">

    .selector {
        height: 15px;
    }

</style>
`;
    await convertor.read(path.join(__dirname, '../fixture/hash.styl'));

    t.true(convertor.convert(rawVueFileContent) === `
<template></template>
<style lang="styl">
$theme := {
    primary: white
    secondary: #fff
}

    .selector
        height 15px

</style>

<style lang="scss">
$theme-primary : white;
$theme-secondary : #fff;

    .selector {
        height: 15px;
    }

</style>

<style lang="less">
@theme-primary : white;
@theme-secondary : #fff;

    .selector {
        height: 15px;
    }

</style>
`);
});

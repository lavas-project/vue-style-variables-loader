/**
 * @file examples/keen-ui test case
 * @author panyuqi (pyqiverson@gmail.com)
 */

/* eslint-disable fecs-use-standard-promise */

import * as path from 'path';
import Promise from 'bluebird';
import test from 'ava';
import {
    runWebpackCompilerMemoryFs,
    testFs
} from './utils.js';

import keenUiConfig from '../examples/keen-ui/webpack.config.js';

const fs = testFs;

const vuetifyExamplePath = path.resolve(__dirname, '../examples/keen-ui');
const webpackBuildPath = path.resolve(vuetifyExamplePath, './dist');

const readFile = Promise.promisify(fs.readFile, {context: fs});

let webpackBuildStats = null;

test.before('run webpack build first', async t => {
    webpackBuildStats = await runWebpackCompilerMemoryFs(keenUiConfig);
});

test('it should run successfully', async t => {
    let {stats, errors} = webpackBuildStats;
    t.falsy(stats.hasWarnings() && errors.hasWarnings());
});

test('read variables.styl and insert variables into stylus/less/scss/sass <style> blocks', async t => {
    let cssContent = await readFile(path.join(webpackBuildPath, './static/css/app.css'), 'utf8');

    /**
     * examples/keen-ui/src/Component.vue
     * use sass in stylus <style> blocks
     */
    let stylusSelector = `
.stylus-selector {
  color: #673ab7;
}
`;

    t.true(cssContent.indexOf(stylusSelector) > -1);
});

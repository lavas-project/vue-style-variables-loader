/**
 * @file examples/vuetify test case
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

import vuetifyConfig from '../examples/vuetify/webpack.config.js';

const fs = testFs;

const vuetifyExamplePath = path.resolve(__dirname, '../examples/vuetify');
const webpackBuildPath = path.resolve(vuetifyExamplePath, './dist');

const readFile = Promise.promisify(fs.readFile, {context: fs});

let webpackBuildStats = null;

test.before('run webpack build first', async t => {
    webpackBuildStats = await runWebpackCompilerMemoryFs(vuetifyConfig);
});

test('it should run successfully', async t => {
    let {stats, errors} = webpackBuildStats;
    t.falsy(stats.hasWarnings() && errors.hasWarnings());
});

test('read variables.styl and insert variables into stylus/less/scss/sass <style> blocks', async t => {
    let cssContent = await readFile(path.join(webpackBuildPath, './static/css/app.css'), 'utf8');

    /**
     * examples/vuetify/src/App.vue
     * use stylus hash in less/sass <style> blocks
     */
    let stylusSelector = `
.stylus-selector {
  color: #ef5350;
  background: #ef5350;
}
`;
    let lessSelector = `
.less-selector {
  color: #EF5350;
  background: #EF5350;
}`;
    
    let sassSelector = `
.scss-selector {
  color: #EF5350;
  background: #EF5350;
}

.sass-selector {
  color: #EF5350;
  background: #EF5350;
}`;
    
    /**
     * examples/vuetify/src/styles/theme.styl
     * we override the primary color of vuetify's theme
     */
    let vuetifyThemePrimarySelector = `
.primary {
  background-color: #ef5350 !important;
  border-color: #ef5350 !important;
}
`;
    /**
     * we use '@import "~@/styles/other-variables.less";'
     */
    let directImport = `
.less-selector2 {
  color: #aaaaaa;
}`;

    t.true(cssContent.indexOf(stylusSelector) > -1
        && cssContent.indexOf(lessSelector) > -1
        && cssContent.indexOf(sassSelector) > -1
        && cssContent.indexOf(vuetifyThemePrimarySelector) > -1
        && cssContent.indexOf(directImport) > -1);
});

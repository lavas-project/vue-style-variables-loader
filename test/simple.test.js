/**
 * @file a simple test case
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

import simpleConfig from '../examples/simple/webpack.config.js';

const fs = testFs;

const simpleExamplePath = path.resolve(__dirname, '../examples/simple');
const webpackBuildPath = path.resolve(simpleExamplePath, './dist');

const readFile = Promise.promisify(fs.readFile, {context: fs});

let webpackBuildStats = null;

test.before('run webpack build first', async t => {
    webpackBuildStats = await runWebpackCompilerMemoryFs(simpleConfig);
});

test('it should run successfully', async t => {
    let {stats, errors} = webpackBuildStats;
    t.falsy(stats.hasWarnings() && errors.hasWarnings());
});

test('read variables.styl and insert variables into stylus/less/scss/sass <style> blocks', async t => {
    /**
        // variables.styl

        $color := blue
        $height = 15px
        $theme := {
            primary: $color
            secondary: #fff
        }
    */
    let cssContent = await readFile(path.join(webpackBuildPath, './static/css/app.css'), 'utf8');
    t.true(cssContent === `
.stylus-selector {
  color: #00f;
  height: 15px;
}

.less-selector {
  color: blue;
  height: 15px;
  background-color: #aaaaaa;
}

.scss-selector {
  color: blue;
  height: 15px;
}

.sass-selector {
  color: blue;
  height: 15px;
}
`);
});

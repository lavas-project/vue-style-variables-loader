/**
 * @file keen-ui entry
 * @author panyuqi <pyqiverson@gmail.com>
 */

import Vue from 'vue';
import { UiAlert, UiButton } from 'keen-ui';
import Component from './Component.vue';

new Vue({
    components: {
        UiAlert,
        UiButton
    }
});

new Vue({
    el: '#app',
    components: {
        Component
    },
    template: '<Component />'
});

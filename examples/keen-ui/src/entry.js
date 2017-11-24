/**
 * @file keen-ui entry
 * @author panyuqi <pyqiverson@gmail.com>
 */

import Vue from 'vue';
import Component from './Component.vue';

new Vue({
    el: '#app',
    components: {
        Component
    },
    template: '<Component />'
});

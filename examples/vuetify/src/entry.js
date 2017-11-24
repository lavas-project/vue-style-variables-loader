/**
 * @file keen-ui entry
 * @author panyuqi <pyqiverson@gmail.com>
 */

import Vue from 'vue';
import App from './App.vue';
import {
    Vuetify,
    VApp,
    VBtn
} from 'vuetify';

import '@/styles/global.styl';

Vue.use(Vuetify, {
    components: {
        VApp,
        VBtn
    }
});

new Vue({
    el: '#app',
    components: {
        App
    },
    template: '<App />'
});

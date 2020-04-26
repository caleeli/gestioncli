import Vue from 'vue';
import App from './App.vue';
import { BootstrapVue } from 'bootstrap-vue';
import 'bootstrap/dist/css/bootstrap.css';
import 'bootstrap-vue/dist/bootstrap-vue.css';
import VueRouter from 'vue-router';
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';

const moment = require('moment')
require('moment/locale/es')
 
Vue.use(require('vue-moment'), {
    moment
})
library.add(fas);
Vue.component('font-awesome-icon', FontAwesomeIcon)

/**
 * Modules
 */
const router = window.router = new VueRouter({
  routes: []
});
const modules = require.context('./components/', true, /\.vue$/i);
modules.keys().map(key => {
    const component = modules(key).default;
    const name = key.split('/').pop().split('.')[0];
    Vue.component(name, component);
    if (component.path) {
      const path = component.path ? component.path : name;
      window.router.addRoutes([{ path, component, props: true }]);
    }
});

Vue.config.productionTip = false;
Vue.use(BootstrapVue);
Vue.use(VueRouter);

import axios0 from 'axios';
window.axios = axios0.create({
  baseURL: 'http://localhost:8000/api',
});

new Vue({
  router,
  render: h => h(App),
}).$mount('#app');

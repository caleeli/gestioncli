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
const home = 'http://localhost:8000';

window.axios = axios0.create({
  baseURL: home + '/api',
});

import Echo from 'laravel-echo';

window.io = require('socket.io-client');

new Vue({
  router,
  render: h => h(App),
  data() {
    return {
      userId: null,
      home: home + '/login',
    };
  },
  methods: {
    joinEcho({BROADCASTER_HOST, BROADCASTER_KEY, userId, token}) {
      this.userId = userId;
      window.Echo = new Echo({
        broadcaster: 'socket.io',
        host: BROADCASTER_HOST,
        key: BROADCASTER_KEY,
        auth: {
          headers: {
            'X-ClientLogin': token,
          }
        }
      });
      window.Echo.private(`App.User.${this.$root.userId}`)
      .listen('.App.Events.IssuesUpdated', (e) => {
        if (this.$children[0].$refs.current.IssuesUpdated instanceof Function) {
          this.$children[0].$refs.current.IssuesUpdated(e);
        }
      });
    },
  }
}).$mount('#app');

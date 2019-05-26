import Vue from "vue";
import _ from "lodash";
import App from "./App.vue";

window.Vue = Vue;
Vue.config.productionTip = false;
Object.defineProperty(Vue.prototype, "_", { value: _ });

window.data = window.data || {};
_.defaults(window.data, {
  chat: false,
  chats: {},
  online: [],
  loading: true,
  text: "",
  typing: [],
  chatHeight: 400
});

new Vue({
  render: h => h(App)
}).$mount("#app");

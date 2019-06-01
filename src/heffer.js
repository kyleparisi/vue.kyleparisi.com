import Chat from "./components/Chat.vue";

Object.defineProperty(Vue.prototype, "_", { value: _ });

window.data = window.data || {};
_.defaults(window.data, {
  chat: false,
  chats: {},
  online: [],
  loading: true,
  text: "",
  typing: [],
  chatHeight: 400,
  loadedOldestMessage: false,
  newMessageId: false
});

const Components = {
  Chat
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

export default Components;

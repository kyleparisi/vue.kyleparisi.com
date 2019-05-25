<template>
  <div id="app">
    <h1>Welcome to Your Vue.js App</h1>

    <h2>Chat Component</h2>
    <Chat
      v-on:chat-title-clicked="chatTitleClicked"
    ></Chat>

    <div></div>
  </div>
</template>

<script>
import HelloWorld from './components/HelloWorld.vue'
import Chat from './components/Chat.vue'

export default {
  name: 'app',
  components: {
    HelloWorld,
    Chat
  },
  methods: {
    chatTitleClicked: function() {
      console.log('test')
    }
  }
}
</script>

<style>
#app {
  font-family: 'Avenir', Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>

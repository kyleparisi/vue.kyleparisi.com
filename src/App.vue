<template>
  <div id="app">
    <h1 class="tc">Welcome to Your Vue.js App</h1>

    <h2 class="tc">Chat Component</h2>
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

</style>

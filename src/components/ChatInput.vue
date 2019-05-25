<template>
  <div class="absolute main-padding bottom-0 left-0 w-100">
    <div class="pa2 bg-passive bt" style="border-color: gainsboro;">
      <label for="message" class="dn">Chat input</label>
      <input
        id="message"
        class="input w-100"
        type="text"
        placeholder="Message..."
        v-model="text"
        v-on:keyup.enter="$emit('send-message')"
        v-on:keyup.esc="$emit('update-read')"
        v-on:keyup="$emit('typing')"
        autocomplete="off"
      />
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return window.data;
  }
};
</script>

<style scoped>
  .input {
    padding: 0.5rem;
    background-color: #eee;
    width: 100%;
    -webkit-appearance: none;
    -moz-appearance: none;
    border-color: rgba(0, 0, 0, 0.1);
    border-style: solid;
    border-width: 1px;
  }
</style>

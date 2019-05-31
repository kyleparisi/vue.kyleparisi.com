<template>
  <div class="ba b--light-gray w-100">
    <div class="relative h-100">
      <div id="chat-list" class="absolute h-100">
        <div
          class="relative h-100 dn db-l bg-passive2 z-2"
          style="width: 268px"
          id="side-navigation"
        >
          <div class="w-100 cf bb" style="border-color: rgb(197, 197, 197);">
            <div class="fl pl3 ttu" style="line-height: 55px">Chats</div>
            <div
              class="fr pa3 pointer fw6 db dn-l"
              @click="$emit('close-chat-list')"
            >
              X
            </div>
          </div>

          <chat-list
            v-on:select-chat="$emit('select-chat', $event)"
          ></chat-list>
        </div>
      </div>

      <div class="main-padding">
        <div id="chat" class="bg-passive">
          <chat-title
            v-on:open-chat-list="$emit('open-chat-list')"
            v-on:chat-title-clicked="$emit('chat-title-clicked')"
          ></chat-title>
          <div class="overflow-y-scroll" :style="{ height: 'calc(' + chatHeight + 'px - 56px - 52px)' }">
            <chat-messages
              v-on:close-chat-list="$emit('close-chat-list')"
              v-on:get-older-messages="$emit('get-older-messages')"
            ></chat-messages>
          </div>
          <div style="height: 52px">
            <chat-input
              v-on:send-message="$emit('send-message')"
              v-on:update-read="$emit('update-read')"
              v-on:typing="$emit('typing')"
            ></chat-input>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import ChatInput from "./ChatInput";
import ChatList from "./ChatList";
import ChatMessages from "./ChatMessages";
import ChatTitle from "./ChatTitle";

export default {
  name: "Chat",
  data() {
    return window.data;
  },
  components: {
    ChatTitle,
    ChatMessages,
    ChatInput,
    ChatList
  }
};
</script>

<style scoped>
.main-padding {
  padding-left: 0;
}
@media screen and (min-width: 60em) {
  .main-padding {
    padding-left: 268px;
  }
}
.bg-passive {
  background-color: #f9fafb;
}
.bg-passive2 {
  background-color: #e7e7e8;
}
</style>

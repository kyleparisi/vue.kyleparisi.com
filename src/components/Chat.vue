<template>
  <div>
    <nav id="chat-list">
      <div
        class="fixed h-100 dn db-l bg-passive2 z-2"
        style="width: 268px"
        id="side-navigation"
      >
        <div class="w-100 cf bb" style="border-color: rgb(197, 197, 197);">
          <div class="fl pl3 ttu" style="line-height: 55px">Chats</div>
          <div
            class="fr pa3 pointer fw6 db dn-l"
            onclick="document.getElementById('side-navigation').classList.toggle('dn')"
          >
            X
          </div>
        </div>

        <ChatList></ChatList>
      </div>
    </nav>

    <main class="main-padding">
      <div id="chat" class="min-vh-100 bg-passive">
        <ChatTitle></ChatTitle>
        <ChatMessages></ChatMessages>
        <ChatInput></ChatInput>
      </div>
    </main>
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
  },
  watch: {
    chat: groupMessages,
    "chat.read": groupMessages
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

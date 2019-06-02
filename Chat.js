function storeNewMessageFlagIfNeeded(messages) {
  data.newMessageId = false;
  if (!messages || !messages.length) {
    return false;
  }
  // If you sent last message, no new messages
  if (messages[messages.length - 1].user_id === data.chat.you) {
    return false;
  }
  for (let i = 0; i < messages.length; i++) {
    if (
      parseInt(messages[i].timestamp) > data.chat.read &&
      messages[i].user_id !== data.chat.you
    ) {
      data.newMessageId = messages[i].id;
      break;
    }
  }
}

function groupMessagesByDay(messages) {
  const currentDate = new Date();
  // set to midnight
  currentDate.setHours(0, 0, 0, 0);
  const byDate = {};
  messages.map(message => {
    const date = new Date(message.timestamp * 1000);
    // set to midnight
    date.setHours(0, 0, 0, 0);
    const time = date.getTime() / 1000;
    if (!byDate[time]) {
      byDate[time] = true;
      message.addAvatar = true;
      message.addDayDivider = time;
    } else {
      message.addDayDivider = false;
    }
  });
}
function groupMessagesByUser(messages) {
  messages.reduce((grouped, message) => {
    if (grouped.length === 0) {
      grouped.unshift([message]);
      message.addAvatar = true;
    } else if (grouped[0][0].user_id === message.user_id) {
      grouped[0].push(message);
      if (message.addAvatar !== true) {
        message.addAvatar = false;
      }
    } else {
      grouped.unshift([message]);
      message.addAvatar = true;
    }
    return grouped;
  }, []);
}
function groupMessages() {
  const messages = _.get(window, "data.chat.messages", false);
  if (!messages) {
    return false;
  }
  storeNewMessageFlagIfNeeded(messages);
  groupMessagesByDay(messages);
  groupMessagesByUser(messages);
}

window.groupMessages = groupMessages;

const thisYearFormat = {
  weekday: "long",
  month: "long",
  day: "numeric"
};

const ChatInput = {
  template: `
<div class="main-padding fixed bottom-0 left-0 w-100">
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
</div>`,
  name: "ChatInput",
  data() {
    return window.data;
  }
};

const ChatList = {
  template: `
<div>
  <div class="overflow-y-scroll" style="height: calc(100vh - 53px);" v-if="!_.isEmpty(chats)">
    <div v-for="achat in chats" class="bb" style="border-color: #c5c5c5">
      <a class="link unstyle" href="javascript:void(0)" @click="selectChat(achat)">
        <div
                class="pl3 dim"
                style="height: 62px; line-height: 62px; border-color: rgba(255, 255, 255, .25);"
        >
          <div class="fl">
            <img
                    class="v-mid w2 br-100"
                    :src="achat.image_url"
                    alt=""
                    v-if="achat.image_url"
            />
            <div class="flex items-center" style="height: 62px" v-else>
              <div class="br-100 w2 h2 v-mid bg-black"></div>
            </div>
          </div>
          <span class="fl pl2 ttc w-80 truncate">{{ achat.title }}</span>
          <div
                  v-if="chat.key === achat.key"
                  class="fr bg-brand2 h-100"
                  style="width: 6px;transform: translateX(-1px)"
          ></div>
        </div>
      </a>
    </div>
  </div>
</div>`,
  name: "ChatList",
  data() {
    return window.data;
  },
  methods: {
    selectChat(chat) {
      this.chat = chat;
      this.loadedOldestMessage = false;
      groupMessages();
      // scroll to bottom since new chat selected
      this.$nextTick(() => {
        document.getElementById("side-navigation").classList.toggle("dn");
        const messagesEl = document.getElementById("messages");
        if (messagesEl) {
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
      });
    }
  }
};

const ChatMessages = {
  template: `
<div>
  <div
    id="messages"
    class="pb2 overflow-y-scroll"
    style="padding-top: 58px; height: calc(100vh - 53px); -webkit-overflow-scrolling: touch; word-wrap: break-word;"
    v-on:scroll="handleScroll($event)"
    @click="closeChatListIfOpen"
    v-if="!loading && _.get(chat, 'messages', []).length"
  >
    <div
      class="tc pb2"
      v-show="!loadedOldestMessage && !loading && chat.messages.length >= 50"
    >
      <div class="dib busy" style="line-height: 24px;"></div>
    </div>

    <!-- Chat Body -->
    <div class="ph2" v-for="message in chat.messages" v-show="!loading">
      <!-- Day Divider -->
      <div v-if="message.addDayDivider">
        <hr style="border: 1px #e7e7e8 solid" />
        <div class="tc" style="position:relative;top:-19px;">
          <span class="bg-passive ph3 br4">{{
            parseTime(message.timestamp)
          }}</span>
        </div>
      </div>

      <div class="hover-bg-white">
        <div v-if="message.addAvatar">
          <div class="fl pt2" style="width: 37px">
            <!-- Avatar -->
            <img
              class="w2 h2 br-100 v-mid"
              :src="chat.users[message.user_id].image_url"
              v-if="chat.users[message.user_id].image_url"
              alt="avatar"
            />
            <img
              src="data:image/gif;base64,R0lGODlhAQABAAD/ACwAAAAAAQABAAACADs="
              class="br-100 w2 h2 v-mid bg-black"
              alt="default avatar"
              v-else
            />
          </div>
          <div class="dib b pr1 lh-copy">
            {{ chat.users[message.user_id].name }}
          </div>
          <div class="dib gray fs14">
            {{
              new Date(message.timestamp * 1000).toLocaleTimeString("en-US", {
                hour: "2-digit",
                minute: "2-digit",
                hour12: true
              })
            }}
          </div>
        </div>
        <div>
          <!-- New Message Flag -->
          <div class="tc" v-show="newMessageId !== false">
            <div
              id="new_messages"
              class="tc light-red br4 ph2 fs12 ba center dib"
              v-if="newMessageId === message.id && !hidden"
            >
              New Messages
            </div>
          </div>

          <div
            :title="
              new Date(message.timestamp * 1000).toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                hour12: true
              })
            "
            class="lh-copy hover-bg-white"
            style="padding-left: 37px"
          >
            <div
              :class="{ 'message-time': !message.addAvatar }"
              :id="'message_' + message.id"
            >
              {{ message.text }}
              <!-- Message Time -->
              <div class="fr" v-if="!message.addAvatar">
                {{
                  new Date(message.timestamp * 1000).toLocaleTimeString(
                    "en-US",
                    {
                      hour: "2-digit",
                      minute: "2-digit",
                      hour12: true
                    }
                  )
                }}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
  <div v-else>
    <div class="w-100 dt" style="height: calc(100vh - 40px - 51px);">
      <div class="dtc v-mid tc gray">Starting a conversation 🎉</div>
    </div>
  </div>
</div>`,
  name: "ChatMessages",
  data() {
    return window.data;
  },
  computed: {
    withUsers: function() {
      return _.keys(this.chat.users).filter(id => id !== this.chat.you);
    },
    hidden: function() {
      return document.hidden;
    }
  },
  methods: {
    sendMessage: function() {
      if (!this.text) {
        return false;
      }
      Api.chat
        .sendMessage(this.chat.key, this.text)
        .then(() => {
          this.text = "";
        })
        .catch(() => {
          this.newMessageId = false;
        });
      const messagesEl = document.getElementById("messages");
      if (messagesEl) {
        messagesEl.scrollTop = messagesEl.scrollHeight;
      }
    },
    parseTime: function(time) {
      const day = new Date(time * 1000);
      // set to midnight
      day.setHours(0, 0, 0, 0);
      const currentDate = new Date();
      // set to midnight
      currentDate.setHours(0, 0, 0, 0);
      if (currentDate.getTime() === day.getTime()) {
        return "Today";
      }
      currentDate.setDate(currentDate.getDate() - 1);
      const yesterday = new Date(currentDate);
      if (yesterday === day.getTime()) {
        return "Yesterday";
      }
      return day.toLocaleDateString("en-US", thisYearFormat);
    },
    updateRead: function() {
      Api.chat
        .updateRead(this.chat.key)
        .then(console.log)
        .catch(console.log);
    },
    handleScroll: function(e) {
      if (this.loadedOldestMessage) {
        return false;
      }
      this.scrollTop = e.target.scrollTop;
      if (!this.scrollTop) {
        console.log("Load older messages.");
        const messagesEl = document.getElementById("messages");
        const originalScrollHeight = messagesEl.scrollHeight;
        const id = this._.keys(this._.keyBy(this.chat.messages, "id"))[0];
        Api.chat
          .getOlderMessages(this.chat.key, id)
          .then(res => res.data)
          .then(data => {
            if (data.success) {
              console.log(data.message);
              this.loadedOldestMessage = true;
              return false;
            }
            const messages = data.concat(this.chats[this.chat.key].messages);
            this.chats[this.chat.key].messages = messages;
            groupMessages();
            this.$nextTick(function() {
              const scrollDiff = messagesEl.scrollHeight - originalScrollHeight;
              console.log("Scroll diff", scrollDiff);
              messagesEl.scrollTop += scrollDiff;
            });
          });
      }
    },
    closeChatListIfOpen() {
      const el = document.getElementById("side-navigation");
      if (el.classList.value.indexOf("dn") === -1) {
        el.classList.toggle("dn");
      }
    }
  }
};

const ChatTitle = {
  template: `
<div>
  <div
    class="fixed w-100 bb pa2 z-1 bg-passive pointer"
    style="border-color: gainsboro"
  >
    <div class="fl" style="height: 38px;">
      <div
        class="db dn-l f3 pointer black"
        style="line-height: 38px; width: 37px"
        onclick="document.getElementById('side-navigation').classList.toggle('dn')"
      >
        ☰
      </div>
    </div>

    <div @click="visitProject" v-if="chat">
      <div class="ttc pb1">{{ chat.title }}</div>
      <div class="fw2 f6 flex items-center" v-if="online.length">
        <!-- Online Status -->
        <div
          class="br-100 bg-green ba b--white mr1"
          style="width: 10px; height: 10px;"
          title="active"
          v-if="online.indexOf(withUsers[0]) !== -1"
        ></div>
        <div
          class="br-100 bg-red ba b--white mr1"
          style="width: 10px; height: 10px;"
          title="offline"
          v-else
        ></div>
        <div class="ttc pr1">{{ chat.users[withUsers[0]].name }}</div>
        <div
          v-show="
            typing.indexOf(withUsers[0] + '_' + chat.key) !== -1 &&
              online.indexOf(withUsers[0]) !== -1
          "
        >
          is typing...
        </div>
      </div>
    </div>
  </div>
</div>`,
  name: "ChatTitle",
  data() {
    return window.data;
  },
  computed: {
    withUsers: function() {
      return _.keys(_.get(this, "chat.users", {})).filter(
        id => id !== this._.get(this, "chat.you")
      );
    }
  },
  methods: {
    visitProject: function() {
      window.parent.location.href = this.chat.url;
    }
  }
};

const Chat = {
  template: `
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
</div>`,
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

window.data = window.data || {};
_.defaults(window.data, {
  chat: false,
  chats: {},
  online: [],
  loading: false,
  text: "",
  typing: [],
  chatHeight: 400,
  loadedOldestMessage: false,
  newMessageId: false
});

Object.defineProperty(Vue.prototype, "_", { value: _ });

const Components = {
  Chat
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

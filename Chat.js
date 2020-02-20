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
      window.data.byDay[time] = window.data.byDay[time] || Vue.set(window.data.byDay, time, []);
      window.data.byDay[time].push(message)
    } else {
      message.addDayDivider = false;
      window.data.byDay[time].push(message)
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
  window.data.byDay = {};
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
      v-on:keyup.enter="sendMessage"
      v-on:keyup.esc="updateRead"
      v-on:keyup="sendTypingEvent"
      autocomplete="off"
    />
  </div>
</div>`,
  name: "ChatInput",
  data() {
    return window.data;
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
      this.updateRead();
    },
    updateRead: function() {
      console.log("Update read.")
      this.$emit("update-read", {key: this.chat.key});
      Api.chat
        .updateRead(this.chat.key)
        .then(console.log)
        .catch(console.log);
    },
    throttleTyping: this._.throttle(function() {
      if (this._.get(this, "chat.key", false)) {
        window.socket.emit("typing", this.chat.key);
      }
    }, 1000),
    sendTypingEvent: function() {
      if (this.text) {
        this.throttleTyping();
      }
    }
  }
};

const ChatListItem = {
  template: `
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
  `,
  data() {
    return window.data
  },
  props: ['achat'],
  methods: {
    selectChat(chat) {
      this.chat = chat;
      this.loadedOldestMessage = false;
      // scroll to bottom since new chat selected
      this.$nextTick(() => {
        document.getElementById("side-navigation").classList.toggle("dn");
        const messagesEl = document.getElementById("messages");
        if (messagesEl) {
          messagesEl.scrollTop = messagesEl.scrollHeight;
        }
      });
    }
  },
};

const ChatList = {
  template: `
<div>
  <div class="overflow-y-scroll" style="height: calc(100vh - 53px);" v-if="!_.isEmpty(chats)">
    <div v-for="achat in _.filter(chats, 'hasUnreadMessages')"  class="bb b" style="border-color: #c5c5c5">
      <ChatListItem :achat="achat"></ChatListItem>
    </div>
    <div v-for="achat in _.filter(chats, chat => _.get(chat, 'hasUnreadMessages', false) === false)" class="bb" style="border-color: #c5c5c5">
      <ChatListItem :achat="achat"></ChatListItem>
    </div>
  </div>
</div>`,
  name: "ChatList",
  data() {
    return window.data;
  },
  components: {
    ChatListItem
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
    <div class="ph2" v-for="(messages, day) in byDay" v-show="!loading">
      <!-- Day Divider -->
      <div class="sticky top-0 bg-passive">
        <div class="tc" style="position:relative;top:-2px;">
          <div class="ph3 bg-passive f6 bb pv1" style="border-color: #e7e7e8;">{{
            parseTime(day)
          }}</div>
        </div>
      </div>
      
      <div v-for="message in messages">
        <div class="hover-bg-white">
          <div v-if="message.addAvatar && !message.system">
            <div class="fl pt2" style="width: 37px">
              <!-- Avatar -->
              <img
                class="w2 h2 br-100 v-mid"
                :src="chat.users[message.user_id].image_url"
                v-if="_.get(chat, ['users', message.user_id, 'image_url'], false)"
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
  
            <!-- System message -->
            <div class="tc f6 gray" v-if="message.system">
              {{ message.text }}
            </div>
            <!-- User message -->
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
              v-else
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
      console.log("Update read.");
      this.$emit("update-read", {key: this.chat.key});
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
        this.$emit("get-older-messages", {key: this.chat.key, message_id: id, originalScrollHeight: originalScrollHeight});
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

const ChatSettings = {
  template: `
<div>
  <div class="relative z-2">
    <div class="w4 tc white bg-gray bn f6 br2 brand-shadow2">
      <div class="tr bb pr2" @click="settingsPaneOpen = false;">
        x
      </div>
      <div class="br2 dim light-red" @click="$emit('leave-chat')">
        Leave chat
      </div>
    </div>
  </div>
  <div class="fixed top-0 bottom-0 left-0 right-0 z-1" @click="settingsPaneOpen = false;"></div>
</div>
`,
  data: function() {
    return window.data
  }
};

const ChatTitle = {
  template: `
<div>
  <div
    class="main-padding fixed w-100 bb pa2 z-1 bg-passive pointer"
    style="border-color: gainsboro; height: 56px"
  >
    <div class="fl pl2" style="height: 38px;">
      <div
        class="db dn-l f3 pointer black"
        style="line-height: 38px; width: 37px"
        onclick="document.getElementById('side-navigation').classList.toggle('dn')"
      >
        ☰
      </div>
    </div>

    <div class="pl3" v-if="chat">
      <div class="fl" @click="visitProject">
        <div class="ttc pb1">{{ chat.title }}</div>
        <div class="fw2 f6 flex items-center">
          <div class="flex items-center" v-for="user in user_states">
            <!-- Online Status -->
            <div
              class="br-100 bg-green ba b--white mr1"
              style="width: 10px; height: 10px;"
              title="active"
              v-if="user.online"
            ></div>
            <div
              class="br-100 bg-red ba b--white mr1"
              style="width: 10px; height: 10px;"
              title="offline"
              v-else
            ></div>
            <div class="ttc pr1">{{ user.name }}</div>
            <div
              v-show="user.typing"
            >
              is typing...
            </div>
          </div>
        </div>
      </div>
      <div class="fr db pointer gray" style="line-height: 38px;">
        <div v-show="settingsPaneOpen === false" class="f3 fr" @click="settingsPaneOpen = true">☲</div>
        
        <ChatSettings v-if="settingsPaneOpen"
            v-on:leave-chat="$emit('leave-chat')"
        ></ChatSettings>
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
    },
    user_states: function () {
      const withUsers = this.withUsers;
      const states = withUsers.map(user_id => {
        const typing = this.typing.indexOf(withUsers[user_id] + '_' + chat.key) !== -1 &&
          this.online.indexOf(withUsers[user_id]) !== -1;
        const online = this.online.indexOf(withUsers[user_id]) !== -1
        return {
          typing: typing,
          online: online,
          name: this.chat.users[parseInt(user_id)].name
        }
      });
      return states;
    }
  },
  methods: {
    visitProject: function() {
      window.parent.location.href = this.chat.url;
    }
  },
  components: {
    ChatSettings
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

  <ChatTitle
    v-on:leave-chat="$emit('leave-chat')"
  ></ChatTitle>

  <main class="main-padding">
    <div id="chat" class="min-vh-100 bg-passive">
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
    "chat": groupMessages,
    "chat.read": groupMessages
  }
};

window.data = window.data || {};
_.defaults(window.data, {
  byDay: {},
  chat: false,
  chats: {},
  online: [],
  loading: false,
  text: "",
  typing: [],
  chatHeight: 400,
  loadedOldestMessage: false,
  newMessageId: false,
  settingsPaneOpen: false
});

Object.defineProperty(Vue.prototype, "_", { value: _ });

const Components = {
  Chat
};

Object.keys(Components).forEach(name => {
  Vue.component(name, Components[name]);
});

<template>
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
  </div>
</template>

<script>
import groupMessages from "../chat";

const thisYearFormat = {
  weekday: "long",
  month: "long",
  day: "numeric"
};
export default {
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
              const scrollDiff =
                messagesEl.scrollHeight - originalScrollHeight;
              console.log("Scroll diff", scrollDiff);
              messagesEl.scrollTop += scrollDiff;
            });
          });
      }
    },
    closeChatListIfOpen() {
      const el = document.getElementById('side-navigation');
      if (el.classList.value.indexOf('dn') === -1) {
        el.classList.toggle('dn');
      }
    }
  }
};
</script>

<style scoped>
.fs14 {
  font-size: 14px;
}
.message-time div {
  display: none;
}
.message-time:hover div {
  display: block;
}
.bg-passive {
  background-color: #f9fafb;
}
</style>

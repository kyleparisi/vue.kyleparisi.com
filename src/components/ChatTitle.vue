<template>
  <div>
    <div
      class="relative w-100 bb pa2 z-1 bg-passive"
      style="border-color: gainsboro;height: 56px"
    >
      <div class="fl" style="height: 38px;">
        <div
          class="db dn-l f3 pointer black"
          style="line-height: 38px; width:
        37px"
          @click="$emit('open-chat-list')"
        >
          ☰
        </div>
      </div>

      <div class="pointer" @click="$emit('chat-title-clicked')">
        <div class="ttc pb1">{{ _.get(chat, "title", "") }}</div>
        <div class="fw2 f6 flex items-center">
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
            v-if="withUsers.length && online.indexOf(withUsers[0]) === -1"
          ></div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  data() {
    return window.data;
  },
  computed: {
    withUsers: function() {
      return _.keys(_.get(this, "chat.users", {})).filter(id => id !== this._.get(this, "chat.you"));
    }
  }
};
</script>

<template>
  <div>
    <div class="overflow-y-scroll" style="height: calc(100vh - 53px);" v-if="!_.isEmpty(chats)">
      <div v-for="achat in chats" class="bb" style="border-color: #c5c5c5">
        <a class="link" href="javascript:void(0)" @click="$emit('select-chat', achat)">
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
  </div>
</template>

<script>
  export default {
    data() {
      return window.data;
    }
  };
</script>

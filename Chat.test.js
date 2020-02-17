function randomMessage() {
  return faker.lorem.words(
    faker.random.number({
      min: 1,
      max: 15
    })
  );
}
function fakeChat(key) {
  return {
    title: faker.random.words(5),
    image_url: false,
    owner: "1",
    read: "0",
    hasUnreadMessages: faker.random.boolean(),
    key,
    users: {
      "1": {
        id: "1",
        name: faker.name.findName(),
        image_url: false
      },
      "2": {
        id: "2",
        name: faker.name.findName(),
        image_url: false
      }
    },
    messages: []
  };
}

$(document).ready(async () => {
  new Vue({ el: "#chat" });

  await Vue.nextTick();
  data.chat = {
    title: "test chat",
    image_url: false,
    owner: "1",
    read: "0",
    key: faker.random.uuid(),
    users: {
      "1": {
        id: "1",
        name: faker.name.findName(),
        image_url: false
      },
      "2": {
        id: "2",
        name: faker.name.findName(),
        image_url: false
      }
    },
    messages: []
  };

  console.log("Test: First message received.");
  window.data.chat.messages.push({
    id: "1",
    key: faker.random.uuid(),
    timestamp: String(Math.floor(Date.now() / 1000) - (24 * 3600) - 500),
    text: randomMessage(),
    deleted: "0",
    edited: "0",
    chat_id: "1",
    user_id: "2"
  });
  await Vue.nextTick();
  console.assert(
    document.getElementById("new_messages") !== null,
    "New message element should exist."
  );

  console.log("Test: Read updated.");
  data.chat.read = String(Math.floor(Date.now() / 1000) - 490);
  await Vue.nextTick();
  console.assert(
    document.getElementById("new_messages") === null,
    "New message element should not exist."
  );

  console.log("Test: Second message added.");
  window.data.chat.messages.push({
    id: "2",
    key: faker.random.uuid(),
    timestamp: String(Math.floor(Date.now() / 1000) - (24 * 3600) - 480),
    text: randomMessage(),
    deleted: "0",
    edited: "0",
    chat_id: "1",
    user_id: "2"
  });
  groupMessages();
  await Vue.nextTick();
  console.assert(
    document.getElementById("message_2") !== null,
    "New message should be added to view."
  );

  console.log("Test: Message from own user.");
  window.data.chat.messages.push({
    id: "3",
    key: faker.random.uuid(),
    timestamp: String(Math.floor(Date.now() / 1000) - (24 * 3600) - 470),
    text: randomMessage(),
    deleted: "0",
    edited: "0",
    chat_id: "1",
    user_id: "1"
  });
  data.chat.read = String(Math.floor(Date.now() / 1000) - 470);
  await Vue.nextTick();
  console.assert(
    document.getElementById("message_3") !== null,
    "New message should be added to view."
  );

  const key2 = faker.random.uuid();
  data.chats = {
    [data.chat.key]: data.chat,
    [key2]: {
      title: faker.random.words(5),
      image_url: false,
      owner: "1",
      read: "0",
      key: key2,
      users: {
        "1": {
          id: "1",
          name: faker.name.findName(),
          image_url: false
        },
        "2": {
          id: "2",
          name: faker.name.findName(),
          image_url: false
        }
      },
      messages: []
    }
  };
  await Vue.nextTick();

  data.online = ["1"];
  await Vue.nextTick();

  // 50 messages
  for (var i = 4; i < 54; i++) {
    window.data.chat.messages.push({
      id: String(i),
      key: faker.random.uuid(),
      timestamp: String(Math.floor(Date.now() / 1000)),
      text: randomMessage(),
      deleted: "0",
      edited: "0",
      chat_id: "1",
      user_id: faker.random.arrayElement(["1", "2"])
    });
  }
  groupMessages();
  await Vue.nextTick();

  // 50 chats
  const fiftyChats = {};
  for (var i = 0; i < 50; i++) {
    const id = faker.random.uuid();
    fiftyChats[id] = fakeChat(id);
  }
  data.chats = {
    ...data.chats,
    ...fiftyChats
  };
});

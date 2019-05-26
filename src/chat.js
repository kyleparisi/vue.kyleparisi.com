import _ from "lodash";

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

export default groupMessages;

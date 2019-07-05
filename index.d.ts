type user = {
  id: string
  name: string
  image_url: string
}

type message = {
  id: string
  key: string
  timestamp: string
  text: string
  deleted: string
  edited: string
  chat_id: string
  user_id: string
}

type chat = {
  key: string
  title: string
  you: string
  url: string
  image_url: string
  // id of user
  owner: string
  read: string
  users: {
    [id: string] : user
  }
  messages: Array<message>
}

type chats = {
  [key: string]: chat
}

// Socket Connection
const socket = io();

// DOM Elements
const messageContainer = document.getElementById("message-container");
const roomContainer = document.getElementById("room-container");
const messageForm = document.getElementById('send-container')
const messageInput = document.getElementById("message-input");

// const sendBtn = document.getElementById("send-button");


if (messageForm != null) {

  // Getting user name
  const name = prompt("Enter your name: ");
  appendMessage("You joined the chat!!!");
  console.log(roomName,name);
  socket.emit("new-user-joined", roomName, name);

  // Send messages
  // sendBtn.addEventListener("click", (event) => {
  messageForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const message = messageInput.value;
    appendMessage(`You: ${message}`);
    socket.emit("send-chat-message", message,roomName);
    messageInput.value = "";
  });
}
// New room created
socket.on('room-created', (roomName) => {
  const roomElement = document.createElement("div");
  roomElement.innerText = roomName;
  const roomLink = document.createElement("a");
  roomLink.href = `/${roomName}`;
  roomLink.innerText = 'join';
  roomContainer.append(roomElement);
  roomContainer.append(roomLink);
});

// New user join message
socket.on("new-user-name", (name) => {
  appendMessage(`${name.toUpperCase()} has joined the chat.`);
});

// Receive message
socket.on("receive-chat-message", ({name,message}) => {
  appendMessage(`${name}: ${message}`);
});

// User disconnected
socket.on('user-disconnected', name => {
  appendMessage(`${name} has left the chat.`)
})


// Appending into DOM Functions
function appendMessage(message) {
  const messageElement = document.createElement("div");
  messageElement.innerText = message;
  messageContainer.append(messageElement);
}
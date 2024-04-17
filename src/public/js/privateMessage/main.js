setTheme();

const socket = io();

const url = window.location.pathname;
const privateMessageId = url.substring(url.lastIndexOf("/") + 1);

socket.emit("joinRoom", {
  roomId: privateMessageId
});

const messagesList = document.getElementById("private-message__messages");
messagesList.scrollTop = messagesList.scrollHeight;

socket.on("receiveMessage", (e) =>
  appendMessageListElement(e.userId, e.messageId, e.username, e.message)
);

const appendMessageListElement = (userId, messageId, username, message) => {
  const li = document.createElement("li");
  li.id = messageId;

  const a = document.createElement("a");
  a.href = `/user/${userId}`;
  a.innerText = username;

  const p = document.createElement("p");
  p.innerHTML = message;

  li.appendChild(a);
  li.appendChild(p);

  document.getElementById("private-message__messages").appendChild(li);
};

const sendMessageButton = document.getElementById(
  "private-message__send-button"
);

const sendMessage = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    const url = window.location.pathname;
    const privateMessageId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...requestBody,
        privateMessageId: privateMessageId
      })
    });
    const responseBody = await response.json();

    hideLoader();
    if (response.ok) {
      e.target.form.reset();
      socket.emit("sendMessage", {
        roomId: privateMessageId,
        messageId: responseBody.data.messageId,
        userId: responseBody.data.userId,
        username: responseBody.data.username,
        message: responseBody.data.message
      });
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      printMessage(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

sendMessageButton.addEventListener("click", async (e) => await sendMessage(e));

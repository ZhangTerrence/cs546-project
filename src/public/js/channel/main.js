setTheme();

const socket = io();

const url = window.location.pathname;
const channelId = url.substring(url.lastIndexOf("/") + 1);

// const messages = [];

// for (const node of document.getElementsByClassName("channel__message")) {
//   messages.push(node.textContent);
// }

socket.emit("joinRoom", {
  roomId: channelId
});

const messagesList = document.getElementById("channel__messages");
messagesList.scrollTop = messagesList.scrollHeight;

socket.on("receiveMessage", (e) =>
  appendMessageListElement(e.userId, e.username, e.message)
);

const appendMessageListElement = (userId, username, message) => {
  const li = document.createElement("li");

  const a = document.createElement("a");
  a.href = `/user/${userId}`;
  a.innerText = username;

  const p = document.createElement("p");
  p.innerHTML = message;

  li.appendChild(a);
  li.appendChild(p);

  document.getElementById("channel__messages").appendChild(li);
  messages.push(message);
};

const sendMessageButton = document.getElementById("channel__send-button");

const sendMessage = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    const url = window.location.pathname;
    const channelId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/message", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...requestBody,
        channelId: channelId
      })
    });
    const responseBody = await response.json();

    hideLoader();
    if (response.ok) {
      e.target.form.reset();
      messages.push(requestBody["message"]);
      socket.emit("sendMessage", {
        roomId: channelId,
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

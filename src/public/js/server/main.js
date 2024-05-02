setTheme();

const kickUserButtons = document.getElementsByClassName("server__kick-button");
const deleteServerButton = document.getElementById("server__delete-button");
const leaveServerButton = document.getElementById("server__leave-button");
const deleteChannelButtons = document.getElementsByClassName(
  "server__delete-button"
);
const createChannelButton = document.getElementById("server__create-button");
const unkickUserButtons = document.getElementsByClassName(
  "server__unkick-button"
);

const createBlacklistListElement = (userId, username) => {
  const li = document.createElement("li");

  const form = document.createElement("form");
  form.id = userId;

  const a = document.createElement("a");
  a.href = `/user/${userId}`;
  a.innerText = username;

  const button = document.createElement("button");
  button.innerText = "Remove";
  button.classList.add("server__unkick-button");
  button.addEventListener("click", async (e) => await unkickUser(e, button));

  form.appendChild(a);
  form.appendChild(button);

  li.appendChild(form);

  return li;
};

const leaveServer = async (e) => {
  try {
    e.preventDefault();

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/server/leave", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: serverId
      })
    });

    hideLoader();
    if (response.ok) {
      window.location.replace("/login");
      printMessage("Successfully left server.");
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const requestBody = await response.json();
      printMessage(requestBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

const kickUser = async (e, button) => {
  try {
    e.preventDefault();

    const userId = button.form.id;

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/server/kick", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        serverId: serverId
      })
    });
    const responseBody = await response.json();

    hideLoader();
    if (response.ok) {
      printMessage("Successfully kicked user.");
      button.form.remove();
      document
        .getElementById("server__blacklist-list")
        .appendChild(
          createBlacklistListElement(
            responseBody.data.id,
            responseBody.data.username
          )
        );
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

const unkickUser = async (e, button) => {
  try {
    e.preventDefault();

    const userId = button.form.id;

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/server/unkick", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        userId: userId,
        serverId: serverId
      })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully unkicked user.");
      button.form.remove();
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const requestBody = await response.json();
      printMessage(requestBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

const deleteServer = async (e) => {
  try {
    e.preventDefault();

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/server", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        serverId: serverId
      })
    });

    hideLoader();
    if (response.ok) {
      window.location.replace("/login");
      printMessage("Successfully deleted server.");
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const requestBody = await response.json();
      printMessage(requestBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

async function deleteChannel(e, button) {
  try {
    e.preventDefault();

    const channelId = button.form.id;

    showLoader();
    const response = await fetch("/api/channel", {
      method: "DELETE",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        channelId: channelId
      })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully deleted channel.");
      button.form.remove();
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const requestBody = await response.json();
      printMessage(requestBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
}

const createChannel = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);


    if (!requestBody.name || requestBody.name.trim() === '') {
      printMessage("Expected a nonempty string for name.");
      return; 
    }

    if (requestBody.description && requestBody.description.length > 255) {
      printMessage("Channel description must not exceed 255 characters.");
      return; 
    }

    if (!/^[a-z0-9]+$/i.test(requestBody.name) || requestBody.name.length < 3 || requestBody.name.length > 20) {
      printMessage("Channel name must be 3-20 alphanumeric characters.");
      return; 
    }

    if (!/^[0-9]$/.test(requestBody.permissionLevel)) {
      printMessage("Permission level must be a single digit from 0 to 9.");
      return; 
    }

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

    showLoader();
    const response = await fetch("/api/channel", {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...requestBody,
        serverId: serverId
      })
    });
    const responseBody = await response.json();

    hideLoader();
    if (response.ok) {
      window.location.replace(responseBody.data.url);
      printMessage("Successfully created channel.");
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

if (kickUserButtons) {
  Array.from(kickUserButtons).forEach((button) =>
    button.addEventListener("click", async (e) => await kickUser(e, button))
  );
}

if (unkickUserButtons) {
  Array.from(unkickUserButtons).forEach((button) =>
    button.addEventListener("click", async (e) => await unkickUser(e, button))
  );
}

if (deleteServerButton) {
  deleteServerButton.addEventListener(
    "click",
    async (e) => await deleteServer(e)
  );
}

if (leaveServerButton) {
  leaveServerButton.addEventListener(
    "click",
    async (e) => await leaveServer(e)
  );
}

if (deleteChannelButtons) {
  Array.from(deleteChannelButtons).forEach((button) =>
    button.addEventListener(
      "click",
      async (e) => await deleteChannel(e, button)
    )
  );
}

if (createChannelButton) {
  createChannelButton.addEventListener(
    "click",
    async (e) => await createChannel(e)
  );
}

setTheme();

const leaveServerButtons = document.getElementsByClassName(
  "server__leave-button"
);
const kickUserButtons = document.getElementsByClassName("server__kick-button");
const deleteServerButton = document.getElementById("server__delete-button");
const leaveServerButton = document.getElementById("server__leave-button");
const deleteChannelButtons = document.getElementsByClassName(
  "server__delete-button"
);
const createChannelButton = document.getElementById("server__create-button");

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

    hideLoader();
    if (response.ok) {
      printMessage("Successfully kicked user.");
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
      printMessage("Successfully deleted server.");
      window.location.replace("/login");
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

    console.log(response, responseBody);

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

if (leaveServerButtons) {
  Array.from(leaveServerButtons).forEach((button) =>
    button.addEventListener("click", async (e) => await leaveServer(e))
  );
}

if (kickUserButtons) {
  Array.from(kickUserButtons).forEach((button) =>
    button.addEventListener("click", async (e) => await kickUser(e, button))
  );
}

if (deleteServerButton) {
  deleteServerButton.addEventListener(
    "click",
    async (e) => await deleteServer(e)
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

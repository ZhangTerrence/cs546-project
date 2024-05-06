setTheme();

const updateChannelButton = document.getElementById("edit__update-button");

const updateChannel = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    if (
      !requestBody.name ||
      !/^[a-z0-9]+$/i.test(requestBody.name) ||
      requestBody.name.length < 3 ||
      requestBody.name.length > 20
    ) {
      printMessage("Channel name must be 3-20 alphanumeric characters.");
      return;
    }

    if (requestBody.description && requestBody.description.length > 255) {
      printMessage("Description must not exceed 255 characters.");
      return;
    }

    if (!/^[0-9]$/.test(requestBody.permissionLevel)) {
      printMessage("Permission level must be a single digit from 0 to 9.");
      return;
    }

    const urlTokens = window.location.pathname.split("/");
    const serverId = urlTokens[2];
    const channelId = urlTokens[urlTokens.length - 1];

    showLoader();
    const response = await fetch("/api/server/edit/channel", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({
        ...requestBody,
        serverId: serverId,
        channelId: channelId
      })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully updated channel.");
    } else {
      if (response.status === 401) {
        window.location.replace("/login");
        return;
      }
      const responseBody = await response.json();
      printMessage(responseBody.error);
    }
  } catch (error) {
    hideLoader();
    printMessage(error.message);
  }
};

if (updateChannelButton) {
  updateChannelButton.addEventListener(
    "click",
    async (e) => await updateChannel(e)
  );
}

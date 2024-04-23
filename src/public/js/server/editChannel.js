setTheme();

const updateChannelButton = document.getElementById("edit__update-button");

const updateChannel = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

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

setTheme();

const updateServerButton = document.getElementById("edit__update-button");

const updateServer = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    if (
      !/^[a-z0-9]+$/i.test(requestBody.name) ||
      requestBody.name.length < 3 ||
      requestBody.name.length > 20
    ) {
      printMessage("Server name must be 3-20 alphanumeric characters.");
      return;
    }

    if (requestBody.description.length > 255) {
      printMessage("Server description must not exceed 255 characters.");
      return;
    }

    const urlTokens = window.location.pathname.split("/");
    const serverId = urlTokens[2];

    showLoader();
    const response = await fetch("/api/server", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ ...requestBody, serverId: serverId })
    });

    hideLoader();
    if (response.ok) {
      printMessage("Successfully updated server.");
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

if (updateServerButton) {
  updateServerButton.addEventListener(
    "click",
    async (e) => await updateServer(e)
  );
}

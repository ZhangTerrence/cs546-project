setTheme();

const updateServerButton = document.getElementById("edit__update-button");

const updateServer = async (e) => {
  try {
    e.preventDefault();

    const requestBody = getFormRequestBody(e.target);

    const url = window.location.pathname;
    const serverId = url.substring(url.lastIndexOf("/") + 1);

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
